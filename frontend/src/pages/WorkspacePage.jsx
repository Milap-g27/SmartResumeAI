/**
 * WorkspacePage — Split-view resume analysis workspace.
 * Left: PDF viewer with uploaded resume
 * Right: Job Description input area
 * Bottom: Analyze button + loading state
 */
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PdfViewer from '../components/resume/PdfViewer';
import { analyzeResume } from '../api/client';

export default function WorkspacePage() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [jobDesc, setJobDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);

    const handleFileChange = useCallback((e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) setFile(selectedFile);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) setFile(droppedFile);
    }, []);

    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = () => setDragOver(false);

    const handleAnalyze = async () => {
        if (!file || !jobDesc.trim()) return;
        setLoading(true);
        setError('');

        try {
            const data = await analyzeResume(file, jobDesc);
            navigate('/dashboard', { state: data });
        } catch (err) {
            setError(err.message || 'Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Determine viewer URL based on extension, as file.type can be unreliable on some OS
    const isPdf = file?.name?.toLowerCase().endsWith('.pdf');
    const pdfUrl = isPdf ? file : null;

    return (
        <div className="workspace">
            <div className="workspace__header">
                <h1 className="workspace__title">
                    <span className="material-icons-round" style={{ fontSize: '1.5rem' }}>workspaces</span>
                    Analysis Workspace
                </h1>
                <p className="workspace__subtitle">Upload your resume and paste the job description to begin</p>
            </div>

            {error && (
                <div className="error-banner" style={{ maxWidth: '900px', margin: '0 auto 1rem' }}>
                    <span className="material-icons-round" style={{ fontSize: '20px' }}>error_outline</span>
                    {error}
                </div>
            )}

            <div className="workspace__split">
                {/* Left: Resume Viewer */}
                <div className="workspace__panel workspace__panel--left">
                    <div className="workspace__panel-header">
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>description</span>
                        Resume Preview
                    </div>
                    <div className="workspace__panel-body">
                        {file ? (
                            pdfUrl ? (
                                <PdfViewer fileUrl={pdfUrl} />
                            ) : (
                                <div className="pdf-empty">
                                    <span className="material-icons-round" style={{ fontSize: '3rem', color: 'var(--accent-emerald)' }}>check_circle</span>
                                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        DOCX files will be processed server-side
                                    </p>
                                </div>
                            )
                        ) : (
                            <div
                                className={`workspace__dropzone ${dragOver ? 'drag-over' : ''}`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => document.getElementById('workspace-file-input').click()}
                            >
                                <span className="material-icons-round" style={{ fontSize: '3.5rem', color: 'var(--accent-indigo)' }}>cloud_upload</span>
                                <p className="upload-label">Drop your resume here</p>
                                <p className="upload-hint">or click to browse · PDF, DOCX</p>
                                <input
                                    id="workspace-file-input"
                                    type="file"
                                    accept=".pdf,.docx"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        )}
                        {file && (
                            <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                                <button
                                    className="btn-secondary"
                                    style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                                    onClick={() => setFile(null)}
                                >
                                    <span className="material-icons-round" style={{ fontSize: '16px' }}>close</span>
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Job Description */}
                <div className="workspace__panel workspace__panel--right">
                    <div className="workspace__panel-header">
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>work</span>
                        Job Description
                    </div>
                    <div className="workspace__panel-body">
                        <textarea
                            className="workspace__jd-textarea"
                            placeholder="Paste the full job description here...&#10;&#10;Include role title, responsibilities, required skills, and qualifications for the most accurate analysis."
                            value={jobDesc}
                            onChange={(e) => setJobDesc(e.target.value)}
                            id="workspace-jd-input"
                        />
                        <div className="char-count">{jobDesc.length} characters</div>
                    </div>
                </div>
            </div>

            {/* Analyze Button */}
            <div className="workspace__actions">
                <button
                    className="btn-primary"
                    onClick={handleAnalyze}
                    disabled={!file || !jobDesc.trim() || loading}
                    id="workspace-analyze-btn"
                >
                    {loading ? (
                        <>
                            <span className="material-icons-round" style={{ fontSize: '20px', animation: 'spin 1s linear infinite' }}>autorenew</span>
                            Analyzing with 4 AI Agents...
                        </>
                    ) : (
                        <>
                            <span className="material-icons-round" style={{ fontSize: '20px' }}>rocket_launch</span>
                            Analyze Resume
                        </>
                    )}
                </button>
            </div>

            {loading && (
                <div className="loading-container">
                    <div className="spinner" />
                    <div className="loading-text">Running 4 AI agents...</div>
                    <div className="loading-step">
                        Resume Analyzer → Skill Gap → ATS Optimizer → Interview Generator
                    </div>
                </div>
            )}
        </div>
    );
}
