"""Pydantic models for the Smart Resume Builder system."""

from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel, Field


# ── Resume Analyzer Output ──────────────────────────────────────────
class ResumeSection(BaseModel):
    name: str = Field(description="Section title (e.g. Education, Experience)")
    content: str = Field(description="Raw text content of the section")
    quality_score: int = Field(ge=0, le=10, description="Section quality 0-10")
    issues: list[str] = Field(default_factory=list, description="List of issues found")


class ResumeAnalysis(BaseModel):
    full_name: str = ""
    email: str = ""
    phone: str = ""
    summary: str = ""
    sections: list[ResumeSection] = Field(default_factory=list)
    skills_found: list[str] = Field(default_factory=list)
    weak_bullets: list[str] = Field(default_factory=list)
    overall_quality: int = Field(default=0, ge=0, le=10)
    recommendations: list[str] = Field(default_factory=list)


# ── Skill Gap Output (Semantic) ─────────────────────────────────────
class SemanticMatch(BaseModel):
    jd_skill: str = ""
    mapped_to: str = ""
    confidence: float = Field(default=0.0, ge=0, le=1)


class SkillGapReport(BaseModel):
    exact_match_score: float = 0.0
    semantic_match_score: float = 0.0
    final_skill_coverage: float = 0.0
    exact_matches: list[str] = Field(default_factory=list)
    semantic_matches: list[SemanticMatch] = Field(default_factory=list)
    truly_missing_skills: list[str] = Field(default_factory=list)
    learning_suggestions: list[dict[str, str]] = Field(default_factory=list)


# ── ATS Score Output ────────────────────────────────────────────────
class ATSBreakdown(BaseModel):
    keyword_match: float = Field(default=0, description="Score out of 30")
    semantic_match: float = Field(default=0, description="Score out of 20")
    skill_coverage: float = Field(default=0, description="Score out of 20")
    experience_relevance: float = Field(default=0, description="Score out of 20")
    formatting: float = Field(default=0, description="Score out of 10")


class ATSResult(BaseModel):
    total_score: float = Field(default=0, ge=0, le=100)
    breakdown: ATSBreakdown = Field(default_factory=ATSBreakdown)
    improvement_actions: list[str] = Field(default_factory=list)
    optimized_bullets: list[str] = Field(default_factory=list)
    optimized_resume: str = ""


# ── Interview Questions ─────────────────────────────────────────────
class InterviewQuestion(BaseModel):
    category: str = Field(description="technical / behavioral / project-specific")
    question: str
    tips: str = ""


class InterviewQuestions(BaseModel):
    questions: list[InterviewQuestion] = Field(default_factory=list)


# ── Mock Interview Feedback ─────────────────────────────────────────
class MockFeedback(BaseModel):
    clarity: int = Field(default=0, ge=0, le=10)
    technical_depth: int = Field(default=0, ge=0, le=10)
    communication: int = Field(default=0, ge=0, le=10)
    confidence: int = Field(default=0, ge=0, le=10)
    improvement: str = ""
    strengths: list[str] = Field(default_factory=list)


# ── API Request / Response ──────────────────────────────────────────
class AnalyzeResponse(BaseModel):
    session_id: str
    resume_analysis: Optional[ResumeAnalysis] = None
    skill_gap: Optional[SkillGapReport] = None
    ats_result: Optional[ATSResult] = None
    interview_questions: Optional[InterviewQuestions] = None


class MockInterviewRequest(BaseModel):
    session_id: str
    question: str
    answer: str


class MockInterviewResponse(BaseModel):
    feedback: MockFeedback


# ── LangGraph Shared State ──────────────────────────────────────────
from typing import TypedDict


class AgentState(TypedDict, total=False):
    resume_text: str
    job_description: str
    resume_analysis: dict[str, Any]
    skill_gap: dict[str, Any]
    ats_result: dict[str, Any]
    interview_questions: dict[str, Any]
    mock_feedback: dict[str, Any]
    question: str
    user_answer: str
    error: str
