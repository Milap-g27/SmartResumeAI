"""Agent 3 — ATS Optimization Agent (Deterministic Scoring)

All numeric ATS scoring is performed by a pure-Python function
(`calculate_ats_score`).  The LLM is restricted to plain-language
explanation, weak-area identification, and actionable suggestions.
"""

from __future__ import annotations

import json
import re
import math
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from app.schemas.models import AgentState


# ── Deterministic ATS Scoring (pure Python) ─────────────────────────

def calculate_ats_score(skill_gap: dict, resume_text: str) -> dict:
    """Compute a deterministic ATS score.  Same inputs → same outputs.

    Parameters
    ----------
    skill_gap : dict
        Output of the skill-gap agent.  Expected keys (all optional):
        exact_match_score, semantic_match_score, final_skill_coverage,
        exact_matches, semantic_matches, truly_missing_skills.
    resume_text : str
        Raw resume text used for keyword / formatting heuristics.

    Returns
    -------
    dict   { "total_score": int(0-100),
             "breakdown": { keyword_match, semantic_match,
                            skill_coverage, experience_relevance,
                            formatting } }
    """

    # ── helpers ──────────────────────────────────────────────────────
    text_lower = resume_text.lower() if resume_text else ""
    word_count = len(text_lower.split())

    exact_matches: list[str] = skill_gap.get("exact_matches", [])
    semantic_matches: list[dict] = skill_gap.get("semantic_matches", [])
    truly_missing: list[str] = skill_gap.get("truly_missing_skills", [])

    total_required = len(exact_matches) + len(semantic_matches) + len(truly_missing)
    if total_required == 0:
        total_required = 1  # avoid division-by-zero

    # ── 1. Keyword Match  (0-30) ────────────────────────────────────
    #    Ratio of exact-matched skills to total required, scaled to 30.
    exact_ratio = len(exact_matches) / total_required
    keyword_match = round(exact_ratio * 30)

    # ── 2. Semantic Match (0-20) ────────────────────────────────────
    #    Weighted by confidence of each semantic match.
    if semantic_matches:
        avg_conf = sum(m.get("confidence", 0.0) for m in semantic_matches) / len(semantic_matches)
        sem_ratio = (len(semantic_matches) / total_required) * avg_conf
    else:
        sem_ratio = 0.0
    semantic_match = round(min(sem_ratio, 1.0) * 20)

    # ── 3. Skill Coverage (0-20) ────────────────────────────────────
    #    Uses final_skill_coverage from the skill-gap agent (exact + semantic).
    coverage = float(skill_gap.get("final_skill_coverage", 0.0))
    coverage = max(0.0, min(coverage, 1.0))
    skill_coverage = round(coverage * 20)

    # ── 4. Experience Relevance (0-20) ──────────────────────────────
    #    Heuristic: presence of quantifiable metrics, action verbs,
    #    date ranges, and reasonable length signal relevant experience.
    exp_score = 0.0

    # Action verbs present?
    action_verbs = [
        "led", "managed", "developed", "designed", "implemented",
        "built", "created", "launched", "improved", "increased",
        "decreased", "achieved", "delivered", "optimized", "drove",
        "established", "coordinated", "spearheaded", "engineered",
        "architected", "automated", "deployed", "mentored", "analyzed",
    ]
    verb_hits = sum(1 for v in action_verbs if f" {v} " in f" {text_lower} ")
    exp_score += min(verb_hits / 6.0, 1.0) * 8  # up to 8 pts

    # Quantifiable metrics (numbers with %, $, x  or plain large numbers)?
    metrics = re.findall(r"\d+[\%\$xX]|\$\d+|\d{2,}", text_lower)
    exp_score += min(len(metrics) / 5.0, 1.0) * 6  # up to 6 pts

    # Date ranges?  (20XX – 20XX, etc.)
    date_ranges = re.findall(r"20\d{2}", text_lower)
    exp_score += min(len(date_ranges) / 4.0, 1.0) * 3  # up to 3 pts

    # Reasonable length?
    if word_count >= 200:
        exp_score += 3  # up to 3 pts
    elif word_count >= 100:
        exp_score += 1.5

    experience_relevance = round(min(exp_score, 20))

    # ── 5. Formatting & Structure (0-10) ────────────────────────────
    fmt_score = 0.0

    # Has common section headers?
    section_kws = ["experience", "education", "skills", "summary",
                   "projects", "certifications", "objective"]
    headers_found = sum(1 for k in section_kws if k in text_lower)
    fmt_score += min(headers_found / 4.0, 1.0) * 4  # up to 4 pts

    # Bullet points / line structure?
    bullet_count = text_lower.count("•") + text_lower.count("- ") + text_lower.count("* ")
    fmt_score += min(bullet_count / 6.0, 1.0) * 3  # up to 3 pts

    # No excessive whitespace / reasonable length
    if 150 <= word_count <= 1200:
        fmt_score += 3
    elif word_count > 1200:
        fmt_score += 1  # too long penalizes slightly

    formatting = round(min(fmt_score, 10))

    # ── Total ───────────────────────────────────────────────────────
    total = keyword_match + semantic_match + skill_coverage + experience_relevance + formatting
    total = max(0, min(total, 100))

    return {
        "total_score": total,
        "breakdown": {
            "keyword_match": keyword_match,
            "semantic_match": semantic_match,
            "skill_coverage": skill_coverage,
            "experience_relevance": experience_relevance,
            "formatting": formatting,
        },
    }


# ── LLM Prompt (explanation & suggestions only — NO scoring) ────────

SYSTEM_PROMPT = """\
You are an ATS (Applicant Tracking System) Explanation AI.

You are given:
1. A precomputed ATS score (total + breakdown). This score was calculated deterministically by a Python function. You must NOT recalculate, modify, or override it.
2. The original resume text.
3. A job description.
4. A skill gap analysis.

DO NOT recalculate or modify the ats_score. You must not output numbers for scoring.

Your ONLY job is to:
A. Explain what the precomputed ATS score means in plain language.
B. Identify the weak areas that lowered the score.
C. Provide concrete, actionable improvement suggestions.

You MUST return ONLY valid JSON (no markdown fences) in this EXACT shape:
{
  "ats_explanation": "string (plain-language summary of the score)",
  "weak_areas": ["string (area that hurt the score)"],
  "improvement_actions": ["string (concrete step the candidate should take)"]
}

Do NOT include any other fields. Do NOT output any numbers or scores.
"""

RESUME_OPTIMIZER_PROMPT = """\
You are an elite, FAANG-level professional resume rewriter. You will be given:
1. The original resume text.
2. A job description.
3. A skill gap analysis (missing skills, semantic matches).
4. An ATS score with weak areas and improvement actions.

Your job is to rewrite the resume so it is OPTIMIZED for the target job while preserving all original content and intent.

CRITICAL FORMATTING RULES - YOU MUST FOLLOW THESE EXACTLY:
1. Name: Start with the candidate's name as a Heading 1 (`# First Last`).
2. Contact Info: The very next line MUST be the contact info, pipe-separated. Do NOT use headers for this.
   Example: `email@example.com | +1 234 567 8900 | linkedin.com/in/user | github.com/user`
3. Sections: Use Heading 2 for ALL sections (`## SUMMARY`, `## PROFESSIONAL EXPERIENCE`, `## EDUCATION`, `## SKILLS`, `## PROJECTS`, `## CERTIFICATIONS`, etc. as present in the original resume).
4. Experience & Education Headers: You MUST format the header for EVERY job and education entry EXACTLY as a Heading 3 with 4 pipe-separated parts:
   `### COMPANY OR SCHOOL | ROLE OR DEGREE | LOCATION | DATES`
   Example: `### Exponentia.ai | Data Scientist | Bangalore, India | Jun 2024 - Present`
   If location or dates are missing or irrelevant, leave the section between pipes blank or put a space: `### Personal Project | Developer | | 2023`
5. Bullet Points: Use standard markdown bullets (`- `). Keep every original bullet's meaning and factual content, but rewrite for stronger action verbs, clarity, and measurable impact language when metrics already exist.
6. Skills Section: Preserve all original skills/tools/technologies listed in the resume. You may reorganize and group them for readability, but do NOT remove any listed skill/tool.
7. Content Preservation (MANDATORY): Do NOT delete sections, jobs, projects, education entries, certifications, or meaningful bullets from the original resume. You may refine wording, reorder for readability, and fix structure, but you must retain all substantive information.
8. Length: Do NOT force one-page compression. Optimize for clarity and ATS readability, not aggressive cutting.
9. ABSOLUTE STRICT FACTUALITY: You MUST NOT hallucinate or falsify any information. DO NOT add fake skills, fake experiences, fake companies, or fake metrics/results. You must ONLY use the exact data provided in the original resume. If a skill from the Job Description is not in the original resume, DO NOT add it. You are an editor, not a fabricator.
10. Output ONLY the raw markdown text. Do NOT include any markdown code blocks (```markdown), do NOT write `---`, do NOT include commentary. Output the literal resume text.
"""


# ── Agent entry point ───────────────────────────────────────────────

def ats_optimizer_agent(state: AgentState) -> AgentState:
    """Score resume deterministically, then ask LLM for explanation and resume optimization."""

    resume_text = state.get("resume_text", "")
    job_description = state.get("job_description", "")
    skill_gap = state.get("skill_gap", {})

    # ── Step 1: Deterministic scoring (Python — no LLM) ─────────────
    ats_score = calculate_ats_score(skill_gap, resume_text)

    # ── Step 2: LLM for explanation + suggestions ───────────────────
    llm = ChatGroq(model="openai/gpt-oss-120b", temperature=0)

    skill_gap_json = json.dumps(skill_gap, indent=2)
    ats_score_json = json.dumps(ats_score, indent=2)

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(
            content=(
                f"Precomputed ATS Score (DO NOT CHANGE):\n{ats_score_json}\n\n"
                f"Original Resume:\n{resume_text}\n\n"
                f"Job Description:\n{job_description}\n\n"
                f"Skill Gap Analysis:\n{skill_gap_json}"
            )
        ),
    ]

    response = llm.invoke(messages)
    content = response.content.strip()

    # Strip markdown fences if present
    if content.startswith("```"):
        content = content.split("\n", 1)[1]
    if content.endswith("```"):
        content = content.rsplit("```", 1)[0]
    content = content.strip()

    # ── Step 3: Parse LLM response with fallback ────────────────────
    try:
        analysis = json.loads(content)
        # Enforce only allowed keys
        analysis = {
            "ats_explanation": str(analysis.get("ats_explanation", "")),
            "weak_areas": [str(w) for w in analysis.get("weak_areas", [])],
            "improvement_actions": [str(a) for a in analysis.get("improvement_actions", [])],
        }
    except (json.JSONDecodeError, AttributeError):
        analysis = {
            "ats_explanation": "Unable to generate explanation.",
            "weak_areas": [],
            "improvement_actions": [],
            "error": "Failed to parse LLM response",
            "raw_response": content[:500],
        }

    # ── Step 4: LLM for optimized resume rewrite ────────────────────
    optimizer_messages = [
        SystemMessage(content=RESUME_OPTIMIZER_PROMPT),
        HumanMessage(
            content=(
                f"Original Resume:\n{resume_text}\n\n"
                f"Job Description:\n{job_description}\n\n"
                f"Skill Gap Analysis:\n{skill_gap_json}\n\n"
                f"Weak Areas: {json.dumps(analysis.get('weak_areas', []))}\n\n"
                f"Improvement Actions: {json.dumps(analysis.get('improvement_actions', []))}"
            )
        ),
    ]

    try:
        opt_response = llm.invoke(optimizer_messages)
        optimized_resume = opt_response.content.strip()
        # Strip markdown fences if wrapped
        if optimized_resume.startswith("```"):
            optimized_resume = optimized_resume.split("\n", 1)[1]
        if optimized_resume.endswith("```"):
            optimized_resume = optimized_resume.rsplit("```", 1)[0]
        optimized_resume = optimized_resume.strip()
    except Exception:
        optimized_resume = ""

    # ── Step 5: Build final result ──────────────────────────────────
    final_result = {
        # Contract shape
        "ats_score": ats_score,
        "analysis": analysis,
        # Backward-compatible flat keys (frontend + downloads)
        "total_score": ats_score["total_score"],
        "breakdown": ats_score["breakdown"],
        "improvement_actions": analysis.get("improvement_actions", []),
        "ats_explanation": analysis.get("ats_explanation", ""),
        "weak_areas": analysis.get("weak_areas", []),
        "optimized_resume": optimized_resume,
    }

    return {**state, "ats_result": final_result}
