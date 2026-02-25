"""POST /analyze — Upload resume + job description, run full agent pipeline."""

from __future__ import annotations

import os
import uuid
import traceback

from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.services.file_parser import parse_resume
from app.services.session_store import create_session, update_session
from app.graph import run_pipeline

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
):
    """Accept a resume file + job description, run the full 4-agent pipeline."""

    # ── Validate file type ──────────────────────────────────────────
    filename = resume.filename or "unknown"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in (".pdf", ".docx", ".doc"):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Only PDF and DOCX are accepted.",
        )

    # ── Save uploaded file temporarily ──────────────────────────────
    temp_name = f"{uuid.uuid4()}{ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_name)
    try:
        contents = await resume.read()
        with open(temp_path, "wb") as f:
            f.write(contents)

        # ── Parse resume text ───────────────────────────────────────
        resume_text = parse_resume(temp_path)
        if not resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract any text from the uploaded file.",
            )

        # ── Run LangGraph pipeline ──────────────────────────────────
        result = run_pipeline(resume_text, job_description)

        # ── Store session ───────────────────────────────────────────
        session_id = create_session(result)

        return {
            "session_id": session_id,
            "resume_analysis": result.get("resume_analysis"),
            "skill_gap": result.get("skill_gap"),
            "ats_result": result.get("ats_result"),
            "interview_questions": result.get("interview_questions"),
        }

    except HTTPException:
        raise
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
