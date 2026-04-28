import os
import uuid
import asyncio
import hashlib
import hmac
import base64
import json
import secrets
import urllib.parse
import urllib.request
from datetime import datetime, timezone, timedelta
import pandas as pd
from typing import List, Any, Optional
from pydantic import BaseModel
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks, Request, Depends, Header
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from .database import client, db, is_using_local_db
from .services import run_bias_analysis
from .config import FRONTEND_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, JWT_SECRET
from .service_analysis import read_text_from_file, run_service_analysis

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StandardResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: str

TOKEN_TTL_HOURS = 12
PASSWORD_ITERATIONS = 210_000
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(f"{data}{padding}")


def hash_password(password: str, salt: Optional[str] = None) -> str:
    salt = salt or secrets.token_hex(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        PASSWORD_ITERATIONS,
    ).hex()
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${salt}${password_hash}"

def verify_password(password: str, stored_password: str) -> bool:
    parts = stored_password.split("$")
    if len(parts) == 4 and parts[0] == "pbkdf2_sha256":
        _, iterations, salt, expected_hash = parts
        candidate = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            int(iterations),
        ).hex()
        return hmac.compare_digest(candidate, expected_hash)

    if len(parts) == 2:
        salt, expected_hash = parts
        candidate = hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()
        return hmac.compare_digest(candidate, expected_hash)

    return False


def create_access_token(user: dict[str, Any]) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL_HOURS)
    payload = {
        "sub": user["email"],
        "role": user.get("role", "user"),
        "name": user.get("full_name", ""),
        "exp": int(expires_at.timestamp()),
    }
    payload_raw = _b64encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signature = hmac.new(JWT_SECRET.encode("utf-8"), payload_raw.encode("utf-8"), hashlib.sha256).digest()
    return f"{payload_raw}.{_b64encode(signature)}"


def create_oauth_state(role: str, redirect_path: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    payload = {
        "role": role,
        "redirect_path": redirect_path if redirect_path.startswith("/") else "/dashboard",
        "nonce": secrets.token_urlsafe(16),
        "exp": int(expires_at.timestamp()),
    }
    payload_raw = _b64encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signature = hmac.new(JWT_SECRET.encode("utf-8"), payload_raw.encode("utf-8"), hashlib.sha256).digest()
    return f"{payload_raw}.{_b64encode(signature)}"


def verify_oauth_state(state: str) -> dict[str, Any]:
    try:
        payload_raw, provided_signature = state.split(".", 1)
        expected_signature = _b64encode(
            hmac.new(JWT_SECRET.encode("utf-8"), payload_raw.encode("utf-8"), hashlib.sha256).digest()
        )
        if not hmac.compare_digest(provided_signature, expected_signature):
            raise ValueError("Invalid OAuth state signature")

        payload = json.loads(_b64decode(payload_raw))
        if int(payload.get("exp", 0)) < int(datetime.now(timezone.utc).timestamp()):
            raise ValueError("OAuth state expired")
        return payload
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid or expired Google sign-in request") from exc


def _post_form(url: str, payload: dict[str, str]) -> dict[str, Any]:
    encoded = urllib.parse.urlencode(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=encoded,
        headers={"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


def _get_json(url: str, token: str) -> dict[str, Any]:
    request = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}", "Accept": "application/json"})
    with urllib.request.urlopen(request, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


def build_frontend_google_redirect(data: dict[str, Any]) -> str:
    query = urllib.parse.urlencode(data)
    return f"{FRONTEND_URL}/auth/google/callback?{query}"


async def get_current_user(authorization: Optional[str] = Header(default=None)) -> dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication token is required")

    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload_raw, provided_signature = token.split(".", 1)
        expected_signature = _b64encode(
            hmac.new(JWT_SECRET.encode("utf-8"), payload_raw.encode("utf-8"), hashlib.sha256).digest()
        )
        if not hmac.compare_digest(provided_signature, expected_signature):
            raise ValueError("Invalid token signature")

        payload = json.loads(_b64decode(payload_raw))
        if int(payload.get("exp", 0)) < int(datetime.now(timezone.utc).timestamp()):
            raise HTTPException(status_code=401, detail="Authentication token has expired")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    user = await db.users.find_one(
        {"email": payload.get("sub"), "role": payload.get("role")},
        projection={"_id": 0, "password_hash": 0},
    )
    if not user:
        raise HTTPException(status_code=401, detail="Authenticated user no longer exists")
    return user


def require_role(*roles: str):
    async def dependency(current_user: dict[str, Any] = Depends(get_current_user)):
        if current_user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="You do not have permission to access this resource")
        return current_user

    return dependency

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str

class AdminRegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str

class ChatRequest(BaseModel):
    message: str
    language: str = "en"


@app.get("/auth/google/start")
async def google_auth_start(role: str = "user", redirect_path: str = "/dashboard"):
    if role not in {"user", "admin"}:
        raise HTTPException(status_code=400, detail="Invalid Google sign-in role")
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Google sign-in is not configured. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI to backend .env.",
        )

    state = create_oauth_state(role, redirect_path)
    query = urllib.parse.urlencode({
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
        "state": state,
    })
    return RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{query}")


@app.get("/auth/google/callback")
async def google_auth_callback(code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None):
    if error:
        return RedirectResponse(url=build_frontend_google_redirect({"error": error}))
    if not code or not state:
        return RedirectResponse(url=build_frontend_google_redirect({"error": "missing_google_code"}))

    oauth_state = verify_oauth_state(state)
    role = oauth_state.get("role", "user")
    redirect_path = oauth_state.get("redirect_path", "/dashboard")

    try:
        token_data = _post_form(GOOGLE_TOKEN_URL, {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        access_token = token_data.get("access_token")
        if not access_token:
            raise ValueError("Google did not return an access token")

        profile = _get_json(GOOGLE_USERINFO_URL, access_token)
        email = str(profile.get("email", "")).strip().lower()
        email_verified = profile.get("email_verified", False)
        full_name = str(profile.get("name") or email.split("@")[0]).strip()
        google_sub = str(profile.get("sub", "")).strip()

        if not email or not email_verified:
            raise ValueError("Google email is missing or not verified")

        user = await db.users.find_one({"email": email, "role": role})
        if not user:
            user = {
                "user_id": str(uuid.uuid4()),
                "full_name": full_name,
                "email": email,
                "password_hash": "",
                "role": role,
                "auth_provider": "google",
                "google_sub": google_sub,
                "created_at": datetime.now(timezone.utc),
            }
            await db.users.insert_one(user)
        else:
            await db.users.update_one(
                {"email": email, "role": role},
                {"$set": {
                    "full_name": user.get("full_name") or full_name,
                    "auth_provider": user.get("auth_provider") or "google",
                    "google_sub": user.get("google_sub") or google_sub,
                    "last_login_at": datetime.now(timezone.utc),
                }},
            )
            user = {**user, "full_name": user.get("full_name") or full_name, "google_sub": user.get("google_sub") or google_sub}

        app_token = create_access_token(user)
        return RedirectResponse(url=build_frontend_google_redirect({
            "token": app_token,
            "role": role,
            "email": email,
            "name": full_name,
            "redirect": redirect_path,
        }))
    except Exception:
        return RedirectResponse(url=build_frontend_google_redirect({"error": "google_login_failed"}))


@app.post("/auth/login", response_model=StandardResponse)
async def login_user(request: LoginRequest):
    email = request.email.strip().lower()
    if not email or not request.password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    user = await db.users.find_one({"email": email, "role": "user"})
    if not user or not verify_password(request.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return StandardResponse(
        success=True,
        data={
            "token": create_access_token(user),
            "role": "user",
            "email": user["email"],
            "full_name": user.get("full_name", "")
        },
        message="Login successful"
    )


@app.post("/auth/register", response_model=StandardResponse)
async def register_user(request: RegisterRequest):
    email = request.email.strip().lower()
    full_name = request.full_name.strip()

    if not full_name or not email or not request.password:
        raise HTTPException(status_code=400, detail="Full name, email, and password are required")

    existing_user = await db.users.find_one({"email": email, "role": "user"})
    if existing_user:
        raise HTTPException(status_code=409, detail="This email is already registered as a user")

    user_doc = {
        "user_id": str(uuid.uuid4()),
        "full_name": full_name,
        "email": email,
        "password_hash": hash_password(request.password),
        "role": "user",
        "created_at": datetime.now(timezone.utc)
    }
    await db.users.insert_one(user_doc)

    return StandardResponse(
        success=True,
        data={
            "token": create_access_token(user_doc),
            "role": "user",
            "email": email,
            "full_name": full_name
        },
        message="Register successful"
    )

@app.post("/auth/admin-login", response_model=StandardResponse)
async def login_admin(request: LoginRequest):
    email = request.email.strip().lower()
    if not email or not request.password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    admin = await db.users.find_one({"email": email, "role": "admin"})
    if not admin or not verify_password(request.password, admin.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid admin email or password")

    return StandardResponse(
        success=True,
        data={
            "token": create_access_token(admin),
            "role": "admin",
            "email": admin["email"],
            "full_name": admin.get("full_name", "")
        },
        message="Admin login successful"
    )

@app.post("/auth/admin-register", response_model=StandardResponse)
async def register_admin(request: AdminRegisterRequest):
    email = request.email.strip().lower()
    full_name = request.full_name.strip()

    if not full_name or not email or not request.password:
        raise HTTPException(status_code=400, detail="Full name, email, and password are required")

    existing_user = await db.users.find_one({"email": email, "role": "admin"})
    if existing_user:
        raise HTTPException(status_code=409, detail="This email is already registered as an admin")

    admin_doc = {
        "user_id": str(uuid.uuid4()),
        "full_name": full_name,
        "email": email,
        "password_hash": hash_password(request.password),
        "role": "admin",
        "created_at": datetime.now(timezone.utc)
    }
    await db.users.insert_one(admin_doc)

    return StandardResponse(
        success=True,
        data={
            "token": create_access_token(admin_doc),
            "role": "admin",
            "email": email,
            "full_name": full_name
        },
        message="Admin registered successfully"
    )


@app.get("/user/dashboard", response_model=StandardResponse)
async def user_dashboard(current_user: dict[str, Any] = Depends(require_role("user", "admin"))):
    try:
        total_reports = await db.analyses.count_documents({})
        return StandardResponse(
            success=True,
            data={
                "name": current_user.get("full_name", "Database User"),
                "total_reports": total_reports,
                "active_services": ["Education", "Loan", "Job", "Document"],
                "recent_activity": [
                    "Logged in successfully",
                    "Dashboard loaded from database"
                ]
            },
            message="User dashboard loaded"
        )
    except Exception as e:
        return StandardResponse(
            success=True,
            data={
                "name": "Temporary User",
                "total_reports": 4,
                "active_services": ["Education", "Loan", "Job", "Document"],
                "recent_activity": [
                    "Logged in successfully",
                    "Temporary dashboard loaded"
                ]
            },
            message=f"Temporary user dashboard loaded because database is disconnected: {str(e)}"
        )

@app.get("/admin/dashboard", response_model=StandardResponse)
async def admin_dashboard(current_user: dict[str, Any] = Depends(require_role("admin"))):
    try:
        total_users = await db.users.count_documents({})
        total_reports = await db.analyses.count_documents({})
        pending_reviews = await db.analyses.count_documents({"status": {"$in": ["pending", "running"]}})

        return StandardResponse(
            success=True,
            data={
                "total_users": total_users,
                "total_reports": total_reports,
                "pending_reviews": pending_reviews,
                "system_status": "Database connected",
                "recent_activity": [
                    "Admin logged in",
                    "Dashboard loaded from database"
                ]
            },
            message="Admin dashboard loaded"
        )
    except Exception as e:
        return StandardResponse(
            success=True,
            data={
                "total_users": 120,
                "total_reports": 35,
                "pending_reviews": 8,
                "system_status": "Temporary admin data loaded",
                "recent_activity": [
                    "Admin logged in",
                    "Temporary admin dashboard loaded"
                ]
            },
            message=f"Temporary admin dashboard loaded because database is disconnected: {str(e)}"
        )

@app.get("/admin/users", response_model=StandardResponse)
async def admin_users(current_user: dict[str, Any] = Depends(require_role("admin"))):
    try:
        users = []
        async for user in db.users.find({}, {"_id": 0, "password_hash": 0}).limit(50):
            users.append(user)

        return StandardResponse(success=True, data=users, message="Users loaded")
    except Exception as e:
        return StandardResponse(
            success=True,
            data=[
                {"id": 1, "name": "Test User", "email": "test@gmail.com", "role": "user"},
                {"id": 2, "name": "Admin User", "email": "admin@gmail.com", "role": "admin"}
            ],
            message=f"Temporary users loaded because database is disconnected: {str(e)}"
        )

@app.get("/admin/reports", response_model=StandardResponse)
async def admin_reports(current_user: dict[str, Any] = Depends(require_role("admin"))):
    try:
        reports = []
        async for report in db.analyses.find({}, {"_id": 0}).sort("created_at", -1).limit(50):
            reports.append(report)

        return StandardResponse(success=True, data=reports, message="Reports loaded")
    except Exception as e:
        return StandardResponse(
            success=True,
            data=[
                {"id": 1, "title": "Bias Report 1", "status": "completed"},
                {"id": 2, "title": "Bias Report 2", "status": "pending"}
            ],
            message=f"Temporary reports loaded because database is disconnected: {str(e)}"
        )


@app.get("/admin/service-analyses", response_model=StandardResponse)
async def admin_service_analyses(
    service_type: Optional[str] = None,
    current_user: dict[str, Any] = Depends(require_role("admin")),
):
    try:
        query = {"service_type": service_type} if service_type else {}
        analyses = []
        async for item in db.service_analyses.find(query, {"_id": 0}).sort("created_at", -1).limit(100):
            analyses.append(item)

        return StandardResponse(success=True, data=analyses, message="Service analyses loaded")
    except Exception as e:
        return StandardResponse(
            success=True,
            data=[],
            message=f"No service analyses loaded because database is disconnected: {str(e)}",
        )

@app.get("/reports", response_model=StandardResponse)
async def user_reports(current_user: dict[str, Any] = Depends(require_role("user", "admin"))):
    try:
        reports = []
        query = {} if current_user.get("role") == "admin" else {"created_by": current_user.get("email")}
        async for report in db.analyses.find(query, {"_id": 0}).sort("created_at", -1).limit(50):
            reports.append(report)

        return StandardResponse(success=True, data=reports, message="Reports loaded")
    except Exception as e:
        return StandardResponse(
            success=True,
            data=[],
            message=f"No reports loaded because database is disconnected: {str(e)}"
        )

@app.post("/ai/chat", response_model=StandardResponse)
async def ai_chat(request: ChatRequest, current_user: dict[str, Any] = Depends(require_role("user", "admin"))):
    message = request.message.strip()
    lower_message = message.lower()

    if not message:
        raise HTTPException(status_code=400, detail="Message is required")

    report_query = {"status": "completed", "result": {"$exists": True}}
    if current_user.get("role") != "admin":
        report_query["created_by"] = current_user.get("email")

    latest_report = await db.analyses.find_one(
        report_query,
        sort=[("created_at", -1)],
        projection={"_id": 0}
    )

    if request.language == "hi":
        fallback = "Main aapki AI fairness report, bias score, recommendations, login, dashboard aur CSV analysis me madad kar sakta hoon."
    else:
        fallback = "I can help with AI fairness reports, bias scores, recommendations, login, dashboards, and CSV analysis."

    if not latest_report:
        return StandardResponse(
            success=True,
            data={"reply": f"{fallback} No completed AI audit is available yet. Upload a CSV and run an audit from Bias Reports first."},
            message="AI chat response generated"
        )

    result = latest_report.get("result", {})
    aggregate = result.get("aggregate_score", {})
    fairness_score = aggregate.get("average_fairness_score", "not available")
    bias_score = aggregate.get("average_bias_score", "not available")
    bias_level = aggregate.get("overall_bias_band", "not available")
    sensitive_columns = latest_report.get("sensitive_columns", [])
    target_column = latest_report.get("target_column", "decision")
    recommendations = result.get("structured_recommendations", {})
    flat_recommendations = []
    for items in recommendations.values():
        for item in items:
            if isinstance(item, dict):
                flat_recommendations.append(item.get("action") or item.get("description") or item.get("title"))
            else:
                flat_recommendations.append(str(item))
    flat_recommendations = [item for item in flat_recommendations if item][:4]

    if any(word in lower_message for word in ["score", "bias", "fair", "report", "analysis"]):
        reply = (
            f"Latest AI audit summary: fairness score is {fairness_score}/100, "
            f"bias score is {bias_score}, and bias level is {bias_level}. "
            f"The target column is '{target_column}' and sensitive columns are {', '.join(sensitive_columns) or 'not selected'}."
        )
    elif any(word in lower_message for word in ["recommend", "improve", "fix", "solution"]):
        if flat_recommendations:
            reply = "Top AI recommendations: " + " ".join(
                f"{index + 1}. {item}." for index, item in enumerate(flat_recommendations)
            )
        else:
            reply = "No specific recommendations were generated for the latest report."
    elif any(word in lower_message for word in ["upload", "csv", "run"]):
        reply = "Go to Bias Reports, choose a CSV file, click Upload And Read Columns, select a target column and sensitive columns, then click Run AI Audit."
    elif request.language == "hi":
        reply = (
            f"Latest AI report ke hisaab se fairness score {fairness_score}/100 hai, "
            f"bias score {bias_score} hai, aur bias level {bias_level} hai."
        )
    else:
        reply = fallback

    return StandardResponse(
        success=True,
        data={"reply": reply},
        message="AI chat response generated"
    )

@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "data": None, "message": str(exc.detail)}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"success": False, "data": None, "message": f"Validation Error: {str(exc)}"}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"success": False, "data": None, "message": f"Internal Server Error: {str(exc)}"}
    )

class AnalysisCreateRequest(BaseModel):
    dataset_id: str
    target_column: str
    sensitive_columns: List[str]

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")

@app.get("/health", response_model=StandardResponse)
async def health_check():
    try:
        await client.admin.command('ping')
        database_status = "local fallback" if is_using_local_db() else "connected"
        return StandardResponse(success=True, data={"status": "alive", "database": database_status}, message="Operation successful")
    except Exception as e:
        return StandardResponse(
            success=True,
            data={"status": "alive", "database": "disconnected"},
            message=f"Backend is running, but database is not connected: {str(e)}"
        )


@app.get("/auth/me", response_model=StandardResponse)
async def auth_me(current_user: dict[str, Any] = Depends(require_role("user", "admin"))):
    return StandardResponse(
        success=True,
        data={
            "email": current_user.get("email"),
            "full_name": current_user.get("full_name", ""),
            "role": current_user.get("role", "user"),
        },
        message="Authenticated user loaded",
    )

@app.post("/datasets/upload", response_model=StandardResponse)
async def upload_dataset(file: UploadFile = File(...), current_user: dict[str, Any] = Depends(require_role("user", "admin"))):
    if not file.filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Only CSV allowed.")
        
    try:
        dataset_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{dataset_id}_{file.filename}")
        
        # Save file locally
        with open(file_path, "wb") as buffer:
            while content := await file.read(1024 * 1024):
                buffer.write(content)
                
        # Insert metadata to MongoDB
        dataset_doc = {
            "dataset_id": dataset_id,
            "file_name": file.filename,
            "file_path": file_path,
            "uploaded_by": current_user.get("email"),
            "upload_timestamp": datetime.now(timezone.utc)
        }
        await db.datasets.insert_one(dataset_doc)
        
        return StandardResponse(success=True, data={"dataset_id": dataset_id}, message="Dataset saved")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/services/analyze", response_model=StandardResponse)
async def analyze_service_document(
    service_type: str = Form(...),
    payload: str = Form("{}"),
    files: List[UploadFile] = File(default=[]),
    doc_types: Optional[str] = Form(None),
    current_user: dict[str, Any] = Depends(require_role("user", "admin")),
):
    try:
        parsed_payload = json.loads(payload or "{}")
        parsed_doc_types = json.loads(doc_types or "[]")
        stored_files = []

        for index, file in enumerate(files):
            if file.size and file.size > 10 * 1024 * 1024:
                raise HTTPException(status_code=400, detail=f"{file.filename} exceeds the 10MB limit")

            upload_id = str(uuid.uuid4())
            safe_name = os.path.basename(file.filename or f"upload-{index}")
            file_path = os.path.join(UPLOAD_DIR, f"{upload_id}_{safe_name}")
            with open(file_path, "wb") as buffer:
                while content := await file.read(1024 * 1024):
                    buffer.write(content)

            extracted_text = read_text_from_file(file_path)
            stored_files.append({
                "id": upload_id,
                "name": safe_name,
                "path": file_path,
                "contentType": file.content_type,
                "docType": parsed_doc_types[index] if index < len(parsed_doc_types) else None,
                "text": extracted_text,
            })

        analysis = run_service_analysis(service_type, parsed_payload, stored_files)
        service_doc = {
            "service_analysis_id": str(uuid.uuid4()),
            "service_type": service_type,
            "created_by": current_user.get("email"),
            "file_names": [item["name"] for item in stored_files],
            "result": analysis,
            "created_at": datetime.now(timezone.utc),
        }
        await db.service_analyses.insert_one(service_doc)

        return StandardResponse(success=True, data=analysis, message="Service analysis completed")
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/datasets/{dataset_id}", response_model=StandardResponse)
async def get_dataset(dataset_id: str, current_user: dict[str, Any] = Depends(require_role("user", "admin"))):
    try:
        # Fetch Metadata: Find the file's local path from the MongoDB document
        dataset_doc = await db.datasets.find_one({"dataset_id": dataset_id})
        if not dataset_doc:
            raise HTTPException(status_code=404, detail="Dataset not found in database")
        if current_user.get("role") != "admin" and dataset_doc.get("uploaded_by") != current_user.get("email"):
            raise HTTPException(status_code=403, detail="You do not have permission to access this dataset")
        
        file_path = dataset_doc.get("file_path")
        if not file_path or not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Dataset file is missing or corrupted on disk")
            
        # Read File: Load the CSV file from the uploads/ folder using pandas
        try:
            df = pd.read_csv(file_path)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading the dataset file: {str(e)}")
            
        # Extraction
        column_names = df.columns.tolist()
        data_types = {col: str(dtype) for col, dtype in df.dtypes.items()}
        row_count = len(df)
        
        structure_summary = {
            "column_names": column_names,
            "data_types": data_types,
            "row_count": row_count
        }
        
        # Database Update: Store summary back into the same document
        await db.datasets.update_one(
            {"dataset_id": dataset_id},
            {"$set": {"structure_summary": structure_summary}}
        )
        
        # Output: Return the extracted details
        return StandardResponse(success=True, data=structure_summary, message="Operation successful")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analysis/create", response_model=StandardResponse)
async def create_analysis(request: AnalysisCreateRequest, current_user: dict[str, Any] = Depends(require_role("user", "admin"))):
    try:
        dataset_doc = await db.datasets.find_one({"dataset_id": request.dataset_id})
        if not dataset_doc:
            raise HTTPException(status_code=404, detail="Dataset not found")
        if current_user.get("role") != "admin" and dataset_doc.get("uploaded_by") != current_user.get("email"):
            raise HTTPException(status_code=403, detail="You do not have permission to analyze this dataset")
        
        structure = dataset_doc.get("structure_summary")
        if not structure or "column_names" not in structure:
            raise HTTPException(status_code=400, detail="Dataset structure not evaluated yet.")
            
        columns = structure["column_names"]
        if request.target_column not in columns:
            raise HTTPException(status_code=422, detail=f"Column {request.target_column} not found in dataset.")
            
        for col in request.sensitive_columns:
            if col not in columns:
                raise HTTPException(status_code=422, detail=f"Column {col} not found in dataset.")

        analysis_id = str(uuid.uuid4())
        
        # Database Logic
        analysis_doc = {
            "analysis_id": analysis_id,
            "dataset_id": request.dataset_id,
            "target_column": request.target_column,
            "sensitive_columns": request.sensitive_columns,
            "status": "pending",
            "created_by": current_user.get("email"),
            "created_at": datetime.now(timezone.utc)
        }
        
        await db.analyses.insert_one(analysis_doc)
        
        return StandardResponse(
            success=True, 
            data={"analysis_id": analysis_id}, 
            message="Analysis created successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analysis/run/{analysis_id}", response_model=StandardResponse)
async def run_analysis(analysis_id: str, background_tasks: BackgroundTasks, current_user: dict[str, Any] = Depends(require_role("user", "admin"))):
    try:
        # Verify the analysis exists before starting the task
        analysis_doc = await db.analyses.find_one({"analysis_id": analysis_id})
        if not analysis_doc:
            raise HTTPException(status_code=404, detail="Analysis not found")
        if current_user.get("role") != "admin" and analysis_doc.get("created_by") != current_user.get("email"):
            raise HTTPException(status_code=403, detail="You do not have permission to run this analysis")
            
        if analysis_doc.get("status") in ["running", "completed"]:
            raise HTTPException(status_code=400, detail="Analysis is already running or completed.")
            
        # Add the bias analysis task to the background execution pool
        background_tasks.add_task(run_bias_analysis, analysis_id)
        
        # Return instantly
        return StandardResponse(
            success=True,
            data={"analysis_id": analysis_id, "status": "accepted"},
            message="Analysis triggered and is processing in the background."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analysis/{analysis_id}", response_model=StandardResponse)
async def get_analysis(analysis_id: str, current_user: dict[str, Any] = Depends(require_role("user", "admin"))):
    try:
        # Step 1: Find analysis document in DB
        analysis_doc = await db.analyses.find_one({"analysis_id": analysis_id})
        if not analysis_doc:
            raise HTTPException(status_code=404, detail="Analysis not found")
        if current_user.get("role") != "admin" and analysis_doc.get("created_by") != current_user.get("email"):
            raise HTTPException(status_code=403, detail="You do not have permission to access this analysis")
            
        # Step 2: Fetch associated dataset metadata
        dataset_id = analysis_doc.get("dataset_id")
        dataset_doc = await db.datasets.find_one({"dataset_id": dataset_id})
        
        dataset_info = {}
        if dataset_doc:
            dataset_info = {
                "file_name": dataset_doc.get("file_name"),
                "upload_timestamp": dataset_doc.get("upload_timestamp"),
                # Contains row_count, column_names, etc if structure summary exists
                "structure_summary": dataset_doc.get("structure_summary")
            }
        else:
            dataset_info = {"error": "Associated dataset not found or deleted"}
            
        # Step 3: Build the consolidated response
        return StandardResponse(
            success=True,
            data={
                "analysis_id": analysis_id,
                "status": analysis_doc.get("status"),
                "target_column": analysis_doc.get("target_column"),
                "sensitive_columns": analysis_doc.get("sensitive_columns"),
                "dataset_info": dataset_info,
                "inputs": {
                    "target_column": analysis_doc.get("target_column"),
                    "sensitive_columns": analysis_doc.get("sensitive_columns")
                },
                "result": analysis_doc.get("result", None)
            },
            message="Operation successful"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analysis/status/{id}", response_model=StandardResponse)
async def get_analysis_status(id: str, current_user: dict[str, Any] = Depends(require_role("user", "admin"))):
    try:
        # Fetch analysis document from DB
        analysis_doc = await db.analyses.find_one({"analysis_id": id})
        if not analysis_doc:
            raise HTTPException(status_code=404, detail="Analysis not found")
        if current_user.get("role") != "admin" and analysis_doc.get("created_by") != current_user.get("email"):
            raise HTTPException(status_code=403, detail="You do not have permission to access this analysis")
            
        # Build lightweight response
        response = {
            "analysis_id": analysis_doc.get("analysis_id", id),
            "status": analysis_doc.get("status")
        }
        
        # Include optional message field if present
        if "message" in analysis_doc:
            response["message"] = analysis_doc.get("message")
        elif analysis_doc.get("result") and "message" in analysis_doc["result"]:
            response["message"] = analysis_doc["result"]["message"]
            
        return StandardResponse(success=True, data=response, message="Operation successful")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

