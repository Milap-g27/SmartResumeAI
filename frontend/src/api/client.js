/**
 * API client — communicates with the FastAPI backend.
 */

import { auth } from '../config/firebase';

export const API_BASE = 'http://localhost:8000';

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

    const res = await fetch(`${API_BASE}/mock-interview`, {
        method: 'POST',
        headers,
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
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_BASE}/session/${sessionId}`, { headers });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Session not found' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
    }

    return res.json();
}

export async function generateCoverLetter(sessionId) {
    const headers = await getAuthHeaders({ 'Content-Type': 'application/json' });

    const res = await fetch(`${API_BASE}/cover-letter/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ session_id: sessionId }),
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
