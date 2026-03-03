"""Agent 1 — Resume Analyzer
Parses resume text, detects sections, evaluates structure, and identifies weak bullets.
"""

from __future__ import annotations

import json
import re
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from app.schemas.models import AgentState

SYSTEM_PROMPT = """You are a Senior Resume Analyst AI. You receive raw resume text and produce a detailed structured analysis.

**Your tasks:**
1. Extract the candidate's full name, email, phone, and summary.
2. Detect all resume sections (Education, Experience, Skills, Projects, Certifications, etc.).
3. For each section, rate quality 0-10 and list specific issues.
4. Identify skills found in the resume.
5. Identify weak bullet points (vague, no metrics, no action verbs, no impact).
6. Rate overall resume quality 0-10.
7. Provide actionable recommendations.
8. In "skills_found", include only professional technical/business skills. Do NOT include AI chat assistants or productivity chat tools (e.g., ChatGPT, Claude, Gemini, Cursor, Perplexity).

**You MUST return ONLY valid JSON** matching this exact schema (no markdown, no code fences):
{
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "summary": "string",
  "sections": [
    {
      "name": "string",
      "content": "string (brief excerpt)",
      "quality_score": 0-10,
      "issues": ["string"]
    }
  ],
  "skills_found": ["string"],
  "weak_bullets": ["string (the actual weak bullet text)"],
  "overall_quality": 0-10,
  "recommendations": ["string"]
}
"""


NON_SKILL_TOOLS = {
    "chatgpt",
    "gemini",
    "claude",
    "perplexity",
    "cursor",
    "cursor ai",
    "github copilot",
    "copilot chat",
}


def _normalize_skill_text(skill: str) -> str:
    return re.sub(r"\s+", " ", skill.strip().lower())


def _is_non_skill_tool(skill: str) -> bool:
    normalized = _normalize_skill_text(skill)
    return normalized in NON_SKILL_TOOLS


def _sanitize_skills(skills: list[str]) -> list[str]:
    sanitized: list[str] = []
    seen: set[str] = set()

    for skill in skills:
        if not isinstance(skill, str):
            continue

        clean = skill.strip().strip("-•")
        if not clean:
            continue

        if _is_non_skill_tool(clean):
            continue

        key = _normalize_skill_text(clean)
        if key in seen:
            continue

        seen.add(key)
        sanitized.append(clean)

    return sanitized


def resume_analyzer_agent(state: AgentState) -> AgentState:
    """Analyze the resume and return structured insights."""
    llm = ChatGroq(model="openai/gpt-oss-120b", temperature=0)

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"Analyze this resume:\n\n{state['resume_text']}"),
    ]

    response = llm.invoke(messages)
    content = response.content.strip()

    # Strip markdown code fences if present
    if content.startswith("```"):
        content = content.split("\n", 1)[1]
    if content.endswith("```"):
        content = content.rsplit("```", 1)[0]
    content = content.strip()

    try:
        parsed = json.loads(content)
        if isinstance(parsed, dict):
            parsed["skills_found"] = _sanitize_skills(parsed.get("skills_found", []))
    except json.JSONDecodeError:
        parsed = {
            "error": "Failed to parse resume analysis",
            "raw_response": content[:500],
        }

    return {**state, "resume_analysis": parsed}
