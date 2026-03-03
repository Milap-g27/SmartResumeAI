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
    const draftKey = sessionId ? `coverLetterDraft:${sessionId}` : '';

    useEffect(() => {
        sessionStorage.removeItem('latestCoverLetterDraft');

        if (!sessionId) {
            setCoverLetter('');
            return;
        }

        const saved = sessionStorage.getItem(draftKey);
        setCoverLetter(saved || '');
    }, [sessionId, draftKey]);

    const handleGenerate = async () => {
        if (!sessionId) {
            setError('Run an analysis in Workspace first to generate a cover letter.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await generateCoverLetter(sessionId);
            const text = res.cover_letter || '';
            setCoverLetter(text);
            if (draftKey) {
                sessionStorage.setItem(draftKey, text);
            }
        } catch (err) {
            setError(err.message || 'Failed to generate cover letter.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!coverLetter) return;
        try {
            await navigator.clipboard.writeText(coverLetter);
        } catch {
            setError('Could not copy to clipboard.');
        }
    };

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
                        if (draftKey) {
                            sessionStorage.setItem(draftKey, e.target.value);
                        }
                    }}
                    placeholder="Your generated cover letter will appear here..."
                />
            </div>
        </div>
    );
}
