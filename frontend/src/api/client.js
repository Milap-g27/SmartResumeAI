/**
 * API client — communicates with the FastAPI backend.
 */

const API_BASE = 'http://localhost:8000';

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

    const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
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
    const res = await fetch(`${API_BASE}/mock-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: sessionId,
            question,
            answer,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Server error' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
    }

    return res.json();
}

/**
 * Retrieve a stored session by ID.
 * @param {string} sessionId
 * @returns {Promise<Object>}
 */
export async function getSession(sessionId) {
    const res = await fetch(`${API_BASE}/session/${sessionId}`);

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Session not found' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
    }

    return res.json();
}

/**
 * Download the optimized resume as PDF.
 * @param {string} sessionId
 */
export function downloadPDF(sessionId) {
    window.open(`${API_BASE}/download/pdf/${sessionId}`, '_blank');
}

/**
 * Download the optimized resume as DOCX.
 * @param {string} sessionId
 */
export function downloadDOCX(sessionId) {
    window.open(`${API_BASE}/download/docx/${sessionId}`, '_blank');
}
