/**
 * API client — communicates with the FastAPI backend.
 */

import { auth } from '../config/firebase';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

async function getAuthHeaders(extraHeaders = {}) {
    const currentUser = auth.currentUser;
    if (!currentUser) return extraHeaders;

    const token = await currentUser.getIdToken();
    return {
        ...extraHeaders,
        Authorization: `Bearer ${token}`,
    };
}

/**
 * Upload resume + job description and run the full analysis pipeline.
 * @param {File} file - Resume file (PDF/DOCX)
 * @param {string} jobDescription - Job description text
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeResume(file, jobDescription) {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_description', jobDescription);
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Server error' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
    }

    return res.json();
}

/**
 * Submit a mock interview answer for evaluation.
 * @param {string} sessionId
 * @param {string} question
 * @param {string} answer
 * @returns {Promise<Object>} Feedback result
 */
export async function submitMockInterview(sessionId, question, answer) {
    const headers = await getAuthHeaders({ 'Content-Type': 'application/json' });

    const body = JSON.stringify({
        session_id: sessionId,
        question,
        answer,
    });

    try {
        const res = await fetch(`${API_BASE}/mock-interview`, {
            method: 'POST',
            headers,
            body,
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: 'Server error' }));
            throw new Error(err.detail || `HTTP ${res.status}`);
        }

        return res.json();
    } catch (primaryErr) {
        try {
            const fallbackRes = await fetch(`${API_BASE}/api/interview/evaluate`, {
                method: 'POST',
                headers,
                body,
            });

            if (!fallbackRes.ok) {
                const fallbackErr = await fallbackRes.json().catch(() => ({ detail: 'Server error' }));
                throw new Error(fallbackErr.detail || `HTTP ${fallbackRes.status}`);
            }

            const evaluation = await fallbackRes.json();
            return {
                feedback: {
                    clarity: evaluation.clarity ?? 0,
                    technical_depth: evaluation.technical_depth ?? 0,
                    communication: evaluation.structure ?? 0,
                    confidence: 0,
                    improvement: evaluation.improvement || '',
                    sample_answer: evaluation.improved_sample_answer ? [evaluation.improved_sample_answer] : [],
                    strengths: [],
                },
            };
        } catch {
            if (primaryErr instanceof TypeError) {
                throw new Error('Unable to reach server. Check backend deployment and CORS settings.');
            }
            throw primaryErr;
        }
    }
}

/**
 * Retrieve a stored session by ID.
 * @param {string} sessionId
 * @returns {Promise<Object>}
 */
export async function getSession(sessionId) {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_BASE}/session/${sessionId}`, { headers });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Session not found' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
    }

    return res.json();
}

export async function generateCoverLetter(sessionId, fallbackPayload = {}) {
    const headers = await getAuthHeaders({ 'Content-Type': 'application/json' });

    const body = {
        session_id: sessionId || null,
        ...fallbackPayload,
    };

    const res = await fetch(`${API_BASE}/cover-letter/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Cover letter generation failed' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
    }

    return res.json();
}

export async function getThemePreference() {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_BASE}/user/preferences/theme`, {
        method: 'GET',
        headers,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to load theme preference' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
    }

    return res.json();
}

export async function updateThemePreference(theme) {
    const headers = await getAuthHeaders({ 'Content-Type': 'application/json' });

    const res = await fetch(`${API_BASE}/user/preferences/theme`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ theme }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to save theme preference' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
    }

    return res.json();
}

async function createResumeFileBlob(format, { sessionId, optimizedResume }) {
    const endpoint = format === 'pdf' ? '/download/pdf' : '/download/docx';
    const headers = await getAuthHeaders({ 'Content-Type': 'application/json' });

    const body = optimizedResume?.trim()
        ? { optimized_resume: optimizedResume }
        : { session_id: sessionId };

    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'File generation failed' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
    }

    return res.blob();
}

function triggerBlobDownload(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}

export async function getResumePDFBlob({ sessionId, optimizedResume }) {
    return createResumeFileBlob('pdf', { sessionId, optimizedResume });
}

/**
 * Download the optimized resume as PDF.
 * @param {string} sessionId
 */
export async function downloadPDF(sessionId, optimizedResume) {
    const blob = await getResumePDFBlob({ sessionId, optimizedResume });
    triggerBlobDownload(blob, `optimized_resume_${(sessionId || 'latest').slice(0, 8)}.pdf`);
}

/**
 * Download the optimized resume as DOCX.
 * @param {string} sessionId
 */
export async function downloadDOCX(sessionId, optimizedResume) {
    const blob = await createResumeFileBlob('docx', { sessionId, optimizedResume });
    triggerBlobDownload(blob, `optimized_resume_${(sessionId || 'latest').slice(0, 8)}.docx`);
}
