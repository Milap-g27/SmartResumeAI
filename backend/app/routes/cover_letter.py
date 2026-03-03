"""POST /cover-letter/generate — Generate and persist a tailored cover letter."""

from __future__ import annotations

from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

from app.services.cover_letter_generator import generate_cover_letter
from app.services.db_service import insert_cover_letter
from app.services.session_store import get_session, update_session

router = APIRouter()


class CoverLetterGenerateRequest(BaseModel):
    session_id: str | None = None
    resume_text: str | None = None
    optimized_resume: str | None = None
    job_description: str | None = None


@router.post("/cover-letter/generate")
async def generate_cover_letter_endpoint(payload: CoverLetterGenerateRequest):
    """Generate cover letter from existing session resume + job description."""
    session = get_session(payload.session_id) if payload.session_id else None

    resume_text = ""
    job_description = ""
    user_db_id = None
    resume_id = None

    if session is not None:
        resume_text = (session.get("resume_text") or "").strip()
        job_description = (session.get("job_description") or "").strip()
        user_db_id = session.get("user_db_id")
        resume_id = session.get("resume_id")
    else:
        resume_text = (payload.resume_text or payload.optimized_resume or "").strip()
        job_description = (payload.job_description or "").strip()

    if not resume_text:
        raise HTTPException(status_code=400, detail="Resume text is required.")
    if not job_description:
        raise HTTPException(status_code=400, detail="Job description is required.")

    try:
        cover_letter = generate_cover_letter(resume_text, job_description)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Cover letter generation failed: {exc}")

    cover_letter_id = insert_cover_letter(user_db_id, resume_id, job_description, cover_letter)

    if payload.session_id and session is not None:
        update_session(
            payload.session_id,
            {
                "cover_letter": cover_letter,
                "cover_letter_id": cover_letter_id,
            },
        )

    return {
        "session_id": payload.session_id,
        "cover_letter": cover_letter,
        "cover_letter_id": cover_letter_id,
    }
