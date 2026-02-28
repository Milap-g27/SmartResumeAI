/**
 * Navbar — Premium frosted-glass navigation bar.
 * Shows Home + Sign In/Get Started for unauthenticated users.
 * Shows Workspace/Dashboard + user info for authenticated users.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../config/AuthContext';
import { useTheme } from '../config/ThemeContext';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Don't show navbar on auth page
    if (location.pathname === '/auth') return null;

    const handleLogout = async () => {
        await logout();
        navigate('/home');
    };

    const isActive = (path) => location.pathname === path;
    const isHome = location.pathname === '/home';

    return (
        <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}${isHome ? ' navbar--home' : ''}`} id="main-nav">
            <div className="navbar__inner">
                <div className="navbar__brand" onClick={() => navigate('/home')}>
                    <span className="material-icons-round navbar__logo-icon">auto_awesome</span>
                    <span className="navbar__logo-text">SmartResume<span className="navbar__logo-ai">AI</span></span>
                </div>

                <div className="navbar__links">
                    {user ? (
                        <>
                            <button
                                className={`navbar__link ${isActive('/home') ? 'navbar__link--active' : ''}`}
                                onClick={() => navigate('/home')}
                            >
                                <span className="material-icons-round" style={{ fontSize: '16px' }}>home</span>
                                Home
                            </button>
                            <button
                                className={`navbar__link ${isActive('/workspace') ? 'navbar__link--active' : ''}`}
                                onClick={() => navigate('/workspace')}
                            >
                                <span className="material-icons-round" style={{ fontSize: '16px' }}>workspaces</span>
                                Workspace
                            </button>
                            <button
                                className={`navbar__link ${isActive('/dashboard') ? 'navbar__link--active' : ''}`}
                                onClick={() => navigate('/dashboard')}
                            >
                                <span className="material-icons-round" style={{ fontSize: '16px' }}>dashboard</span>
                                Dashboard
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="navbar__link"
                                onClick={() => document.getElementById('home-features')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Features
                            </button>
                            <button
                                className="navbar__link"
                                onClick={() => document.getElementById('home-pipeline')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                How It Works
                            </button>
                            <button
                                className="navbar__link"
                                onClick={() => document.getElementById('home-cta')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                About Us
                            </button>
                        </>
                    )}
                </div>

                <div className="navbar__actions">
                    <button
                        className="navbar__theme-toggle"
                        onClick={toggleTheme}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        <span className="material-icons-round">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>

                    {user ? (
                        <div className="navbar__user">
                            <span className="navbar__user-email">{user.email?.split('@')[0]}</span>
                            <button className="navbar__logout" onClick={handleLogout} title="Sign out">
                                <span className="material-icons-round" style={{ fontSize: '18px' }}>logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="navbar__auth-actions">
                            <button className="navbar__link navbar__sign-in" onClick={() => navigate('/auth')}>
                                Sign In
                            </button>
                            <button className="navbar__cta" onClick={() => navigate('/auth')}>
                                Get Started
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
