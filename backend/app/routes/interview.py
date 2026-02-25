"""POST /mock-interview — Evaluate a mock interview answer."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas.models import MockInterviewRequest
from app.services.session_store import get_session
from app.graph import run_mock_interview

router = APIRouter()


@router.post("/mock-interview")
async def mock_interview(req: MockInterviewRequest):
    """Accept a question + user answer and return structured feedback."""

    # Validate session exists
    session = get_session(req.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    if not req.question.strip() or not req.answer.strip():
        raise HTTPException(
            status_code=400,
            detail="Both question and answer are required.",
        )

    try:
        result = run_mock_interview(req.question, req.answer)
        return {"feedback": result.get("mock_feedback")}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
