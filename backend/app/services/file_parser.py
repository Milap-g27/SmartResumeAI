"""File parser service — extracts clean text from PDF and DOCX files."""

from pathlib import Path
import pdfplumber
from docx import Document


def parse_pdf(file_path: str) -> str:
    """Extract text from a PDF file using pdfplumber."""
    text_parts: list[str] = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts).strip()


def parse_docx(file_path: str) -> str:
    """Extract text from a DOCX file using python-docx."""
    doc = Document(file_path)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs).strip()


def parse_resume(file_path: str) -> str:
    """Auto-detect file type and parse to plain text.

    Raises ValueError for unsupported formats.
    """
    ext = Path(file_path).suffix.lower()
    if ext == ".pdf":
        return parse_pdf(file_path)
    elif ext in (".docx", ".doc"):
        return parse_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}. Only PDF and DOCX are accepted.")
