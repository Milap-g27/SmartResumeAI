"""POST /mock-interview — Evaluate a mock interview answer."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.schemas.models import MockInterviewRequest
from app.graph import run_mock_interview
from app.services.db_service import upsert_user, insert_interview_response
from fastapi import Request

router = APIRouter()


@router.post("/mock-interview")
async def mock_interview(req: MockInterviewRequest, request: Request):
    """Accept a question + user answer and return structured feedback."""

    if not req.question.strip() or not req.answer.strip():
        raise HTTPException(
            status_code=400,
            detail="Both question and answer are required.",
        )

    try:
        result = run_mock_interview(req.question, req.answer)
        feedback = result.get("mock_feedback")

        # ── Save Interview Response to Supabase ─────────────────────
        user = getattr(request.state, "user", None)
        user_db_id = None
        if user and isinstance(user, dict):
            firebase_uid = user.get("uid") or user.get("user_id")
            email = user.get("email") or "unknown@email.com"
            if firebase_uid:
                user_db_id = upsert_user(firebase_uid, email)
                
        insert_interview_response(
            user_id=user_db_id,
            question=req.question,
            answer=req.answer,
            evaluation_json=feedback if isinstance(feedback, dict) else {"feedback": str(feedback)}
        )

        return {"feedback": feedback}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
