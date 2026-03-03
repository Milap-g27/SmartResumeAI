"""Cover letter generator service using resume text + job description."""

from __future__ import annotations

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq


SYSTEM_PROMPT = """\
You are a senior career writing expert.

Generate a tailored cover letter using ONLY the information in the provided resume and job description.

Rules:
1. Output plain text only (no markdown, no code fences).
2. Keep it concise: 140-190 words.
3. Structure:
   - Greeting
    - 2 short body paragraphs
   - Closing paragraph
4. Match role requirements to candidate experience with direct evidence.
5. Do not invent facts, companies, years, or achievements.
6. Use professional, confident, and business-like tone.
7. Avoid fluff, generic statements, and repetition.
8. Prefer short, high-signal sentences and concrete impact.
9. Do not use exaggerated language (e.g., "passionate", "dream role", "thrilled").
"""


def generate_cover_letter(resume_text: str, job_description: str) -> str:
    """Generate a tailored cover letter from resume text and job description."""
    llm = ChatGroq(model="openai/gpt-oss-120b", temperature=0.2)

    response = llm.invoke(
        [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(
                content=(
                    f"Resume Text:\n{resume_text}\n\n"
                    f"Job Description:\n{job_description}"
                )
            ),
        ]
    )

    content = response.content.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[1]
    if content.endswith("```"):
        content = content.rsplit("```", 1)[0]
    return content.strip()
