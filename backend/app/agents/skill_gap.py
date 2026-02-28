"""Agent 2 — Skill Gap Analyzer (Semantic Matching)
Uses LLM reasoning to perform semantic skill matching between resume and JD.
"""

from __future__ import annotations

import json
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from app.schemas.models import AgentState

SYSTEM_PROMPT = """You are a Skill Gap Analysis AI with SEMANTIC MATCHING capability.

You receive:
1. A structured resume analysis (JSON) containing detected skills
2. A job description

**Your tasks — follow these STRICTLY:**

1. Extract ALL required skills/technologies/competencies from the job description.
2. For each JD skill, determine if the resume covers it through:
**SEMANTIC MATCHING RULES - YOU MUST APPLY INTELLIGENT, DYNAMIC REASONING:**
- **Level of Abstraction:** You must constantly bridge the gap between "Specific Tool/Service" and "Broad Capability/Category". Do not rely on exact keyword matches if the underlying concepts are identical.
- **Provider Equivalence:** If a JD asks for a broad capability (e.g., "Cloud Computing", "DevOps", "Infrastructure as Code", "Vector Databases", "Production APIs"), and the resume lists ANY specific tool that fulfills that capability (e.g., "AWS EC2/GCP Compute" for Cloud, "Docker/Jenkins/Terraform" for DevOps, "FAISS/Pinecone" for Vector DBs, "FastAPI" for APIs), it MUST be scored as a strong **Semantic Match** or even **Exact Match**.
- **Specialization to Generalization:** If a candidate has a specialized version of a skill (e.g., "Time Series Forecasting", "NLP", "CNNs"), they inherently possess the parent skill (e.g., "Machine Learning", "Data Science").
- **Framework to Language:** If a candidate extensively uses a framework (e.g., React, Django, Spring Boot), assume they possess the underlying language skill (e.g., JavaScript, Python, Java).
- **Relational Databases:** If a candidate mentions SQL, PostgreSQL, MySQL, etc., they satisfy requirements for "RDBMS", "Relational Databases", or "SQL querying".
- **BE SMART, CHARITABLE, AND EXPERT-LEVEL:** You are evaluating a human's capabilities. If they can deploy an agentic AI workflow to Kubernetes, they know "DevOps". If they use LangChain, they know "Generative AI". Connect the dots using your deep technical knowledge of the modern software/AI ecosystem.

**CONFIDENCE SCORING:**
- Direct parent skill covers child: 0.70–0.85
- Closely related skill: 0.55–0.70
- Tangentially related: 0.35–0.55

3. Calculate scores:
   - exact_match_score = (exact matches / total required skills)
   - semantic_match_score = (avg confidence of semantic matches × semantic matches / total required skills)
   - final_skill_coverage = exact_match_score + semantic_match_score (capped at 1.0)

4. Only list skills as "truly_missing" if they have NO exact or semantic match at all.

5. For each truly missing skill, suggest a learning resource.

**You MUST return ONLY valid JSON** (no markdown, no code fences):
{
  "exact_match_score": 0.0-1.0,
  "semantic_match_score": 0.0-1.0,
  "final_skill_coverage": 0.0-1.0,
  "exact_matches": ["string"],
  "semantic_matches": [
    {
      "jd_skill": "string (the JD requirement)",
      "mapped_to": "string (the resume skill that covers it)",
      "confidence": 0.0-1.0
    }
  ],
  "truly_missing_skills": ["string"],
  "learning_suggestions": [
    {
      "skill": "string",
      "suggestion": "string"
    }
  ]
}
"""


def skill_gap_agent(state: AgentState) -> AgentState:
    """Identify skill gaps with semantic matching between resume and job description."""
    llm = ChatGroq(model="openai/gpt-oss-120b", temperature=0)

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
            "error": "Failed to parse skill gap analysis",
            "raw_response": content[:500],
        }

    return {**state, "skill_gap": parsed}
