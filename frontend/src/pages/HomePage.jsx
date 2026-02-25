import React from 'react';
import FileUpload from '../components/FileUpload';
import JobDescriptionInput from '../components/JobDescriptionInput';

const PIPELINE_STEPS = [
    { icon: 'description', title: 'Resume Analyzer', desc: 'Deep scan of structure & content' },
    { icon: 'compare_arrows', title: 'Skill Gap', desc: 'Semantic skill matching' },
    { icon: 'trending_up', title: 'ATS Optimizer', desc: 'Score & optimize for ATS' },
    { icon: 'record_voice_over', title: 'Interview Prep', desc: 'Custom questions & coaching' },
];

const FEATURES = [
    { icon: 'psychology', title: 'AI Resume Analysis', desc: 'Deep structural & content analysis powered by advanced LLMs' },
    { icon: 'hub', title: 'Semantic Skill Matching', desc: 'Context-aware matching — "JS" maps to "JavaScript" automatically' },
    { icon: 'speed', title: 'ATS Score Optimization', desc: 'Real-time scoring against industry-standard tracking systems' },
    { icon: 'mic', title: 'Interview Coaching', desc: 'AI-generated questions with real-time feedback on your answers' },
];



export default function HomePage({ file, onFileChange, jobDesc, onJobDescChange, onAnalyze, loading, error }) {
    return (
        <div>
            {/* ── Hero Section ─────────────────────────────────────── */}
            <section className="hero">
                <div className="hero__badge">
                    <span className="material-icons-round" style={{ fontSize: '14px' }}>auto_awesome</span>
                    Powered by 4 Specialized AI Agents
                </div>
                <h1>Land Your Dream Job with AI-Powered Resume Intelligence</h1>
                <p className="hero__subtitle">
                    Analyze, optimize, and ace interviews — get your resume past ATS systems and into the hands of hiring managers.
                </p>
                <div className="hero__actions">
                    <button className="btn-primary" onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}>
                        <span className="material-icons-round" style={{ fontSize: '20px' }}>rocket_launch</span>
                        Analyze Your Resume
                    </button>
                    <button className="btn-outline" onClick={() => document.getElementById('pipeline-section')?.scrollIntoView({ behavior: 'smooth' })}>
                        <span className="material-icons-round" style={{ fontSize: '20px' }}>play_circle</span>
                        See How It Works
                    </button>
                </div>
            </section>

            {/* ── Pipeline Section ─────────────────────────────────── */}
            <section className="pipeline" id="pipeline-section">
                <div className="pipeline__label">How It Works</div>
                <div className="pipeline__title">4-Step AI Analysis Pipeline</div>
                <div className="pipeline__steps">
                    <div className="pipeline__connector" />
                    {PIPELINE_STEPS.map((step, i) => (
                        <div key={i} className="pipeline__step">
                            <div className="pipeline__icon-wrap">
                                <span className="material-icons-round">{step.icon}</span>
                            </div>
                            <div className="pipeline__step-title">{step.title}</div>
                            <div className="pipeline__step-desc">{step.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Upload Section ────────────────────────────────────── */}
            <section className="upload-section" id="upload-section">
                <div className="upload-section__title">Analysis Workbench</div>
                <div className="upload-section__subtitle">Upload your resume and paste the job description to begin</div>

                {error && (
                    <div className="error-banner">
                        <span className="material-icons-round" style={{ fontSize: '20px' }}>error_outline</span>
                        {error}
                    </div>
                )}

                <div className="input-grid">
                    <div className="glass-card">
                        <label className="label">
                            <span className="material-icons-round" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '0.35rem' }}>upload_file</span>
                            Upload Resume
                        </label>
                        <FileUpload file={file} onFileChange={onFileChange} />
                    </div>
                    <div className="glass-card">
                        <JobDescriptionInput value={jobDesc} onChange={onJobDescChange} />
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <button
                        className="btn-primary"
                        onClick={onAnalyze}
                        disabled={!file || !jobDesc.trim() || loading}
                        id="analyze-btn"
                    >
                        {loading ? (
                            <>
                                <span className="material-icons-round" style={{ fontSize: '20px', animation: 'spin 1s linear infinite' }}>autorenew</span>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <span className="material-icons-round" style={{ fontSize: '20px' }}>rocket_launch</span>
                                Analyze Resume
                            </>
                        )}
                    </button>
                </div>

                {loading && (
                    <div className="loading-container">
                        <div className="spinner" />
                        <div className="loading-text">Running 4 AI agents...</div>
                        <div className="loading-step">
                            Resume Analyzer → Skill Gap → ATS Optimizer → Interview Generator
                        </div>
                    </div>
                )}
            </section>

            {/* ── Features Section ──────────────────────────────────── */}
            <section className="features-section" id="features-section">
                <div className="features-section__title">Powered by Advanced AI</div>
                <div className="features-section__subtitle">Four specialized agents work together to supercharge your job application</div>
                <div className="features-grid">
                    {FEATURES.map((f, i) => (
                        <div key={i} className="feature-card">
                            <div className="feature-card__icon">
                                <span className="material-icons-round">{f.icon}</span>
                            </div>
                            <div className="feature-card__title">{f.title}</div>
                            <div className="feature-card__desc">{f.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}
