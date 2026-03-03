/**
 * DashboardPage — Tabbed dashboard showing all analysis results.
 * Reads data from sessionStorage (set by WorkspacePage after analysis).
 * Tabs: Resume Insights | Skill Gap | ATS Score | Optimized Resume | Interview Prep
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TabPanel from '../components/TabPanel';
import AtsScoreMeter from '../components/AtsScoreMeter';
import QuestionCard from '../components/interview/QuestionCard';
import { downloadPDF, downloadDOCX, getResumePDFBlob } from '../api/client';
import PdfViewer from '../components/resume/PdfViewer';

const TABS = ['Resume Insights', 'Skill Gap', 'ATS Score', 'Optimized Resume', 'Interview Prep'];

function hasDashboardPayload(payload) {
    if (!payload || typeof payload !== 'object') return false;

    return Boolean(
        payload.session_id
        || payload.resume_analysis
        || payload.skill_gap
        || payload.ats_result
        || payload.interview_questions
    );
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(0);
    const [data, setData] = useState(location.state || null);
    const [previewPdfUrl, setPreviewPdfUrl] = useState('');
    const [downloadError, setDownloadError] = useState('');
    const [dataMissing, setDataMissing] = useState(false);

    /* ── Resolve dashboard data from location.state or sessionStorage ── */
    useEffect(() => {
        if (hasDashboardPayload(location.state)) {
            setData(location.state);
            setDataMissing(false);
            sessionStorage.setItem('latestDashboardData', JSON.stringify(location.state));
            return;
        }

        const cached = sessionStorage.getItem('latestDashboardData');
        if (cached) {
            try {
                setData(JSON.parse(cached));
                setDataMissing(false);
                return;
            } catch {
                sessionStorage.removeItem('latestDashboardData');
            }
        }

        setDataMissing(true);
    }, [location.state]);

    /* ── Derive fields safely (may be null until data loads) ── */
    const session_id = data?.session_id;
    const resume_analysis = data?.resume_analysis;
    const skill_gap = data?.skill_gap;
    const ats_result = data?.ats_result;
    const interview_questions = data?.interview_questions;
    const optimizedResume = ats_result?.optimized_resume || '';

    /* ── PDF preview blob (MUST stay above any early return) ── */
    useEffect(() => {
        let objectUrl = '';

        if (!data) return;                       // guard — no data yet

        const loadPreview = async () => {
            if (!optimizedResume?.trim() && !session_id) {
                setPreviewPdfUrl('');
                return;
            }

            try {
                const blob = await getResumePDFBlob({ sessionId: session_id, optimizedResume });
                objectUrl = URL.createObjectURL(blob);
                setPreviewPdfUrl(objectUrl);
            } catch {
                setPreviewPdfUrl('');
            }
        };

        loadPreview();

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [data, session_id, optimizedResume]);

    /* ── Download handlers ── */
    const handleDownloadPDF = async () => {
        setDownloadError('');
        try {
            await downloadPDF(session_id, optimizedResume);
        } catch (err) {
            setDownloadError(err.message || 'Unable to download your PDF right now. Please try again.');
        }
    };

    const handleDownloadDOCX = async () => {
        setDownloadError('');
        try {
            await downloadDOCX(session_id, optimizedResume);
        } catch (err) {
            setDownloadError(err.message || 'Unable to download your DOCX right now. Please try again.');
        }
    };

    /* ── Empty-state placeholder for tabs without data ── */
    const EmptyTab = ({ icon, label }) => (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <span className="material-icons-round" style={{ fontSize: '3rem', color: 'var(--accent-indigo)', opacity: 0.5 }}>{icon}</span>
            <p style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
            <p style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Upload your resume and a job description in Workspace to see results here.
            </p>
            <button className="btn-primary" onClick={() => navigate('/workspace')} style={{ marginTop: '1.25rem' }}>
                <span className="material-icons-round" style={{ fontSize: '18px' }}>workspaces</span>
                Go to Workspace
            </button>
        </div>
    );

    return (
        <div className="dashboard">
            <div className="dashboard__header">
                <button className="back-btn" onClick={() => navigate('/workspace')} id="back-btn">
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>arrow_back</span>
                    New Analysis
                </button>
                <h1 className="dashboard__title">Analysis Dashboard</h1>
            </div>

            <TabPanel tabs={TABS} active={activeTab} onChange={setActiveTab}>
                {/* ── Tab 0: Resume Insights ──────────────────────── */}
                {activeTab === 0 && resume_analysis && (
                    <div>
                        <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
                            <div className="section-title">
                                <span className="material-icons-round" style={{ fontSize: '20px' }}>person</span>
                                Candidate
                            </div>
                            <div className="section-body">
                                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{resume_analysis.full_name || 'N/A'}</strong>
                                <br />
                                <span style={{ fontSize: '0.85rem' }}>{resume_analysis.email} • {resume_analysis.phone}</span>
                            </div>
                            {resume_analysis.summary && (
                                <div className="section-body" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)' }}>
                                    {resume_analysis.summary}
                                </div>
                            )}
                        </div>

                        <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
                            <div className="section-title">
                                <span className="material-icons-round" style={{ fontSize: '20px', color: 'var(--accent-amber)' }}>star</span>
                                Overall Quality: <span style={{ color: 'var(--accent-emerald)' }}>{resume_analysis.overall_quality}/10</span>
                            </div>
                        </div>

                        {resume_analysis.skills_found?.length > 0 && (
                            <div className="glass-card" style={{ marginBottom: '1.25rem' }}>
                                <div className="section-title">
                                    <span className="material-icons-round" style={{ fontSize: '20px' }}>build</span>
                                    Skills Detected
                                </div>
                                <div className="chip-container">
                                    {resume_analysis.skills_found.map((s) => (
                                        <span key={s} className="chip chip-neutral">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {resume_analysis.sections?.map((sec, i) => (
                            <div key={i} className="section-card">
                                <div className="section-title">
                                    <span className="material-icons-round" style={{ fontSize: '18px' }}>article</span>
                                    {sec.name}
                                    <span style={{ marginLeft: 'auto', color: sec.quality_score >= 7 ? 'var(--accent-emerald)' : sec.quality_score >= 5 ? 'var(--accent-amber)' : 'var(--accent-rose)', fontWeight: 700 }}>
                                        {sec.quality_score}/10
                                    </span>
                                </div>
                                {sec.issues?.length > 0 && (
                                    <ul className="bullet-list">
                                        {sec.issues.map((issue, j) => <li key={j}>{issue}</li>)}
                                    </ul>
                                )}
                            </div>
                        ))}

                        {resume_analysis.weak_bullets?.length > 0 && (
                            <div className="glass-card" style={{ marginTop: '1rem' }}>
                                <div className="section-title">
                                    <span className="material-icons-round" style={{ fontSize: '20px', color: 'var(--accent-amber)' }}>warning</span>
                                    Weak Bullets
                                </div>
                                <ul className="bullet-list">
                                    {resume_analysis.weak_bullets.map((b, i) => <li key={i}>{b}</li>)}
                                </ul>
                            </div>
                        )}

                        {resume_analysis.recommendations?.length > 0 && (
                            <div className="glass-card" style={{ marginTop: '1rem' }}>
                                <div className="section-title">
                                    <span className="material-icons-round" style={{ fontSize: '20px', color: 'var(--accent-indigo)' }}>lightbulb</span>
                                    Recommendations
                                </div>
                                <ul className="improvement-list">
                                    {resume_analysis.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 0 && !resume_analysis && <EmptyTab icon="person_search" label="No Resume Insights Yet" />}

                {/* ── Tab 1: Skill Gap ─────────────────────────────── */}
                {activeTab === 1 && skill_gap && (
                    <div>
                        <div className="coverage-grid">
                            <div className="coverage-stat">
                                <div className="coverage-label">Exact Match</div>
                                <div className="coverage-value">{((skill_gap.exact_match_score || 0) * 100).toFixed(0)}%</div>
                                <div className="breakdown-bar"><div className="breakdown-fill" style={{ width: `${(skill_gap.exact_match_score || 0) * 100}%`, background: 'linear-gradient(90deg, #10b981, #10b981cc)' }} /></div>
                            </div>
                            <div className="coverage-stat">
                                <div className="coverage-label">Semantic Match</div>
                                <div className="coverage-value">{((skill_gap.semantic_match_score || 0) * 100).toFixed(0)}%</div>
                                <div className="breakdown-bar"><div className="breakdown-fill" style={{ width: `${(skill_gap.semantic_match_score || 0) * 100}%`, background: 'linear-gradient(90deg, #a855f7, #a855f7cc)' }} /></div>
                            </div>
                            <div className="coverage-stat">
                                <div className="coverage-label">Final Coverage</div>
                                <div className="coverage-value" style={{ color: 'var(--accent-emerald)' }}>{((skill_gap.final_skill_coverage || 0) * 100).toFixed(0)}%</div>
                                <div className="breakdown-bar"><div className="breakdown-fill" style={{ width: `${(skill_gap.final_skill_coverage || 0) * 100}%`, background: 'var(--gradient-primary)' }} /></div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            <div className="glass-card">
                                <div className="section-title">
                                    <span className="material-icons-round" style={{ fontSize: '18px', color: 'var(--accent-emerald)' }}>check_circle</span>
                                    Exact Matches
                                </div>
                                <div className="chip-container">
                                    {(skill_gap.exact_matches || []).map((s) => <span key={s} className="chip chip-match">{s}</span>)}
                                    {!skill_gap.exact_matches?.length && <span className="section-body" style={{ opacity: 0.6 }}>None found</span>}
                                </div>
                            </div>
                            <div className="glass-card">
                                <div className="section-title">
                                    <span className="material-icons-round" style={{ fontSize: '18px', color: 'var(--accent-rose)' }}>cancel</span>
                                    Truly Missing Skills
                                </div>
                                <div className="chip-container">
                                    {(skill_gap.truly_missing_skills || []).map((s) => <span key={s} className="chip chip-missing">{s}</span>)}
                                    {!skill_gap.truly_missing_skills?.length && <span className="section-body" style={{ opacity: 0.6 }}>None — great coverage!</span>}
                                </div>
                            </div>
                        </div>

                        {(skill_gap.semantic_matches || []).length > 0 && (
                            <div className="glass-card" style={{ marginTop: '1.25rem' }}>
                                <div className="section-title">
                                    <span className="material-icons-round" style={{ fontSize: '20px' }}>psychology</span>
                                    Semantic Matches
                                </div>
                                <div className="semantic-table">
                                    <div className="semantic-row semantic-header">
                                        <span>JD Skill</span><span>Mapped To</span><span>Confidence</span>
                                    </div>
                                    {skill_gap.semantic_matches.map((m, i) => (
                                        <div key={i} className="semantic-row">
                                            <span>{m.jd_skill}</span>
                                            <span className="chip chip-semantic" style={{ margin: 0 }}>{m.mapped_to}</span>
                                            <span>
                                                <span className="confidence-badge" style={{
                                                    background: m.confidence >= 0.7 ? 'rgba(16,185,129,0.15)' : m.confidence >= 0.5 ? 'rgba(168,85,247,0.15)' : 'rgba(234,179,8,0.15)',
                                                    color: m.confidence >= 0.7 ? '#10b981' : m.confidence >= 0.5 ? '#a855f7' : '#eab308',
                                                }}>{(m.confidence * 100).toFixed(0)}%</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {skill_gap.learning_suggestions?.length > 0 && (
                            <div className="glass-card" style={{ marginTop: '1.25rem' }}>
                                <div className="section-title">
                                    <span className="material-icons-round" style={{ fontSize: '20px', color: 'var(--accent-blue)' }}>school</span>
                                    Learning Suggestions
                                </div>
                                <ul className="improvement-list">
                                    {skill_gap.learning_suggestions.map((s, i) => (
                                        <li key={i}><strong>{s.skill}:</strong> {s.suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 1 && !skill_gap && <EmptyTab icon="compare_arrows" label="No Skill Gap Analysis Yet" />}

                {/* ── Tab 2: ATS Score ─────────────────────────────── */}
                {activeTab === 2 && ats_result && (
                    <div>
                        <div className="glass-card">
                            <AtsScoreMeter score={ats_result.total_score || 0} breakdown={ats_result.breakdown || {}} />
                        </div>

                        {ats_result.improvement_actions?.length > 0 && (
                            <div className="glass-card" style={{ marginTop: '1.25rem' }}>
                                <div className="section-title">
                                    <span className="material-icons-round" style={{ fontSize: '20px' }}>target</span>
                                    Improvement Actions
                                </div>
                                <ul className="improvement-list">
                                    {ats_result.improvement_actions.map((a, i) => <li key={i}>{a}</li>)}
                                </ul>
                            </div>
                        )}

                        {ats_result.optimized_bullets?.length > 0 && (
                            <div className="glass-card" style={{ marginTop: '1.25rem' }}>
                                <div className="section-title">
                                    <span className="material-icons-round" style={{ fontSize: '20px', color: 'var(--accent-emerald)' }}>auto_fix_high</span>
                                    Optimized Bullets
                                </div>
                                <ul className="bullet-list">
                                    {ats_result.optimized_bullets.map((b, i) => <li key={i}>{b}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 2 && !ats_result && <EmptyTab icon="speed" label="No ATS Score Yet" />}

                {/* ── Tab 3: Optimized Resume ──────────────────────── */}
                {activeTab === 3 && ats_result && (
                    <div className="glass-card">
                        <div className="copy-bar">
                            <button className="btn-secondary" onClick={handleDownloadPDF} id="download-pdf-btn"
                                style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)' }}>
                                <span className="material-icons-round" style={{ fontSize: '16px' }}>picture_as_pdf</span>
                                Download PDF
                            </button>
                            <button className="btn-secondary" onClick={handleDownloadDOCX} id="download-docx-btn"
                                style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)' }}>
                                <span className="material-icons-round" style={{ fontSize: '16px' }}>description</span>
                                Download DOCX
                            </button>
                        </div>
                        {downloadError && (
                            <p className="cover-letter-page__error" style={{ marginBottom: '0.75rem' }}>{downloadError}</p>
                        )}
                        <div className="resume-preview" style={{ padding: 0, background: 'transparent', display: 'flex', flexDirection: 'column' }}>
                            <PdfViewer fileUrl={previewPdfUrl} />
                        </div>
                    </div>
                )}
                {activeTab === 3 && !ats_result && <EmptyTab icon="description" label="No Optimized Resume Yet" />}

                {/* ── Tab 4: Interview Prep ────────────────────────── */}
                {activeTab === 4 && interview_questions && (
                    <div>
                        <div className="glass-card" style={{ marginBottom: '1.25rem', padding: '1rem 1.5rem' }}>
                            <div className="section-title" style={{ marginBottom: 0 }}>
                                <span className="material-icons-round" style={{ fontSize: '20px', color: 'var(--accent-indigo)' }}>quiz</span>
                                {interview_questions.questions?.length || 0} Interview Questions Generated
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                Click a question to expand it, type your answer, and get AI-powered feedback.
                            </p>
                        </div>
                        {(interview_questions.questions || []).map((q, i) => (
                            <QuestionCard
                                key={i}
                                question={q}
                                index={i}
                                sessionId={session_id}
                            />
                        ))}
                    </div>
                )}
                {activeTab === 4 && !interview_questions && <EmptyTab icon="quiz" label="No Interview Questions Yet" />}

            </TabPanel>
        </div>
    );
}
