import React, { useEffect, useState } from 'react';

/**
 * AtsScoreMeter — Premium animated circular gauge with glow effect + breakdown bars.
 */
export default function AtsScoreMeter({ score = 0, breakdown = {} }) {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedScore(score), 150);
        return () => clearTimeout(timer);
    }, [score]);

    const radius = 100;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedScore / 100) * circumference;

    const getRating = (s) => {
        if (s >= 80) return { text: 'Excellent', color: 'var(--accent-emerald)' };
        if (s >= 60) return { text: 'Good', color: 'var(--accent-amber)' };
        return { text: 'Needs Work', color: 'var(--accent-rose)' };
    };
    const rating = getRating(animatedScore);

    const breakdownItems = [
        { name: 'Keyword Match', value: breakdown.keyword_match || 0, max: 30, color: '#6366f1' },
        { name: 'Semantic Match', value: breakdown.semantic_match || 0, max: 20, color: '#a855f7' },
        { name: 'Skill Coverage', value: breakdown.skill_coverage || 0, max: 20, color: '#8b5cf6' },
        { name: 'Experience', value: breakdown.experience_relevance || 0, max: 20, color: '#06b6d4' },
        { name: 'Formatting', value: breakdown.formatting || 0, max: 10, color: '#10b981' },
    ];

    return (
        <div className="ats-meter-container">
            <div className="ats-circle">
                <svg width="240" height="240" viewBox="0 0 240 240">
                    <defs>
                        <linearGradient id="atsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="50%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                    <circle className="ats-circle-bg" cx="120" cy="120" r={radius} />
                    <circle
                        className="ats-circle-progress"
                        cx="120" cy="120" r={radius}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                    />
                </svg>
                <div className="ats-score-text">
                    <div className="ats-score-number">{animatedScore}</div>
                    <div className="ats-score-label">ATS Score</div>
                    <div className="ats-rating" style={{ color: rating.color }}>{rating.text}</div>
                </div>
            </div>

            <div className="breakdown-grid">
                {breakdownItems.map((item) => (
                    <div key={item.name} className="breakdown-item">
                        <div className="breakdown-header">
                            <span className="breakdown-name">{item.name}</span>
                            <span className="breakdown-value">{item.value}/{item.max}</span>
                        </div>
                        <div className="breakdown-bar">
                            <div
                                className="breakdown-fill"
                                style={{
                                    width: `${(item.value / item.max) * 100}%`,
                                    background: `linear-gradient(90deg, ${item.color}, ${item.color}cc)`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
