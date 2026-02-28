"""Database Connection — Connects to Supabase PostgreSQL.

Uses DATABASE_URL from .env to establish a connection pool.
Provides a dependency `get_db()` for FastAPI route injection.
"""

from __future__ import annotations

import os
from contextlib import contextmanager

from dotenv import load_dotenv

load_dotenv()

# ── Connection URL ──────────────────────────────────────────────
# Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
DATABASE_URL = os.getenv("DATABASE_URL", "")

# ── Option A: Using psycopg2 (sync) ────────────────────────────
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor

    def get_connection():
        """Create a new database connection."""
        if not DATABASE_URL:
            raise RuntimeError(
                "DATABASE_URL not set. Add your Supabase connection string to backend/.env"
            )
        return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

    @contextmanager
    def get_db():
        """Context manager that yields a DB connection and auto-commits/rollbacks."""
        conn = get_connection()
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def execute_query(query: str, params: tuple = None) -> list[dict]:
        """Execute a SELECT query and return rows as dicts."""
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(query, params)
            return cur.fetchall()

    def execute_write(query: str, params: tuple = None) -> None:
        """Execute an INSERT/UPDATE/DELETE query."""
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(query, params)

    def init_schema():
        """Run the schema SQL to create tables if they don't exist."""
        from app.db.schema import SCHEMA_SQL
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(SCHEMA_SQL)
        print("✅ Database schema initialized successfully.")

    DB_AVAILABLE = True

except ImportError:
    # psycopg2 not installed — provide stubs
    DB_AVAILABLE = False

    def get_connection():
        raise RuntimeError("psycopg2 not installed. Run: pip install psycopg2-binary")

    @contextmanager
    def get_db():
        raise RuntimeError("psycopg2 not installed. Run: pip install psycopg2-binary")
        yield  # pragma: no cover

    def execute_query(query, params=None):
        raise RuntimeError("psycopg2 not installed. Run: pip install psycopg2-binary")

    def execute_write(query, params=None):
        raise RuntimeError("psycopg2 not installed. Run: pip install psycopg2-binary")

    def init_schema():
        raise RuntimeError("psycopg2 not installed. Run: pip install psycopg2-binary")


# ── FastAPI Dependency ──────────────────────────────────────────
def get_db_dependency():
    """FastAPI dependency that provides a database connection."""
    if not DB_AVAILABLE:
        raise RuntimeError("Database not available. Install psycopg2-binary.")
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
