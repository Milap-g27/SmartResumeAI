"""Agent 5 — Mock Interview Feedback Agent
Evaluates user answers to interview questions and provides structured feedback.
"""

from __future__ import annotations

import json
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from app.schemas.models import AgentState

SYSTEM_PROMPT = """You are a Mock Interview Evaluator AI.

You receive:
1. An interview question
2. The candidate's typed answer

**Your tasks:**
Evaluate the answer on these dimensions (each scored 0-10):

1. **Clarity**: Is the answer well-structured and easy to follow?
2. **Technical Depth**: Does the answer demonstrate strong technical knowledge?
3. **Communication**: Is the answer articulate and professionally communicated?
4. **Confidence**: Does the answer convey confidence and conviction?

Also provide:
- A specific improvement suggestion
- A perfect, FAANG-level "Sample Answer" broken down into 3-4 highly concise, plain-text bullet points. DO NOT use markdown formatting like `**bold**` or `*italics*`. Just return clean, concise sentences.
- A list of strengths observed in the answer

**You MUST return ONLY valid JSON** (no markdown, no code fences):
{
  "clarity": 0-10,
  "technical_depth": 0-10,
  "communication": 0-10,
  "confidence": 0-10,
  "improvement": "string (specific actionable suggestion)",
  "sample_answer": ["First concise point...", "Second concise point..."],
  "strengths": ["string"]
}
"""


def mock_interview_agent(state: AgentState) -> AgentState:
    """Evaluate a mock interview answer."""
    llm = ChatGroq(model="openai/gpt-oss-120b", temperature=0.2)

    question = state.get("question", "")
    user_answer = state.get("user_answer", "")

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(
            content=(
                f"Interview Question:\n{question}\n\n"
                f"Candidate's Answer:\n{user_answer}"
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
            "error": "Failed to parse mock interview feedback",
            "raw_response": content[:500],
        }

    return {**state, "mock_feedback": parsed}
