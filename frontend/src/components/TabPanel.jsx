import React from 'react';

const TAB_ICONS = {
    'Resume Insights': 'person_search',
    'Skill Gap': 'compare_arrows',
    'ATS Score': 'speed',
    'Optimized Resume': 'auto_fix_high',
    'Interview Prep': 'record_voice_over',
};

/**
 * TabPanel — Premium pill-style tab switcher with icons.
 */
export default function TabPanel({ tabs, active, onChange, children }) {
    return (
        <div>
            <div className="tabs-container" role="tablist">
                {tabs.map((label, i) => (
                    <button
                        key={label}
                        className={`tab-btn${i === active ? ' active' : ''}`}
                        onClick={() => onChange(i)}
                        role="tab"
                        aria-selected={i === active}
                        id={`tab-${label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                        <span className="material-icons-round">{TAB_ICONS[label] || 'tab'}</span>
                        {label}
                    </button>
                ))}
            </div>
            <div className="tab-content" role="tabpanel" key={active}>
                {children}
            </div>
        </div>
    );
}
