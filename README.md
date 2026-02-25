# 🚀 Smart Resume Builder + Interview Coach

> **Collaborative Multi-Agent System (CMAS)** — AI-powered resume analysis, ATS scoring, skill-gap detection, and interview coaching.

---

## 🏗 Architecture

```
User Input → FastAPI Backend → LangGraph Pipeline
                                    │
                    ┌───────────────┤
                    ▼               ▼
            Resume Analyzer    (PDF/DOCX Parser)
                    │
                    ▼
            Skill Gap Agent
                    │
                    ▼
            ATS Optimizer
                    │
                    ▼
          Interview Generator
                    │
                    ▼
            Dashboard Output
                    
            Mock Interview Agent  ← (separate endpoint)
```

### 5 Specialized Agents

| # | Agent | Purpose |
|---|-------|---------|
| 1 | **Resume Analyzer** | Parses resume, detects sections, evaluates quality, identifies weak bullets |
| 2 | **Skill Gap** | Extracts JD requirements, compares with resume skills, suggests learning paths |
| 3 | **ATS Optimizer** | Scores for ATS (0–100), rewrites bullets with action verbs & metrics, generates optimized resume |
| 4 | **Interview Generator** | Creates 15 questions (technical, project, behavioral) from resume + JD context |
| 5 | **Mock Interview** | Evaluates typed answers on clarity, depth, communication, confidence |

### ATS Score Formula

| Component | Weight |
|-----------|--------|
| Keyword Match | 40% |
| Skill Coverage | 25% |
| Experience Relevance | 20% |
| Formatting & Structure | 15% |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite) |
| Backend | FastAPI |
| Agent Orchestration | LangGraph |
| LLM | ChatGroq (`llama-3.3-70b-versatile`) |
| File Parsing | pdfplumber + python-docx |
| Tracing | LangSmith |

---

## 📁 Project Structure

```
Ballu/
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   ├── uploads/
│   └── app/
│       ├── main.py          # FastAPI app
│       ├── graph.py          # LangGraph orchestration
│       ├── agents/
│       │   ├── resume_analyzer.py
│       │   ├── skill_gap.py
│       │   ├── ats_optimizer.py
│       │   ├── interview_generator.py
│       │   └── mock_interview.py
│       ├── routes/
│       │   ├── analyze.py    # POST /analyze
│       │   ├── interview.py  # POST /mock-interview
│       │   └── session.py    # GET /session/{id}
│       ├── services/
│       │   ├── file_parser.py
│       │   └── session_store.py
│       └── schemas/
│           └── models.py
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── api/
        │   └── client.js
        ├── components/
        │   ├── FileUpload.jsx
        │   ├── JobDescriptionInput.jsx
        │   ├── AtsScoreMeter.jsx
        │   ├── TabPanel.jsx
        │   ├── InterviewCard.jsx
        │   └── MockInterview.jsx
        └── pages/
            ├── HomePage.jsx
            └── ResultsPage.jsx
```

---

## ⚡ Quick Start

### 1. Clone & Configure

```bash
cd Ballu/backend
copy .env.example .env
# Edit .env → add your GROQ_API_KEY
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/analyze` | Upload resume (PDF/DOCX) + job description → full analysis |
| `POST` | `/mock-interview` | Submit answer to an interview question → feedback |
| `GET` | `/session/{id}` | Retrieve stored analysis session |
| `GET` | `/health` | Health check |

### POST /analyze

```bash
curl -X POST http://localhost:8000/analyze \
  -F "resume=@resume.pdf" \
  -F "job_description=Senior Python Developer..."
```

### POST /mock-interview

```bash
curl -X POST http://localhost:8000/mock-interview \
  -H "Content-Type: application/json" \
  -d '{"session_id": "...", "question": "...", "answer": "..."}'
```

---

## 🔄 Agent Collaboration Flow

```
User uploads resume + pastes JD
         │
         ▼
┌─────────────────────┐
│  Resume Analyzer     │ → Parses text, detects sections, rates quality
│  Output: resume_analysis │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Skill Gap Agent     │ → Compares resume skills vs JD requirements
│  Input: resume_analysis + JD │
│  Output: skill_gap   │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  ATS Optimizer       │ → Scores ATS, rewrites bullets, generates optimized resume
│  Input: resume + JD + skill_gap │
│  Output: ats_result  │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Interview Generator │ → Creates 15 role-specific questions
│  Input: resume_analysis + JD │
│  Output: interview_questions │
└─────────────────────┘
```

Each agent **appends** to shared LangGraph state — no agent overwrites another's output.

---

## 📊 Observability

Set these environment variables to enable LangSmith tracing:

```env
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_key
LANGCHAIN_PROJECT=smart-resume-builder
```

Every agent node is automatically traced with execution time, input/output, and token usage.

---

## 🎨 Frontend Features

- **Dark mode** premium UI with glassmorphism
- **Drag & drop** resume upload (PDF/DOCX)
- **5 tabbed dashboard**: Insights, Skill Gap, ATS Score, Optimized Resume, Interview Prep
- **Animated circular ATS meter** (SVG)
- **One-click copy** optimized resume
- **Interactive mock interview** with real-time AI feedback
- **Responsive** mobile-friendly layout

---

## 📝 License

MIT
