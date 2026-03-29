"""Railway DB에 스키마를 생성하는 스크립트 (최초 1회 실행)"""
from app.database import engine, Base
import app.models  # noqa: F401 — 모델 등록

Base.metadata.create_all(bind=engine)
print("✅ 테이블 생성 완료")
