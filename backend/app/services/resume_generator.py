"""Resume generator service — converts markdown resume to PDF and DOCX."""

from __future__ import annotations

import io
import re
from pathlib import Path

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    HRFlowable,
)
from reportlab.lib.colors import HexColor

from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH


# ═══════════════════════════════════════════════════════════════════
# PDF Generation (reportlab)
# ═══════════════════════════════════════════════════════════════════

def _build_pdf_styles():
    """Create ATS-safe PDF styles."""
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name="ResumeName",
        parent=styles["Title"],
        fontSize=18,
        leading=22,
        alignment=TA_CENTER,
        spaceAfter=4,
        textColor=HexColor("#1a1a1a"),
    ))

    styles.add(ParagraphStyle(
        name="ResumeContact",
        parent=styles["Normal"],
        fontSize=10,
        alignment=TA_CENTER,
        spaceAfter=12,
        textColor=HexColor("#555555"),
    ))

    styles.add(ParagraphStyle(
        name="SectionHeading",
        parent=styles["Heading2"],
        fontSize=13,
        leading=16,
        spaceBefore=14,
        spaceAfter=6,
        textColor=HexColor("#1a1a1a"),
        borderWidth=0,
    ))

    styles.add(ParagraphStyle(
        name="SubHeading",
        parent=styles["Heading3"],
        fontSize=11,
        leading=14,
        spaceBefore=8,
        spaceAfter=3,
        textColor=HexColor("#333333"),
    ))

    styles.add(ParagraphStyle(
        name="ResumeBody",
        parent=styles["Normal"],
        fontSize=10.5,
        leading=14,
        spaceAfter=3,
        textColor=HexColor("#333333"),
    ))

    styles.add(ParagraphStyle(
        name="BulletItem",
        parent=styles["Normal"],
        fontSize=10.5,
        leading=14,
        leftIndent=18,
        spaceAfter=2,
        bulletIndent=6,
        textColor=HexColor("#333333"),
    ))

    return styles


def generate_pdf(markdown_text: str) -> bytes:
    """Convert markdown resume text to ATS-safe PDF bytes."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=LETTER,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
    )
    styles = _build_pdf_styles()
    story = []

    lines = markdown_text.strip().split("\n")
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()

        # H1 — Name
        if line.startswith("# ") and not line.startswith("## "):
            text = line[2:].strip()
            story.append(Paragraph(text, styles["ResumeName"]))

        # H2 — Section heading
        elif line.startswith("## "):
            text = line[3:].strip()
            story.append(HRFlowable(
                width="100%", thickness=0.5,
                color=HexColor("#cccccc"), spaceAfter=2, spaceBefore=6,
            ))
            story.append(Paragraph(f"<b>{text.upper()}</b>", styles["SectionHeading"]))

        # H3 — Sub heading (company/role)
        elif line.startswith("### "):
            text = line[4:].strip()
            story.append(Paragraph(f"<b>{text}</b>", styles["SubHeading"]))

        # Bullet
        elif line.strip().startswith("- "):
            text = line.strip()[2:].strip()
            # Handle bold within bullets
            text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
            story.append(Paragraph(f"• {text}", styles["BulletItem"]))

        # Contact line (line right after H1, no prefix)
        elif line.strip().startswith("Contact:") or line.strip().startswith("Email:"):
            story.append(Paragraph(line.strip(), styles["ResumeContact"]))

        # Empty line
        elif not line.strip():
            story.append(Spacer(1, 4))

        # Regular text
        else:
            text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", line.strip())
            if text:
                story.append(Paragraph(text, styles["ResumeBody"]))

        i += 1

    doc.build(story)
    return buf.getvalue()


# ═══════════════════════════════════════════════════════════════════
# DOCX Generation (python-docx)
# ═══════════════════════════════════════════════════════════════════

def generate_docx(markdown_text: str) -> bytes:
    """Convert markdown resume text to DOCX bytes."""
    doc = Document()

    # Set margins
    for section in doc.sections:
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)
        section.top_margin = Inches(0.6)
        section.bottom_margin = Inches(0.6)

    lines = markdown_text.strip().split("\n")

    for line in lines:
        line_stripped = line.rstrip()

        # H1 — Name
        if line_stripped.startswith("# ") and not line_stripped.startswith("## "):
            text = line_stripped[2:].strip()
            p = doc.add_heading(text, level=0)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                run.font.size = Pt(18)
                run.font.color.rgb = RGBColor(26, 26, 26)

        # H2 — Section heading
        elif line_stripped.startswith("## "):
            text = line_stripped[3:].strip()
            p = doc.add_heading(text.upper(), level=1)
            for run in p.runs:
                run.font.size = Pt(13)
                run.bold = True
                run.font.color.rgb = RGBColor(26, 26, 26)

        # H3 — Sub heading
        elif line_stripped.startswith("### "):
            text = line_stripped[4:].strip()
            p = doc.add_heading(text, level=2)
            for run in p.runs:
                run.font.size = Pt(11)
                run.bold = True
                run.font.color.rgb = RGBColor(51, 51, 51)

        # Bullet
        elif line_stripped.strip().startswith("- "):
            text = line_stripped.strip()[2:].strip()
            # Remove markdown bold markers
            text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
            p = doc.add_paragraph(text, style="List Bullet")
            for run in p.runs:
                run.font.size = Pt(11)

        # Empty line — skip
        elif not line_stripped.strip():
            continue

        # Regular text
        else:
            text = re.sub(r"\*\*(.+?)\*\*", r"\1", line_stripped.strip())
            if text:
                p = doc.add_paragraph(text)
                for run in p.runs:
                    run.font.size = Pt(11)

    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()
