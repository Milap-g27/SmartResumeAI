"""GET /download/pdf/{session_id} and /download/docx/{session_id}
Generate downloadable resume files from the optimized markdown resume.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.services.session_store import get_session
from app.services.resume_generator import generate_pdf, generate_docx

router = APIRouter()


@router.get("/download/pdf/{session_id}")
async def download_pdf(session_id: str):
    """Generate and return the optimized resume as a PDF file."""
    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    ats_result = session.get("ats_result", {})
    markdown_text = ats_result.get("optimized_resume", "")
    if not markdown_text.strip():
        raise HTTPException(status_code=400, detail="No optimized resume available for this session.")

    try:
        pdf_bytes = generate_pdf(markdown_text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {exc}")

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=optimized_resume_{session_id[:8]}.pdf"},
    )


@router.get("/download/docx/{session_id}")
async def download_docx(session_id: str):
    """Generate and return the optimized resume as a DOCX file."""
    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    ats_result = session.get("ats_result", {})
    markdown_text = ats_result.get("optimized_resume", "")
    if not markdown_text.strip():
        raise HTTPException(status_code=400, detail="No optimized resume available for this session.")

    try:
        docx_bytes = generate_docx(markdown_text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"DOCX generation failed: {exc}")

    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename=optimized_resume_{session_id[:8]}.docx"},
    )
