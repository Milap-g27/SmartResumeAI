import React from 'react';

/**
 * JobDescriptionInput — Premium textarea with character count for pasting the job description.
 */
export default function JobDescriptionInput({ value, onChange }) {
    return (
        <div>
            <label className="label" htmlFor="job-description">
                <span className="material-icons-round" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '0.35rem' }}>work_outline</span>
                Job Description
            </label>
            <textarea
                id="job-description"
                className="textarea"
                placeholder="Paste the full job description here..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <div className="char-count">{value.length > 0 ? `${value.length.toLocaleString()} characters` : ''}</div>
        </div>
    );
}
