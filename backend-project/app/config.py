import os
from pathlib import Path

from dotenv import load_dotenv


APP_DIR = Path(__file__).resolve().parent
load_dotenv(APP_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
DATABASE_NAME = os.getenv("DATABASE_NAME", "unbiased_ai_decision_system").strip()
JWT_SECRET = os.getenv("JWT_SECRET", "unbiased_secret_key_2026").strip()
PORT = int(os.getenv("PORT", "8001"))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").strip().rstrip("/")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", f"http://localhost:{PORT}/auth/google/callback").strip()
