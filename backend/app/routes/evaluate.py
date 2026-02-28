"""Interview Evaluation API — Evaluates user answers to interview questions.

POST /api/interview/evaluate
Input: { question: str, answer: str }
Output: { clarity: int, technical_depth: int, structure: int, improvement: str, improved_sample_answer: str }
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.graph import run_mock_interview
from app.services.db_service import upsert_user, insert_interview_response

router = APIRouter(prefix="/api/interview", tags=["Interview Evaluation"])


class EvaluateRequest(BaseModel):
    question: str = Field(..., min_length=5)
    answer: str = Field(..., min_length=10)
    session_id: str | None = None


class EvaluateResponse(BaseModel):
    clarity: int = Field(default=0, ge=0, le=10)
    technical_depth: int = Field(default=0, ge=0, le=10)
    structure: int = Field(default=0, ge=0, le=10)
    improvement: str = ""
    improved_sample_answer: str = ""


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_answer(req: EvaluateRequest, request: Request):
    """Evaluate a user's answer to an interview question using MockInterviewAgent."""
    try:
        result = run_mock_interview(req.question, req.answer)

        # Extract feedback from the pipeline result
        feedback = result.get("mock_feedback", {})

        # Handle both dict and string feedback formats
        if isinstance(feedback, dict):
            response_data = EvaluateResponse(
                clarity=feedback.get("clarity", 5),
                technical_depth=feedback.get("technical_depth", 5),
                structure=feedback.get("structure", 5),
                improvement=feedback.get("improvement", feedback.get("feedback", "")),
                improved_sample_answer=feedback.get("improved_sample_answer", feedback.get("model_answer", "")),
            )
        else:
            # If feedback is a string, return it as improvement
            response_data = EvaluateResponse(
                clarity=5,
                technical_depth=5,
                structure=5,
                improvement=str(feedback),
                improved_sample_answer="",
            )

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
            evaluation_json=response_data.model_dump()
        )
            
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")
