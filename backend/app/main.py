"""Smart Resume Builder — FastAPI Application Entry Point."""

from __future__ import annotations

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env
load_dotenv()

# LangSmith tracing setup (reads from env)
os.environ.setdefault("LANGCHAIN_TRACING_V2", "true")
os.environ.setdefault("LANGCHAIN_PROJECT", "smart-resume-builder")

app = FastAPI(
    title="Smart Resume Builder + Interview Coach",
    description="Collaborative Multi-Agent System for resume analysis, ATS scoring, and interview preparation.",
    version="1.0.0",
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
from app.routes.analyze import router as analyze_router
from app.routes.interview import router as interview_router
from app.routes.session import router as session_router
from app.routes.download import router as download_router

app.include_router(analyze_router, tags=["Analysis"])
app.include_router(interview_router, tags=["Interview"])
app.include_router(session_router, tags=["Session"])
app.include_router(download_router, tags=["Download"])


@app.get("/")
async def root():
    return {
        "service": "Smart Resume Builder + Interview Coach",
        "version": "1.0.0",
        "endpoints": ["/analyze", "/mock-interview", "/session/{id}", "/download/pdf/{id}", "/download/docx/{id}"],
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
