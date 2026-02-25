"""Agent 4 — Interview Question Generator
Generates role-specific interview questions based on resume + job description.
"""

from __future__ import annotations

import json
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from app.schemas.models import AgentState

SYSTEM_PROMPT = """You are an Interview Question Generator AI.

You receive:
1. A structured resume analysis (JSON)
2. A job description

**Your tasks:**
Generate 15 interview questions across three categories:

1. **Technical Questions** (5): Based on skills in the job description and resume
2. **Project-Specific Questions** (5): Based on projects/experience listed in the resume
3. **Behavioral Questions** (5): Standard STAR-method behavioral questions relevant to the role

For each question, provide a brief tip on what the interviewer is looking for.

**You MUST return ONLY valid JSON** (no markdown, no code fences):
{
  "questions": [
    {
      "category": "technical | project-specific | behavioral",
      "question": "string",
      "tips": "string (what the interviewer is looking for)"
    }
  ]
}
"""


def interview_generator_agent(state: AgentState) -> AgentState:
    """Generate role-specific interview questions."""
    llm = ChatGroq(model="openai/gpt-oss-120b", temperature=0.3)

    resume_analysis = json.dumps(state.get("resume_analysis", {}), indent=2)
    job_description = state.get("job_description", "")

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(
            content=(
                f"Resume Analysis:\n{resume_analysis}\n\n"
                f"Job Description:\n{job_description}"
            )
        ),
    ]

    response = llm.invoke(messages)
    content = response.content.strip()

    if content.startswith("```"):
        content = content.split("\n", 1)[1]
    if content.endswith("```"):
        content = content.rsplit("```", 1)[0]
    content = content.strip()

    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        parsed = {
            "error": "Failed to parse interview questions",
            "raw_response": content[:500],
        }

    return {**state, "interview_questions": parsed}
