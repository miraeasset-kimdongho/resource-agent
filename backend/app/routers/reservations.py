from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user, require_teacher, require_student

router = APIRouter(prefix="/api/reservations", tags=["reservations"])


@router.get("", response_model=List[schemas.ReservationOut])
def list_reservations(db: Session = Depends(get_db), user=Depends(get_current_user)):
    q = db.query(models.Reservation)
    if user.role == "student":
        q = q.filter(models.Reservation.user_id == user.id)
    return q.order_by(models.Reservation.date, models.Reservation.period).all()


@router.post("", response_model=schemas.ReservationOut, status_code=201)
def create_reservation(
    body: schemas.ReservationCreate,
    db: Session = Depends(get_db),
    student=Depends(require_student),
):
    # 공간 상태 확인
    space = db.query(models.Space).filter(models.Space.id == body.space_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    if space.status == "maintenance":
        raise HTTPException(status_code=400, detail="현재 사용 불가한 공간입니다")

    reservation = models.Reservation(
        user_id=student.id,
        space_id=body.space_id,
        date=body.date,
        period=body.period,
    )
    db.add(reservation)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # Partial UNIQUE Index 위반 → 동시 예약 충돌
        raise HTTPException(status_code=409, detail="해당 시간은 이미 예약되어 있습니다")
    db.refresh(reservation)
    return reservation


@router.patch("/{reservation_id}/status", response_model=schemas.ReservationOut)
def update_status(
    reservation_id: int,
    body: schemas.ReservationStatusUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_teacher),
):
    reservation = db.query(models.Reservation).filter(models.Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if reservation.status != "pending":
        raise HTTPException(status_code=400, detail="대기 중인 예약만 처리할 수 있습니다")

    # 낙관적 잠금: version 불일치 시 충돌 감지
    rows = (
        db.query(models.Reservation)
        .filter(
            models.Reservation.id == reservation_id,
            models.Reservation.version == body.version,
        )
        .update({"status": body.status, "version": body.version + 1})
    )
    if rows == 0:
        db.rollback()
        raise HTTPException(status_code=409, detail="동시 수정 충돌. 다시 시도해주세요")
    db.commit()
    db.refresh(reservation)
    return reservation


@router.delete("/{reservation_id}", status_code=204)
def cancel_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    student=Depends(require_student),
):
    reservation = db.query(models.Reservation).filter(
        models.Reservation.id == reservation_id,
        models.Reservation.user_id == student.id,
    ).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if reservation.status != "pending":
        raise HTTPException(status_code=400, detail="승인 완료된 예약은 취소할 수 없습니다")

    reservation.status = "cancelled"
    db.commit()
