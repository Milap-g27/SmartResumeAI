import React, { useState } from 'react';
import TabPanel from '../components/TabPanel';
import AtsScoreMeter from '../components/AtsScoreMeter';
import InterviewCard from '../components/InterviewCard';
import MockInterview from '../components/MockInterview';
import { downloadPDF, downloadDOCX } from '../api/client';

const TABS = ['Resume Insights', 'Skill Gap', 'ATS Score', 'Optimized Resume', 'Interview Prep'];

/**
 * ResultsPage — Premium tabbed dashboard showing all agent outputs.
 */
export default function ResultsPage({ data, onBack }) {
    const [activeTab, setActiveTab] = useState(0);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [copied, setCopied] = useState(false);

    const { session_id, resume_analysis, skill_gap, ats_result, interview_questions } = data;

    const handleCopyMarkdown = () => {
        if (ats_result?.optimized_resume) {
            navigator.clipboard.writeText(ats_result.optimized_resume);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div>
            <div className="results-header">
                <button className="back-btn" onClick={onBack} id="back-btn">
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>arrow_back</span>
                    New Analysis
                </button>
            </div>

            <TabPanel tabs={TABS} active={activeTab} onChange={setActiveTab}>
                {/* ── Tab 0: Resume Insights ──────────────────────────── */}
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

                {/* ── Tab 1: Skill Gap ─────────────────────────────────── */}
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

                {/* ── Tab 2: ATS Score ─────────────────────────────────── */}
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

                {/* ── Tab 3: Optimized Resume ──────────────────────────── */}
                {activeTab === 3 && ats_result && (
                    <div className="glass-card">
                        <div className="copy-bar">
                            {copied && <span className="copied-toast">✓ Copied!</span>}
                            <button className="btn-secondary" onClick={handleCopyMarkdown} id="copy-md-btn">
                                <span className="material-icons-round" style={{ fontSize: '16px' }}>content_copy</span>
                                Copy Markdown
                            </button>
                            <button className="btn-secondary" onClick={() => downloadPDF(session_id)} id="download-pdf-btn"
                                style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)' }}>
                                <span className="material-icons-round" style={{ fontSize: '16px' }}>picture_as_pdf</span>
                                Download PDF
                            </button>
                            <button className="btn-secondary" onClick={() => downloadDOCX(session_id)} id="download-docx-btn"
                                style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)' }}>
                                <span className="material-icons-round" style={{ fontSize: '16px' }}>description</span>
                                Download DOCX
                            </button>
                        </div>
                        <div className="resume-preview">
                            {ats_result.optimized_resume || 'No optimized resume available.'}
                        </div>
                    </div>
                )}

                {/* ── Tab 4: Interview Prep ────────────────────────────── */}
                {activeTab === 4 && interview_questions && (
                    <div>
                        {(interview_questions.questions || []).map((q, i) => (
                            <InterviewCard
                                key={i}
                                question={q}
                                active={selectedQuestion === i}
                                onClick={() => setSelectedQuestion(selectedQuestion === i ? null : i)}
                            />
                        ))}
                        {selectedQuestion !== null && interview_questions.questions?.[selectedQuestion] && (
                            <MockInterview
                                sessionId={session_id}
                                question={interview_questions.questions[selectedQuestion]}
                            />
                        )}
                    </div>
                )}
            </TabPanel>
        </div>
    );
}
