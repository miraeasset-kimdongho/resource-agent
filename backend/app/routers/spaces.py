from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..dependencies import get_current_user, require_teacher

router = APIRouter(prefix="/api/spaces", tags=["spaces"])


@router.get("", response_model=List[schemas.SpaceOut])
def list_spaces(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(models.Space).all()


@router.get("/{space_id}", response_model=schemas.SpaceOut)
def get_space(space_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    space = db.query(models.Space).filter(models.Space.id == space_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    return space


@router.post("", response_model=schemas.SpaceOut, status_code=201)
def create_space(
    body: schemas.SpaceCreate,
    db: Session = Depends(get_db),
    teacher=Depends(require_teacher),
):
    space = models.Space(**body.model_dump(), created_by=teacher.id)
    db.add(space)
    db.commit()
    db.refresh(space)
    return space


@router.put("/{space_id}", response_model=schemas.SpaceOut)
def update_space(
    space_id: int,
    body: schemas.SpaceUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_teacher),
):
    space = db.query(models.Space).filter(models.Space.id == space_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")

    for k, v in body.model_dump(exclude_none=True).items():
        setattr(space, k, v)
    db.commit()
    db.refresh(space)
    return space


@router.delete("/{space_id}", status_code=204)
def delete_space(
    space_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_teacher),
):
    space = db.query(models.Space).filter(models.Space.id == space_id).first()
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    db.delete(space)
    db.commit()
