import React from 'react';

const CAT_ICONS = { technical: 'code', behavioral: 'psychology', project: 'folder_special' };

/**
 * InterviewCard — Premium question card with category badge and icon.
 */
export default function InterviewCard({ question, onClick, active }) {
    const catClass =
        question.category === 'technical' ? 'cat-technical'
            : question.category === 'behavioral' ? 'cat-behavioral'
                : 'cat-project';

    return (
        <div
            className={`question-card${active ? ' active' : ''}`}
            onClick={onClick}
            id={`question-${question.question.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}`}
        >
            <div className={`question-category ${catClass}`}>
                <span className="material-icons-round" style={{ fontSize: '12px' }}>
                    {CAT_ICONS[question.category] || 'quiz'}
                </span>
                {question.category}
            </div>
            <div className="question-text">{question.question}</div>
            {question.tips && (
                <div className="question-tips">
                    <span className="material-icons-round" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '0.25rem' }}>lightbulb</span>
                    {question.tips}
                </div>
            )}
        </div>
    );
}
