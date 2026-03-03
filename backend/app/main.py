"""Smart Resume Builder — FastAPI Application Entry Point."""

from __future__ import annotations

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.db.database import init_schema, DB_AVAILABLE, get_connection

# Load environment variables from .env
load_dotenv()

# LangSmith tracing setup (reads from env)
os.environ.setdefault("LANGCHAIN_TRACING_V2", "true")
os.environ.setdefault("LANGCHAIN_PROJECT", "smart-resume-builder")

app = FastAPI(
    title="Smart Resume Builder + Interview Coach",
    description="Collaborative Multi-Agent System for resume analysis, ATS scoring, and interview preparation.",
    version="1.0.0",
)

def _get_cors_origins() -> list[str]:
    configured = os.getenv("CORS_ORIGINS", "").strip()
    if configured:
        return [origin.strip().rstrip("/") for origin in configured.split(",") if origin.strip()]

    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Firebase Auth middleware (optional — gracefully skips if firebase-admin not installed)
try:
    from app.middleware.firebase_auth import FirebaseAuthMiddleware
    app.add_middleware(FirebaseAuthMiddleware)
except ImportError:
    pass

# Include routers
from app.routes.analyze import router as analyze_router
from app.routes.interview import router as interview_router
from app.routes.session import router as session_router
from app.routes.download import router as download_router
from app.routes.evaluate import router as evaluate_router
from app.routes.optimize_ui import router as optimize_ui_router
from app.routes.user_preferences import router as user_preferences_router
from app.routes.cover_letter import router as cover_letter_router

app.include_router(analyze_router, tags=["Analysis"])
app.include_router(interview_router, tags=["Interview"])
app.include_router(session_router, tags=["Session"])
app.include_router(download_router, tags=["Download"])
app.include_router(evaluate_router, tags=["Interview Evaluation"])
app.include_router(optimize_ui_router, tags=["UI Optimization"])
app.include_router(user_preferences_router)
app.include_router(cover_letter_router, tags=["Cover Letter"])


@app.on_event("startup")
async def startup_event():
    if not os.getenv("DATABASE_URL"):
        print("⚠️ DATABASE_URL not set. Supabase persistence is disabled.")
        return

    if not DB_AVAILABLE:
        print("⚠️ psycopg2 not available. Install dependencies from backend/requirements.txt.")
        return

    try:
        init_schema()
    except Exception as exc:
        print(f"⚠️ Failed to initialize database schema: {exc}")


@app.get("/")
async def root():
    return {
        "service": "Smart Resume Builder + Interview Coach",
        "version": "2.0.0",
        "endpoints": [
            "/analyze", "/mock-interview", "/session/{id}",
            "/download/pdf/{id}", "/download/docx/{id}",
            "/api/interview/evaluate", "/api/optimize-ui", "/health/db",
            "/user/preferences/theme",
            "/cover-letter/generate",
        ],
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/health/db")
async def health_db():
    if not os.getenv("DATABASE_URL"):
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "not_configured", "detail": "DATABASE_URL not set"},
        )

    if not DB_AVAILABLE:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "driver_missing", "detail": "psycopg2 is not installed"},
        )

    try:
        conn = get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT 1 AS ok;")
            row = cur.fetchone()
        finally:
            conn.close()

        if row and row.get("ok") == 1:
            return {"status": "healthy", "database": "connected"}

        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "unexpected_response"},
        )
    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "connection_failed", "detail": str(exc)},
        )
