/**
 * HomePage — Premium landing page for Smart Resume Builder.
 * Public route at /home. CTA buttons gate behind auth.
 * Statistics section is purely decorative (no auth required).
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../config/AuthContext';

const PIPELINE_STEPS = [
    { icon: 'search', num: '01', accent: 'indigo', title: 'Resume Analyzer', desc: 'Deep scan of structure, formatting, and content against industry standards.' },
    { icon: 'bar_chart', num: '02', accent: 'violet', title: 'Skill Gap Analysis', desc: 'Identifies missing keywords and skills compared to target job descriptions.' },
    { icon: 'auto_fix_high', num: '03', accent: 'cyan', title: 'ATS Optimizer', desc: 'Reformats your document structure for maximum readability by ATS bots.' },
    { icon: 'mic', num: '04', accent: 'emerald', title: 'Interview Prep', desc: 'Generates custom interview questions tailored to your new resume profile.' },
];

const FEATURES = [
    { icon: 'psychology', color: 'blue', title: 'AI Resume Analysis', desc: 'Our advanced LLMs parse your resume structure to understand your professional journey, detecting impactful metrics and quantifying your achievements.' },
    { icon: 'hub', color: 'violet', title: 'Semantic Skill Matching', desc: 'We don\'t just keyword stuff. We understand the context of your skills, ensuring "JS" matches "JavaScript" and "React" implies "Frontend" expertise.' },
    { icon: 'score', color: 'emerald', title: 'ATS Score Optimization', desc: 'See your score climb in real-time. We flag unreadable fonts, complex tables, and layout issues that confuse Applicant Tracking Systems.' },
    { icon: 'record_voice_over', color: 'amber', title: 'Interview Coaching', desc: 'Simulate the interview before the real thing. Get AI-generated questions specific to the job and your resume, with feedback on your answers.' },
];



export default function HomePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleCTA = () => navigate(user ? '/workspace' : '/auth');

    return (
        <div className="home-page">
            {/* ── Hero Section ─────────────────────────────── */}
            <section className="home-hero">
                <div className="home-hero__inner">
                    <div className="home-hero__badge">
                        <span className="home-hero__badge-dot" />
                        New: AI Interview Coach 2.0
                    </div>
                    <h1 className="home-hero__title">
                        Land Your Dream Job with{' '}
                        <span className="home-hero__gradient">AI-Powered Intelligence</span>
                    </h1>
                    <p className="home-hero__subtitle">
                        Optimize your resume for ATS systems, identify skill gaps, and get personalized interview coaching instantly.
                    </p>
                    <div className="home-hero__actions">
                        <button className="home-btn home-btn--primary" onClick={handleCTA}>
                            <span className="material-icons-round">upload_file</span>
                            Upload Resume
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Pipeline Section ─────────────────────────── */}
            <section className="home-pipeline" id="home-pipeline">
                <div className="home-pipeline__inner">
                    <h2 className="home-section-title">Resume Analysis Pipeline</h2>
                    <p className="home-section-subtitle">Our AI pipeline transforms your application in four steps</p>
                    <div className="home-pipeline__grid">
                        {PIPELINE_STEPS.map((step, i) => (
                            <React.Fragment key={i}>
                                <div className={`home-pipeline__card home-pipeline__card--${step.accent}`}>
                                    <div className="home-pipeline__card-num">{step.num}</div>
                                    <div className="home-pipeline__card-step-indicator">
                                        <span className="home-pipeline__card-step-dot" />
                                        <span className="home-pipeline__card-step-label">Step {step.num}</span>
                                    </div>
                                    <div className={`home-pipeline__card-icon home-pipeline__card-icon--${step.accent}`}>
                                        <span className="material-icons-round">{step.icon}</span>
                                    </div>
                                    <h3>{step.title}</h3>
                                    <p>{step.desc}</p>
                                    <div className={`home-pipeline__card-accent home-pipeline__card-accent--${step.accent}`} />
                                </div>
                                {i < PIPELINE_STEPS.length - 1 && (
                                    <div className="home-pipeline__connector">
                                        <div className="home-pipeline__connector-line" />
                                        <div className="home-pipeline__connector-arrow">
                                            <span className="material-icons-round">arrow_forward</span>
                                        </div>
                                        <div className="home-pipeline__connector-pulse" />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Workbench Preview ────────────────────────── */}
            <section className="home-workbench">
                <div className="home-workbench__inner">
                    <div className="home-workbench__window">
                        <div className="home-workbench__titlebar">
                            <div className="home-workbench__dots">
                                <span className="dot dot--red" />
                                <span className="dot dot--yellow" />
                                <span className="dot dot--green" />
                            </div>
                            <span className="home-workbench__titlebar-label">Analysis Workbench</span>
                        </div>
                        <div className="home-workbench__body">
                            {/* Left: Upload Zone */}
                            <div className="home-workbench__left">
                                <div className="home-workbench__upload-zone" onClick={handleCTA}>
                                    <div className="home-workbench__upload-icon">
                                        <span className="material-icons-round">cloud_upload</span>
                                    </div>
                                    <h3>Upload Resume</h3>
                                    <p>Drag &amp; drop PDF or DOCX</p>
                                </div>
                                <div className="home-workbench__divider">
                                    <span>Recent Files</span>
                                </div>
                                <div className="home-workbench__file">
                                    <div className="home-workbench__file-badge">PDF</div>
                                    <div className="home-workbench__file-info">
                                        <span>John_Doe_Software_Engineer.pdf</span>
                                        <span className="home-workbench__file-meta">2.4 MB • Just now</span>
                                    </div>
                                    <span className="material-icons-round home-workbench__file-check">check_circle</span>
                                </div>
                            </div>
                            {/* Right: Job Description */}
                            <div className="home-workbench__right">
                                <div className="home-workbench__jd-header">
                                    <span>Target Job Description</span>
                                    <span className="home-workbench__jd-auto">Auto-fetch from URL</span>
                                </div>
                                <div className="home-workbench__jd-area">
                                    <div className="home-workbench__jd-text">
                                        <p><strong>Senior Frontend Engineer</strong></p>
                                        <p>&nbsp;</p>
                                        <p><strong>About the role:</strong></p>
                                        <p>We are looking for a React expert with experience in Next.js and Tailwind CSS. You will be responsible for building high-performance web applications...</p>
                                        <p>&nbsp;</p>
                                        <p><strong>Requirements:</strong></p>
                                        <p>- 5+ years of experience</p>
                                        <p>- Strong understanding of semantic HTML</p>
                                        <p>- Experience with accessibility standards...</p>
                                    </div>
                                    <button className="home-workbench__analyze-btn" onClick={handleCTA}>
                                        Analyze Match <span className="material-icons-round">arrow_forward</span>
                                    </button>
                                </div>
                                <div className="home-workbench__stats-row">
                                    <div className="home-workbench__stat-box">
                                        <span className="home-workbench__stat-label">Keywords Found</span>
                                        <span className="home-workbench__stat-value">12<span className="home-workbench__stat-dim">/24</span></span>
                                    </div>
                                    <div className="home-workbench__stat-box">
                                        <span className="home-workbench__stat-label">Match Score</span>
                                        <span className="home-workbench__stat-value home-workbench__stat-value--accent">64%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features Grid ────────────────────────────── */}
            <section className="home-features" id="home-features">
                <div className="home-features__inner">
                    <div className="home-features__grid">
                        {FEATURES.map((f, i) => (
                            <div key={i} className={`home-feature-card home-feature-card--${f.color}`}>
                                <div className={`home-feature-card__icon home-feature-card__icon--${f.color}`}>
                                    <span className="material-icons-round">{f.icon}</span>
                                </div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                                <div className={`home-feature-card__bar home-feature-card__bar--${f.color}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Section ──────────────────────────────── */}
            <section className="home-cta" id="home-cta">
                <div className="home-cta__inner">
                    <h2>Ready to secure your next role?</h2>
                    <p>Join thousands of professionals who have upgraded their career trajectory with Smart Resume Builder.</p>
                    <div className="home-cta__actions">
                        <button className="home-btn home-btn--white" onClick={handleCTA}>
                            Get Started for Free
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Footer ───────────────────────────────────── */}
            <footer className="home-footer">
                <div className="home-footer__inner">
                    <div className="home-footer__brand">
                        <div className="home-footer__logo-box">
                            <span className="material-icons-round">description</span>
                        </div>
                        <span className="home-footer__brand-text">Smart Resume Builder</span>
                    </div>
                    <span className="home-footer__copy">© 2025 Smart Resume AI Inc. All rights reserved.</span>
                </div>
            </footer>
        </div>
    );
}
