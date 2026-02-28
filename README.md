# 🚀 Smart Resume Builder + Interview Coach

> **Collaborative Multi-Agent System (CMAS)** — AI-powered resume analysis, ATS scoring, skill-gap detection, and comprehensive interview coaching.

Smart Resume Builder + Interview Coach is an intelligent, comprehensive career advancement platform designed to help job seekers optimize their applications and prepare for interviews with confidence. Powered by a sophisticated multi-agent AI system, the application acts as a personal career coach, guiding users from the initial resume review to final interview preparation.

---

## 🎯 What This App Does

In today's competitive job market, getting past the Applicant Tracking System (ATS) and excelling in interviews can be daunting. This application bridges the gap between your experience and your dream job by offering:

- **Intelligent ATS Optimization:** Automatically analyzes your resume against target job descriptions, scores it for ATS compatibility, and intelligently rewrites bullet points to highlight impact and metrics.
- **Skill Gap Analysis:** Pinpoints exactly which required skills are missing from your resume and suggests actionable learning paths.
- **Personalized Interview Prep:** Generates role-specific interview questions based on your unique experience and the target job description.
- **Interactive Mock Interviews:** Simulates real interview scenarios with an AI agent that evaluates your typed answers for clarity, depth, and communication skills, providing real-time feedback.

---

## 🌟 Key Features

### 1. 📄 Deep Resume Analysis
The platform doesn't just read your resume; it understands it. It breaks down your document (PDF or DOCX) into core sections, evaluates the quality of your content, and identifies weak or vague bullet points that need improvement.

### 2. ⚡ AI-Driven Resume Re-writing
Struggling to find the right action verbs? The **ATS Optimizer** revamps your experience bullet points, ensuring they are metrics-driven, impactful, and perfectly aligned with the job description.

**ATS Score Formula Integration:**
| Component | Weight |
|-----------|--------|
| Keyword Match | 40% |
| Skill Coverage | 25% |
| Experience Relevance | 20% |
| Formatting & Structure | 15% |

### 3. 🎯 Skill Match & Gap Detection
By comparing your parsed resume against a provided job description, the application identifies explicit and implicit skills you possess, while highlighting critical gaps you need to address to become the ideal candidate.

### 4. 🎤 Smart Interview Generation
Generic interview questions aren't enough. The **Interview Generator** crafts 15 highly targeted questions covering technical, project-specific, and behavioral domains, all tailored to the intersection of your resume and the target role.

### 5. 💬 Real-time Mock Interviews
Engage in a dialog with our **Mock Interview Coach**. Submit your answers and receive immediate, constructive feedback on your confidence, communication style, and technical depth.

---

## 🏗 The AI Architecture

The core of the application is a **Collaborative Multi-Agent System (CMAS)** built with LangGraph. Rather than relying on a single static prompt, the app utilizes 5 specialized AI agents that work together in a coordinated pipeline:

1. **Resume Analyzer Agent:** Parses the document to extract structural data and initial quality assessments.
2. **Skill Gap Agent:** Performs comparative analysis between the user's skills and the job requirements.
3. **ATS Optimizer Agent:** Calculates a comprehensive ATS score across Keyword Match, Skill Coverage, Experience Relevance, and Formatting, generating a freshly optimized resume.
4. **Interview Generator Agent:** Synthesizes the previous analyses to formulate highly context-aware, role-specific interview questions.
5. **Mock Interview Agent:** Operates dynamically to assess user responses during practice sessions.

### Agent Collaboration Flow
Each agent builds sequentially on the previous agent's insights by appending to a shared, stateful graph without overwriting context. This results in a holistic, highly intelligent output generation.

---

## 🎨 A Premium User Experience

The application is designed with a modern, FAANG-level user interface featuring:
- **Sleek Dark & Light Themes** highlighting premium aesthetics with glassmorphism.
- **Intuitive Visualizations**, including animated circular ATS meters and responsive tabbed dashboards.
- **Seamless Workflows** from drag-and-drop file uploads to one-click copy functionality for your newly optimized resume.

---

## 🛠 Built With

- **Frontend:** React, Vite, Custom Modern CSS
- **Backend:** FastAPI, Python
- **AI Orchestration:** LangGraph
- **LLM Engine:** ChatGroq (`llama-3.3-70b-versatile`)
- **Document Processing:** PDFPlumber, python-docx
