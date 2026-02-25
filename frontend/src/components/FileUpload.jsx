import React, { useRef, useState } from 'react';

/**
 * FileUpload — Premium drag & drop zone for PDF/DOCX resume upload.
 */
export default function FileUpload({ file, onFileChange }) {
    const inputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) onFileChange(f);
    };

    const handleChange = (e) => {
        const f = e.target.files[0];
        if (f) onFileChange(f);
    };

    const classes = ['upload-zone'];
    if (dragOver) classes.push('drag-over');
    if (file) classes.push('has-file');

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div
            className={classes.join(' ')}
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            id="resume-upload-zone"
        >
            <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleChange}
                style={{ display: 'none' }}
                id="resume-file-input"
            />
            <div className="upload-icon">
                <span className="material-icons-round">
                    {file ? 'check_circle' : 'cloud_upload'}
                </span>
            </div>
            <div className="upload-label">
                {file ? 'File selected' : 'Drop your resume here'}
            </div>
            <div className="upload-hint">
                {file ? '' : 'PDF or DOCX — Click or drag & drop'}
            </div>
            {file && (
                <div className="upload-filename">
                    {file.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>• {formatSize(file.size)}</span>
                </div>
            )}
        </div>
    );
}
