/**
 * QuestionCard — Interactive interview question with inline answer submission.
 * Expands to show textarea, submits to backend for AI evaluation,
 * and displays score badges + improvement suggestions.
 */
import React, { useState } from 'react';
import { submitMockInterview } from '../../api/client';

export default function QuestionCard({ question, sessionId, index }) {
    // question can be either a string or an object {category, question, tips}
    const questionText = typeof question === 'string' ? question : question?.question || '';
    const questionTips = typeof question === 'object' ? question?.tips : null;
    const questionCategory = typeof question === 'object' ? question?.category : null;
    const [expanded, setExpanded] = useState(false);
    const [answer, setAnswer] = useState('');
    const [evaluation, setEvaluation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSample, setShowSample] = useState(false);

    const handleSubmit = async () => {
        if (!answer.trim()) return;
        setLoading(true);
        setError('');

        try {
            const result = await submitMockInterview(sessionId, questionText, answer);
            // API returns {feedback: {...}} — unwrap the feedback object
            setEvaluation(result?.feedback || result);
        } catch (err) {
            setError(err.message || 'Evaluation failed.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 8) return 'var(--accent-emerald)';
        if (score >= 5) return 'var(--accent-amber)';
        return 'var(--accent-rose)';
    };

    const CAT_ICONS = { technical: 'code', behavioral: 'psychology', 'project-specific': 'folder_special' };
    const catClass = questionCategory === 'technical' ? 'cat-technical'
        : questionCategory === 'behavioral' ? 'cat-behavioral'
            : 'cat-project';

    return (
        <div className={`question-card ${expanded ? 'question-card--expanded' : ''}`}>
            <div
                className="question-card__header"
                onClick={() => setExpanded(!expanded)}
                role="button"
                tabIndex={0}
            >
                <div className="question-card__number">Q{index + 1}</div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        {questionCategory && (
                            <div className={`question-category ${catClass}`} style={{ marginBottom: '0.35rem' }}>
                                <span className="material-icons-round" style={{ fontSize: '12px' }}>
                                    {CAT_ICONS[questionCategory] || 'quiz'}
                                </span>
                                {questionCategory}
                            </div>
                        )}
                        <div className="question-card__text">{questionText}</div>
                        {questionTips && (
                            <div className="question-tips" style={{ marginTop: '0.35rem' }}>
                                <span className="material-icons-round" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '0.25rem' }}>lightbulb</span>
                                {questionTips}
                            </div>
                        )}
                    </div>
                    {!expanded && !evaluation && (
                        <button
                            className="btn-primary"
                            style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.85rem',
                                marginLeft: '1rem',
                                whiteSpace: 'nowrap'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpanded(true);
                            }}
                        >
                            <span className="material-icons-round" style={{ fontSize: '16px', marginRight: '4px' }}>edit</span>
                            Answer
                        </button>
                    )}
                </div>
                <span className="material-icons-round question-card__chevron">
                    {expanded ? 'expand_less' : 'expand_more'}
                </span>
            </div>

            {expanded && !evaluation && (
                <div className="question-card__answer-area">
                    <textarea
                        className="question-card__textarea"
                        placeholder="Type your answer here... Be specific, use examples, and demonstrate your understanding."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        rows={5}
                    />

                    {error && (
                        <div className="auth-error" style={{ marginBottom: '0.75rem' }}>
                            <span className="material-icons-round" style={{ fontSize: '16px' }}>error_outline</span>
                            {error}
                        </div>
                    )}

                    <button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={loading || !answer.trim()}
                        style={{ width: '100%', padding: '0.75rem' }}
                    >
                        {loading ? (
                            <>
                                <span className="material-icons-round" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>autorenew</span>
                                Evaluating...
                            </>
                        ) : (
                            <>
                                <span className="material-icons-round" style={{ fontSize: '18px' }}>send</span>
                                Submit Answer
                            </>
                        )}
                    </button>
                </div>
            )
            }

            {
                evaluation && (
                    <div className="question-card__evaluation">
                        {/* Score Badges */}
                        <div className="question-card__scores">
                            {[
                                { key: 'clarity', label: 'Clarity', icon: 'visibility' },
                                { key: 'technical_depth', label: 'Technical', icon: 'psychology' },
                                { key: 'communication', label: 'Communication', icon: 'forum' },
                                { key: 'confidence', label: 'Confidence', icon: 'verified' },
                            ].map(({ key, label, icon }) => (
                                <div className="score-badge" key={key}>
                                    <span className="material-icons-round" style={{ fontSize: '16px', color: getScoreColor(evaluation[key] || 0) }}>{icon}</span>
                                    <span className="score-badge__label">{label}</span>
                                    <span className="score-badge__value" style={{ color: getScoreColor(evaluation[key] || 0) }}>
                                        {evaluation[key] || 0}/10
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Improvement */}
                        {evaluation.improvement && (
                            <div className="question-card__improvement">
                                <div className="section-title" style={{ fontSize: '0.85rem' }}>
                                    <span className="material-icons-round" style={{ fontSize: '18px', color: 'var(--accent-amber)' }}>tips_and_updates</span>
                                    Improvement Suggestion
                                </div>
                                <p className="question-card__improvement-text">{evaluation.improvement}</p>
                            </div>
                        )}

                        {/* Sample Answer */}
                        {evaluation.sample_answer && evaluation.sample_answer.length > 0 && (
                            <div className="question-card__sample-answer" style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: 'rgba(56, 189, 248, 0.05)',
                                borderLeft: '3px solid var(--accent-sky)',
                                borderRadius: '4px'
                            }}>
                                <div className="section-title" style={{ fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center' }}>
                                    <span className="material-icons-round" style={{ fontSize: '18px', color: 'var(--accent-sky)', marginRight: '6px' }}>task_alt</span>
                                    Ideal Sample Answer
                                </div>
                                <ul style={{
                                    margin: 0,
                                    paddingLeft: '1.2rem',
                                    fontSize: '0.86rem',
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.6
                                }}>
                                    {Array.isArray(evaluation.sample_answer) ? (
                                        evaluation.sample_answer.map((point, idx) => (
                                            <li key={idx} style={{ marginBottom: '0.4rem' }}>{point}</li>
                                        ))
                                    ) : (
                                        <li>{evaluation.sample_answer}</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* Strengths */}
                        {evaluation.strengths && evaluation.strengths.length > 0 && (
                            <div style={{ marginBottom: '0.75rem' }}>
                                <div className="section-title" style={{ fontSize: '0.85rem' }}>
                                    <span className="material-icons-round" style={{ fontSize: '18px', color: 'var(--accent-emerald)' }}>thumb_up</span>
                                    Strengths
                                </div>
                                <div className="chip-container">
                                    {evaluation.strengths.map((s, i) => (
                                        <span key={i} className="chip chip-match">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Retry */}
                        <button
                            className="btn-secondary"
                            onClick={() => { setEvaluation(null); setAnswer(''); }}
                            style={{ marginTop: '0.75rem', fontSize: '0.82rem' }}
                        >
                            <span className="material-icons-round" style={{ fontSize: '16px' }}>replay</span>
                            Try Again
                        </button>
                    </div>
                )
            }
        </div >
    );
}
