"""Firebase Authentication Middleware for FastAPI.

Verifies Firebase ID tokens from the Authorization header
and injects the authenticated user into request.state.
"""

from __future__ import annotations

import os
from functools import lru_cache

from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware

# Optional: Firebase Admin SDK for server-side token verification
# Install with: pip install firebase-admin
try:
    import firebase_admin
    from firebase_admin import credentials, auth as firebase_auth

    # Initialize Firebase Admin (only once)
    if not firebase_admin._apps:
        cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            # Use default credentials (GCP environment)
            firebase_admin.initialize_app()

    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False


security = HTTPBearer(auto_error=False)


class FirebaseAuthMiddleware(BaseHTTPMiddleware):
    """Middleware that verifies Firebase ID tokens.
    
    Skips verification for:
    - Health check endpoints
    - The root endpoint
    - Auth-related endpoints
    - Static files
    """

    SKIP_PATHS = {"/", "/health", "/docs", "/openapi.json", "/redoc"}

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Skip auth for public endpoints
        if path in self.SKIP_PATHS or path.startswith("/api/auth"):
            return await call_next(request)

        # For all other routes, try to extract and verify token
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                if FIREBASE_AVAILABLE:
                    decoded = firebase_auth.verify_id_token(token)
                    request.state.user = decoded
                else:
                    # Fallback: just pass through (for development)
                    request.state.user = {"uid": "dev-user", "email": "dev@localhost"}
            except Exception:
                request.state.user = None
        else:
            request.state.user = None

        return await call_next(request)
