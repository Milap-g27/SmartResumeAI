"""POST /analyze — Upload resume + job description, run full agent pipeline."""

from __future__ import annotations

import os
import uuid
import traceback

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request

from app.services.file_parser import parse_resume
from app.services.session_store import create_session
from app.services.db_service import upsert_user, insert_resume, insert_analysis
from app.graph import run_pipeline

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/analyze")
async def analyze_resume(
    request: Request,
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
            
        # ── Save User & Resume to Supabase ──────────────────────────
        user = getattr(request.state, "user", None)
        user_db_id = None
        if user and isinstance(user, dict):
            firebase_uid = user.get("uid") or user.get("user_id")
            email = user.get("email") or "unknown@email.com"
            if firebase_uid:
                user_db_id = upsert_user(firebase_uid, email)
                
        resume_id = insert_resume(user_db_id, resume_text)

        # ── Run LangGraph pipeline ──────────────────────────────────
        result = run_pipeline(resume_text, job_description)

        # ── Save Analysis to Supabase ───────────────────────────────
        if resume_id:
            ats_result = result.get("ats_result", {})
            skill_gap = result.get("skill_gap", {})
            optimized_resume = ats_result.get("optimized_resume") if isinstance(ats_result, dict) else ""
            ats_score = ats_result.get("total_score") if isinstance(ats_result, dict) else 0
            
            insert_analysis(resume_id, ats_score, skill_gap, optimized_resume)

        # ── Store session ───────────────────────────────────────────
        session_payload = {
            **result,
            "resume_text": resume_text,
            "job_description": job_description,
            "resume_id": resume_id,
            "user_db_id": user_db_id,
        }
        session_id = create_session(session_payload)

        return {
            "session_id": session_id,
            "resume_analysis": result.get("resume_analysis"),
            "skill_gap": result.get("skill_gap"),
            "ats_result": result.get("ats_result"),
            "interview_questions": result.get("interview_questions"),
            "job_description": job_description,
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
