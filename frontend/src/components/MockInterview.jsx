import React, { useState } from 'react';
import { submitMockInterview } from '../api/client';

/**
 * MockInterview — Premium interview panel with enhanced feedback display.
 */
export default function MockInterview({ sessionId, question }) {
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!answer.trim()) return;
        setLoading(true);
        setError('');
        setFeedback(null);

        try {
            const res = await submitMockInterview(sessionId, question.question, answer);
            setFeedback(res.feedback);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mock-panel">
            <div className="section-card">
                <div className="section-title">
                    <span className="material-icons-round" style={{ fontSize: '20px' }}>mic</span>
                    Mock Interview
                </div>
                <div className="question-text" style={{ marginBottom: '1.25rem' }}>
                    {question.question}
                </div>

                <label className="label" htmlFor="mock-answer">
                    <span className="material-icons-round" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '0.25rem' }}>edit_note</span>
                    Your Answer
                </label>
                <textarea
                    id="mock-answer"
                    className="textarea"
                    placeholder="Type your answer here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={5}
                />

                <div style={{ marginTop: '1.25rem' }}>
                    <button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={loading || !answer.trim()}
                        id="submit-answer-btn"
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

                {error && (
                    <div className="error-banner" style={{ marginTop: '1rem' }}>
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>error_outline</span>
                        {error}
                    </div>
                )}

                {feedback && (
                    <div style={{ marginTop: '2rem' }}>
                        <div className="section-title">
                            <span className="material-icons-round" style={{ fontSize: '20px' }}>analytics</span>
                            Feedback
                        </div>
                        <div className="feedback-grid">
                            {[
                                { label: 'Clarity', value: feedback.clarity, icon: 'visibility' },
                                { label: 'Technical', value: feedback.technical_depth, icon: 'code' },
                                { label: 'Communication', value: feedback.communication, icon: 'forum' },
                                { label: 'Confidence', value: feedback.confidence, icon: 'verified' },
                            ].map((m) => (
                                <div key={m.label} className="feedback-metric">
                                    <div className="feedback-score">{m.value}</div>
                                    <div className="feedback-label">{m.label}</div>
                                </div>
                            ))}
                        </div>

                        {feedback.improvement && (
                            <div className="section-card" style={{ marginTop: '1rem' }}>
                                <div className="section-title">
                                    <span className="material-icons-round" style={{ fontSize: '18px', color: 'var(--accent-amber)' }}>lightbulb</span>
                                    Improvement
                                </div>
                                <div className="section-body">{feedback.improvement}</div>
                            </div>
                        )}

                        {feedback.strengths && feedback.strengths.length > 0 && (
                            <div className="section-card" style={{ marginTop: '0.75rem' }}>
                                <div className="section-title">
                                    <span className="material-icons-round" style={{ fontSize: '18px', color: 'var(--accent-emerald)' }}>thumb_up</span>
                                    Strengths
                                </div>
                                <div className="chip-container">
                                    {feedback.strengths.map((s, i) => (
                                        <span key={i} className="chip chip-match">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
