"""User preference routes."""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.services.db_service import get_user_theme_preference, update_user_theme_preference

router = APIRouter(prefix="/user/preferences", tags=["User Preferences"])


class ThemePreferenceRequest(BaseModel):
    theme: Literal["light", "dark", "system"]


def _get_user_identity(request: Request) -> tuple[str, str]:
    user = getattr(request.state, "user", None)
    if not user or not isinstance(user, dict):
        raise HTTPException(status_code=401, detail="Authentication required")

    firebase_uid = user.get("uid") or user.get("user_id")
    email = user.get("email") or "unknown@email.com"

    if not firebase_uid:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    return firebase_uid, email


@router.get("/theme")
async def get_theme_preference(request: Request):
    firebase_uid, email = _get_user_identity(request)
    theme = get_user_theme_preference(firebase_uid, email)
    return {"theme": theme}


@router.put("/theme")
async def set_theme_preference(payload: ThemePreferenceRequest, request: Request):
    firebase_uid, email = _get_user_identity(request)
    saved_theme = update_user_theme_preference(firebase_uid, email, payload.theme)

    if not saved_theme:
        raise HTTPException(status_code=500, detail="Unable to save theme preference")

    return {"theme": saved_theme}
