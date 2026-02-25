"""GET /session/{id} — Retrieve stored session data."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.services.session_store import get_session

router = APIRouter()


@router.get("/session/{session_id}")
async def get_session_data(session_id: str):
    """Return the full analysis result stored for a session."""
    data = get_session(session_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Session not found.")
    return {"session_id": session_id, **data}
