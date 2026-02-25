import React, { useState, useEffect } from 'react';

/**
 * Navbar — Premium frosted-glass navigation bar.
 * Becomes opaque on scroll for readability.
 */
export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} id="main-nav">
            <div className="navbar__inner">
                <div className="navbar__brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <span className="material-icons-round navbar__logo-icon">auto_awesome</span>
                    <span className="navbar__logo-text">SmartResume<span className="navbar__logo-ai">AI</span></span>
                </div>
                <div className="navbar__links">
                    <button className="navbar__link" onClick={() => scrollTo('pipeline-section')}>How It Works</button>
                    <button className="navbar__link" onClick={() => scrollTo('features-section')}>Features</button>
                    <button className="navbar__link" onClick={() => scrollTo('upload-section')}>Upload</button>
                </div>
                <button className="navbar__cta" onClick={() => scrollTo('upload-section')}>
                    Get Started
                    <span className="material-icons-round" style={{ fontSize: '18px' }}>arrow_forward</span>
                </button>
            </div>
        </nav>
    );
}
