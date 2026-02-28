"""Database service helper functions for Supabase insertions."""

from __future__ import annotations

import json
from app.db.database import get_db

def execute_insert(query: str, params: tuple = None) -> str | None:
    """Execute an INSERT/UPDATE query with RETURNING and return the 'id'."""
    try:
        from app.db.database import DB_AVAILABLE
        if not DB_AVAILABLE:
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
