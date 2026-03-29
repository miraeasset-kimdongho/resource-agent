"""
STEP 4 마이그레이션 스크립트
1. 기존 예약 데이터 전체 삭제 (공간 데이터는 유지)
2. 기존 유저 비밀번호 평문 → bcrypt 해시로 변환
3. period CHECK 제약조건 1~8 → 1~5 변경
실행: DATABASE_URL=... python migrate_step4.py
"""
import os
from sqlalchemy import create_engine, text
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")
engine = create_engine(DATABASE_URL)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

with engine.begin() as conn:
    # 1. 예약 데이터 전체 삭제
    result = conn.execute(text("DELETE FROM reservations"))
    print(f"✅ 예약 데이터 {result.rowcount}건 삭제")

    # 2. 평문 비밀번호 → bcrypt 해시
    users = conn.execute(text("SELECT id, password FROM users")).fetchall()
    hashed_count = 0
    for user_id, pw in users:
        # 이미 bcrypt 해시인 경우 건너뜀 ($2b$ 로 시작)
        if pw.startswith("$2b$") or pw.startswith("$2a$"):
            continue
        hashed = pwd_context.hash(pw)
        conn.execute(text("UPDATE users SET password = :pw WHERE id = :id"), {"pw": hashed, "id": user_id})
        hashed_count += 1
    print(f"✅ 비밀번호 해시 변환 {hashed_count}건")

    # 3. period CHECK 제약조건 변경 (1~8 → 1~5)
    conn.execute(text("""
        ALTER TABLE reservations
        DROP CONSTRAINT IF EXISTS reservations_period_check
    """))
    conn.execute(text("""
        ALTER TABLE reservations
        ADD CONSTRAINT reservations_period_check CHECK (period BETWEEN 1 AND 5)
    """))
    print("✅ period CHECK 제약조건 1~5로 변경")

print("\n🎉 마이그레이션 완료")
