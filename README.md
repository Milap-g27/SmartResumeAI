# Smart Resume Builder + Interview Coach

> AI-powered career platform — resume analysis, ATS optimization, skill-gap detection, cover letter generation, and interview coaching, all driven by a collaborative multi-agent system.

---

## Features

### Resume Analysis
Upload a PDF or DOCX resume alongside a target job description. The AI parses the document structure, extracts skills, evaluates bullet-point quality, and identifies weak or vague content. Non-skill items (AI tools, code editors, etc.) are automatically filtered out of the detected skills list.

### ATS Score & Resume Optimization
A weighted ATS compatibility score is calculated across four dimensions:

| Component | Weight |
|-----------|--------|
| Keyword Match | 40% |
| Skill Coverage | 25% |
| Experience Relevance | 20% |
| Formatting & Structure | 15% |

The optimizer rewrites bullet points for impact and keyword alignment while **preserving all original content** — no sections, skills, or projects are removed.

### Skill Gap Detection
Compares parsed resume skills against job description requirements. Surfaces matched skills, missing skills, and actionable learning recommendations to close the gaps.

### Cover Letter Generation
Generates a concise, professional cover letter (140–190 words, two paragraphs) scoped to the specific resume and job description. Drafts are persisted per analysis session and saved to the database.

### Interview Question Generation
Produces 15 targeted questions spanning technical, project-specific, and behavioral categories — derived from the intersection of the resume content and the target role.

### Mock Interview Coach
Interactive mock interview mode where users submit typed answers and receive real-time AI feedback on clarity, depth, confidence, and communication quality.

### Account & Preferences
Firebase-authenticated accounts with email/password sign-up, email verification, password reset, and a theme preference toggle (dark / light mode with glassmorphism UI).

---

## Architecture

### Multi-Agent Pipeline
Built on **LangGraph**, the backend orchestrates five specialized AI agents in a sequential pipeline where each agent appends to a shared state graph:

1. **Resume Analyzer** — Parses document structure, extracts skills, produces quality assessments
2. **Skill Gap Analyzer** — Compares detected skills against job requirements
3. **ATS Optimizer** — Scores ATS compatibility and generates an optimized resume
4. **Interview Generator** — Synthesizes prior analyses into role-specific questions
5. **Mock Interview Agent** — Dynamically evaluates user responses during practice sessions

A sixth standalone service, the **Cover Letter Generator**, operates outside the pipeline on demand.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router, react-pdf, Custom CSS |
| Backend | FastAPI, Python, LangGraph |
| LLM | ChatGroq (`openai/gpt-oss-120b`) |
| Auth | Firebase Admin SDK |
| Database | Supabase PostgreSQL (psycopg2) |
| Document Parsing | PDFPlumber, python-docx |

### Frontend Pages

| Page | Description |
|------|-------------|
| Home | Landing page with feature overview and CTA |
| Workspace | Split-view: PDF preview (single-page navigation) + job description input |
| Dashboard | Tabbed results — analysis, skill gap, ATS score, optimized resume, interview questions |
| Cover Letter | Generate / regenerate / copy a tailored cover letter |
| Account | Profile management, email verification, password reset, theme preference |

### Data Flow
1. User uploads resume + job description in the **Workspace**
2. Backend runs the 4-agent pipeline and returns combined results
3. Results are displayed in the **Dashboard** with tabbed panels
4. User can generate a **Cover Letter** or start a **Mock Interview** from the results
5. All analyses, cover letters, and interview responses are persisted to the database
