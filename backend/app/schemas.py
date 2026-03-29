from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import date


# ── Auth ──────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["student", "teacher"]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── User ─────────────────────────────────────────────
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str

    model_config = {"from_attributes": True}


# ── Space ────────────────────────────────────────────
class SpaceCreate(BaseModel):
    name: str
    location: Optional[str] = None
    capacity: Optional[int] = None


class SpaceUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[int] = None
    status: Optional[Literal["available", "maintenance"]] = None


class SpaceOut(BaseModel):
    id: int
    name: str
    location: Optional[str]
    capacity: Optional[int]
    status: str

    model_config = {"from_attributes": True}


# ── Reservation ──────────────────────────────────────
class ReservationCreate(BaseModel):
    space_id: int
    date: date
    period: int  # 1~8


class ReservationStatusUpdate(BaseModel):
    status: Literal["approved", "rejected"]
    version: int  # 낙관적 잠금


class ReservationOut(BaseModel):
    id: int
    space_id: int
    space: SpaceOut
    date: date
    period: int
    status: str
    version: int

    model_config = {"from_attributes": True}


# ── Availability ─────────────────────────────────────
class SlotAvailability(BaseModel):
    date: date
    period: int
    status: str   # "pending" | "approved"
    is_mine: bool
