"""In-memory session store for analysis results."""

from __future__ import annotations

import uuid
from typing import Any


_sessions: dict[str, dict[str, Any]] = {}


def create_session(data: dict[str, Any] | None = None) -> str:
    """Create a new session and return its ID."""
    session_id = str(uuid.uuid4())
    _sessions[session_id] = data or {}
    return session_id


def get_session(session_id: str) -> dict[str, Any] | None:
    """Retrieve session data by ID. Returns None if not found."""
    return _sessions.get(session_id)


def update_session(session_id: str, data: dict[str, Any]) -> bool:
    """Merge data into an existing session. Returns False if session not found."""
    if session_id not in _sessions:
        return False
    _sessions[session_id].update(data)
    return True
