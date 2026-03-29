from sqlalchemy import Column, Integer, String, Date, CheckConstraint, ForeignKey, Index
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)  # POC: 평문 저장
    role = Column(String, CheckConstraint("role IN ('student','teacher')"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    reservations = relationship("Reservation", back_populates="user")


class Space(Base):
    __tablename__ = "spaces"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    location = Column(String)
    capacity = Column(Integer)
    status = Column(String, CheckConstraint("status IN ('available','maintenance')"), default="available")
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    reservations = relationship("Reservation", back_populates="space")


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    space_id = Column(Integer, ForeignKey("spaces.id"), nullable=False)
    date = Column(Date, nullable=False)
    period = Column(Integer, CheckConstraint("period BETWEEN 1 AND 8"), nullable=False)
    status = Column(
        String,
        CheckConstraint("status IN ('pending','approved','rejected','cancelled')"),
        default="pending",
    )
    version = Column(Integer, default=0)  # 낙관적 잠금
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reservations")
    space = relationship("Space", back_populates="reservations")

    # Partial UNIQUE Index: pending/approved 상태만 (space_id, date, period) 유일성 보장
    __table_args__ = (
        Index(
            "idx_active_reservation",
            "space_id",
            "date",
            "period",
            unique=True,
            postgresql_where=Column("status").in_(["pending", "approved"]),
        ),
    )
