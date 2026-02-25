"""LangGraph multi-agent orchestration.

Defines two graphs:
1. analysis_graph: Resume Analyzer → Skill Gap → ATS Optimizer → Interview Generator
2. mock_interview_graph: Mock Interview Agent (single node)
"""

from __future__ import annotations

from langgraph.graph import StateGraph, END

from app.schemas.models import AgentState
from app.agents.resume_analyzer import resume_analyzer_agent
from app.agents.skill_gap import skill_gap_agent
from app.agents.ats_optimizer import ats_optimizer_agent
from app.agents.interview_generator import interview_generator_agent
from app.agents.mock_interview import mock_interview_agent


# ── Analysis Pipeline ───────────────────────────────────────────────

def _build_analysis_graph() -> StateGraph:
    """Build the 4-agent analysis pipeline."""
    graph = StateGraph(AgentState)

    graph.add_node("resume_analyzer", resume_analyzer_agent)
    graph.add_node("skill_gap", skill_gap_agent)
    graph.add_node("ats_optimizer", ats_optimizer_agent)
    graph.add_node("interview_generator", interview_generator_agent)

    graph.set_entry_point("resume_analyzer")
    graph.add_edge("resume_analyzer", "skill_gap")
    graph.add_edge("skill_gap", "ats_optimizer")
    graph.add_edge("ats_optimizer", "interview_generator")
    graph.add_edge("interview_generator", END)

    return graph


# ── Mock Interview Pipeline ────────────────────────────────────────

def _build_mock_interview_graph() -> StateGraph:
    """Build the single-node mock interview pipeline."""
    graph = StateGraph(AgentState)

    graph.add_node("mock_interview", mock_interview_agent)
    graph.set_entry_point("mock_interview")
    graph.add_edge("mock_interview", END)

    return graph


# Compile graphs
analysis_pipeline = _build_analysis_graph().compile()
mock_interview_pipeline = _build_mock_interview_graph().compile()


# ── Public API ──────────────────────────────────────────────────────

def run_pipeline(resume_text: str, job_description: str) -> dict:
    """Run the full analysis pipeline.

    Returns the final shared state containing:
    - resume_analysis
    - skill_gap
    - ats_result
    - interview_questions
    """
    initial_state: AgentState = {
        "resume_text": resume_text,
        "job_description": job_description,
    }
    result = analysis_pipeline.invoke(initial_state)
    return dict(result)


def run_mock_interview(question: str, answer: str) -> dict:
    """Run the mock interview feedback agent.

    Returns the final state containing mock_feedback.
    """
    initial_state: AgentState = {
        "question": question,
        "user_answer": answer,
    }
    result = mock_interview_pipeline.invoke(initial_state)
    return dict(result)
