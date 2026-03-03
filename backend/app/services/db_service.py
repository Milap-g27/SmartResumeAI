"""Database service helper functions for Supabase insertions."""

from __future__ import annotations

import json
import os
from app.db.database import get_db

def execute_insert(query: str, params: tuple = None) -> str | None:
    """Execute an INSERT/UPDATE query with RETURNING and return the 'id'."""
    try:
        from app.db.database import DB_AVAILABLE
        if not DB_AVAILABLE:
            print("Database insertion skipped: psycopg2 is not installed.")
            return None

        if not os.getenv("DATABASE_URL"):
            print("Database insertion skipped: DATABASE_URL is not configured.")
            return None
            
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(query, params)
            result = cur.fetchone()
            if result:
                return result.get("id")
            return None
    except Exception as e:
        print(f"Database insertion error: {e}")
        return None


def upsert_user(firebase_uid: str, email: str) -> str | None:
    """Upsert user based on Firebase UID and return the user UUID."""
    query = """
        INSERT INTO users (firebase_uid, email)
        VALUES (%s, %s)
        ON CONFLICT (firebase_uid) 
        DO UPDATE SET email = EXCLUDED.email
        RETURNING id;
    """
    return execute_insert(query, (firebase_uid, email))


def insert_resume(user_id: str | None, parsed_text: str) -> str | None:
    """Insert parsed resume text. Provide an anonymous fallback if user_id is missing."""
    if not user_id:
        # Create an anonymous user to satisfy the foreign key constraint
        user_id = upsert_user("anonymous_session_user", "anonymous@smartresume.ai")
        # If database fails completely, user_id will still be None
        if not user_id:
            return None
    
    query = """
        INSERT INTO resumes (user_id, parsed_text)
        VALUES (%s, %s)
        RETURNING id;
    """
    return execute_insert(query, (user_id, parsed_text))


def insert_analysis(resume_id: str, ats_score: int, skill_gap_json: dict, optimized_resume_markdown: str) -> str | None:
    """Insert the final generated analysis results."""
    query = """
        INSERT INTO analyses (resume_id, ats_score, skill_gap_json, optimized_resume_markdown)
        VALUES (%s, %s, %s, %s)
        RETURNING id;
    """
    return execute_insert(query, (
        resume_id,
        ats_score,
        json.dumps(skill_gap_json) if skill_gap_json else None,
        optimized_resume_markdown
    ))


def insert_interview_response(user_id: str | None, question: str, answer: str, evaluation_json: dict) -> str | None:
    """Insert an interview response evaluation."""
    if not user_id:
        # Create an anonymous user to satisfy the foreign key constraint
        user_id = upsert_user("anonymous_session_user", "anonymous@smartresume.ai")
        if not user_id:
            return None

    query = """
        INSERT INTO interview_responses (user_id, question, answer, evaluation_json)
        VALUES (%s, %s, %s, %s)
        RETURNING id;
    """
    return execute_insert(query, (
        user_id,
        question,
        answer,
        json.dumps(evaluation_json) if evaluation_json else None
    ))


def insert_cover_letter(
    user_id: str | None,
    resume_id: str | None,
    job_description: str,
    cover_letter_text: str,
) -> str | None:
    """Insert generated cover letter into the cover_letters dataset."""
    if not user_id:
        user_id = upsert_user("anonymous_session_user", "anonymous@smartresume.ai")
        if not user_id:
            return None

    query = """
        INSERT INTO cover_letters (user_id, resume_id, job_description, cover_letter_text)
        VALUES (%s, %s, %s, %s)
        RETURNING id;
    """
    return execute_insert(query, (user_id, resume_id, job_description, cover_letter_text))


def get_user_theme_preference(firebase_uid: str, email: str) -> str | None:
    """Get persisted user theme preference by Firebase UID."""
    try:
        from app.db.database import DB_AVAILABLE
        if not DB_AVAILABLE or not os.getenv("DATABASE_URL"):
            return None

        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(
                "SELECT theme_preference FROM users WHERE firebase_uid = %s;",
                (firebase_uid,),
            )
            row = cur.fetchone()

            if row and row.get("theme_preference") in ("light", "dark", "system"):
                return row.get("theme_preference")

        upsert_user(firebase_uid, email)
        return None
    except Exception as e:
        print(f"Theme preference fetch error: {e}")
        return None


def update_user_theme_preference(firebase_uid: str, email: str, theme: str) -> str | None:
    """Persist user theme preference and return saved value."""
    if theme not in ("light", "dark", "system"):
        return None

    try:
        from app.db.database import DB_AVAILABLE
        if not DB_AVAILABLE or not os.getenv("DATABASE_URL"):
            return None

        upsert_user(firebase_uid, email)

        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(
                """
                UPDATE users
                SET theme_preference = %s
                WHERE firebase_uid = %s
                RETURNING theme_preference;
                """,
                (theme, firebase_uid),
            )
            row = cur.fetchone()
            if row:
                return row.get("theme_preference")
            return None
    except Exception as e:
        print(f"Theme preference update error: {e}")
        return None
