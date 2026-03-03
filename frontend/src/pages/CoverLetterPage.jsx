import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateCoverLetter } from '../api/client';

export default function CoverLetterPage() {
    const navigate = useNavigate();
    const [coverLetter, setCoverLetter] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const latestData = useMemo(() => {
        try {
            const raw = sessionStorage.getItem('latestDashboardData');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }, []);

    const sessionId = latestData?.session_id || '';
    const optimizedResume = latestData?.ats_result?.optimized_resume || '';
    const jobDescription = latestData?.job_description || '';
    const draftKey = sessionId ? `coverLetterDraft:${sessionId}` : 'latestCoverLetterDraft';

    useEffect(() => {
        const sessionDraft = sessionId ? sessionStorage.getItem(`coverLetterDraft:${sessionId}`) : null;
        const latestDraft = sessionStorage.getItem('latestCoverLetterDraft');
        setCoverLetter(sessionDraft || latestDraft || '');
    }, [sessionId, draftKey]);

    const handleGenerate = async () => {
        if (!sessionId && (!optimizedResume.trim() || !jobDescription.trim())) {
            setError('Please analyze your resume in Workspace first — we need your resume data to craft a tailored cover letter.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await generateCoverLetter(sessionId, {
                optimized_resume: optimizedResume,
                job_description: jobDescription,
            });
            const text = res.cover_letter || '';
            setCoverLetter(text);
            sessionStorage.setItem(draftKey, text);
            sessionStorage.setItem('latestCoverLetterDraft', text);
        } catch (err) {
            setError(err.message || 'We couldn\'t generate your cover letter right now. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!coverLetter) return;
        try {
            await navigator.clipboard.writeText(coverLetter);
        } catch {
            setError('Unable to copy to clipboard. Please select the text manually and copy it.');
        }
    };

    const hasAnalysisData = Boolean(sessionId || (optimizedResume.trim() && jobDescription.trim()));

    if (!hasAnalysisData && !coverLetter) {
        return (
            <div className="cover-letter-page">
                <div className="cover-letter-page__header">
                    <h1>
                        <span className="material-icons-round" style={{ fontSize: '1.35rem' }}>edit_note</span>
                        Cover Letter
                    </h1>
                    <p>Create a concise, professional cover letter based on your latest analyzed resume and job description.</p>
                </div>

                <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                    <span className="material-icons-round" style={{ fontSize: '3rem', color: 'var(--accent-indigo)', opacity: 0.5 }}>edit_note</span>
                    <p style={{ marginTop: '1rem', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No Cover Letter Yet</p>
                    <p style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Upload your resume and a job description in Workspace to see results here.
                    </p>
                    <button className="btn-primary" onClick={() => navigate('/workspace')} style={{ marginTop: '1.25rem' }}>
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>workspaces</span>
                        Go to Workspace
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cover-letter-page">
            <div className="cover-letter-page__header">
                <h1>
                    <span className="material-icons-round" style={{ fontSize: '1.35rem' }}>edit_note</span>
                    Cover Letter
                </h1>
                <p>Create a concise, professional cover letter based on your latest analyzed resume and job description.</p>
            </div>

            <div className="glass-card cover-letter-page__card">
                <div className="cover-letter-page__actions">
                    <button className="btn-primary" onClick={handleGenerate} disabled={loading} id="cover-letter-generate-page-btn">
                        {loading ? (
                            <>
                                <span className="material-icons-round" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>autorenew</span>
                                Generating...
                            </>
                        ) : (
                            <>
                                <span className="material-icons-round" style={{ fontSize: '18px' }}>auto_awesome</span>
                                {coverLetter ? 'Regenerate' : 'Generate'}
                            </>
                        )}
                    </button>

                    <button className="btn-secondary" onClick={handleCopy} disabled={!coverLetter} id="cover-letter-copy-page-btn">
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>content_copy</span>
                        Copy
                    </button>

                    {!sessionId && (
                        <button className="btn-secondary" onClick={() => navigate('/workspace')}>
                            <span className="material-icons-round" style={{ fontSize: '18px' }}>upload_file</span>
                            Go to Workspace
                        </button>
                    )}
                </div>

                {error && <p className="cover-letter-page__error">{error}</p>}

                <textarea
                    className="cover-letter-page__textarea"
                    value={coverLetter}
                    onChange={(e) => {
                        setCoverLetter(e.target.value);
                        sessionStorage.setItem(draftKey, e.target.value);
                        sessionStorage.setItem('latestCoverLetterDraft', e.target.value);
                    }}
                    placeholder="Your generated cover letter will appear here..."
                />
            </div>
        </div>
    );
}
