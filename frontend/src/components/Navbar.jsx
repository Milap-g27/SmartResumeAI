/**
 * Navbar — Premium frosted-glass navigation bar.
 * Shows Home + Sign In/Get Started for unauthenticated users.
 * Shows Workspace/Dashboard/Cover Letter + user info for authenticated users.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../config/AuthContext';
import { useTheme } from '../config/ThemeContext';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { theme, themeMode, setThemeMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const accountMenuRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!accountMenuRef.current?.contains(event.target)) {
                setAccountMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
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
                            <button
                                className={`navbar__link ${isActive('/cover-letter') ? 'navbar__link--active' : ''}`}
                                onClick={() => navigate('/cover-letter')}
                            >
                                <span className="material-icons-round" style={{ fontSize: '16px' }}>edit_note</span>
                                Cover Letter
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
                        <div className="navbar__user" ref={accountMenuRef}>
                            <button
                                className="navbar__user-email navbar__user-email-btn"
                                onClick={() => {
                                    setAccountMenuOpen(false);
                                    navigate('/account');
                                }}
                                title="Open account settings"
                            >
                                {user.email?.split('@')[0]}
                            </button>
                            <button
                                className="navbar__account-btn"
                                onClick={() => setAccountMenuOpen((prev) => !prev)}
                                title="Open account menu"
                            >
                                <span className="material-icons-round" style={{ fontSize: '17px' }}>manage_accounts</span>
                            </button>

                            {accountMenuOpen && (
                                <div className="navbar__account-menu">
                                    <button
                                        className="navbar__account-menu-item"
                                        onClick={() => {
                                            setAccountMenuOpen(false);
                                            navigate('/account');
                                        }}
                                    >
                                        <span className="material-icons-round">manage_accounts</span>
                                        Account Overview
                                    </button>
                                    <button
                                        className="navbar__account-menu-item"
                                        onClick={() => {
                                            setAccountMenuOpen(false);
                                            navigate('/account/email-verification');
                                        }}
                                    >
                                        <span className="material-icons-round">verified_user</span>
                                        Email Verification
                                    </button>
                                    <button
                                        className="navbar__account-menu-item"
                                        onClick={() => {
                                            setAccountMenuOpen(false);
                                            navigate('/account/password-reset');
                                        }}
                                    >
                                        <span className="material-icons-round">lock_reset</span>
                                        Password Reset
                                    </button>
                                    <button
                                        className="navbar__account-menu-item"
                                        onClick={() => {
                                            setAccountMenuOpen(false);
                                            navigate('/account/change-email');
                                        }}
                                    >
                                        <span className="material-icons-round">alternate_email</span>
                                        Change Email
                                    </button>
                                    <div className="navbar__account-menu-item navbar__account-menu-item--has-submenu">
                                        <div className="navbar__account-menu-item-main">
                                            <span className="material-icons-round">palette</span>
                                            Theme Preference
                                            <span className="material-icons-round navbar__submenu-arrow">chevron_right</span>
                                        </div>
                                        <div className="navbar__account-submenu">
                                            <button
                                                className={`navbar__account-submenu-item ${themeMode === 'light' ? 'navbar__account-submenu-item--active' : ''}`}
                                                onClick={() => {
                                                    setThemeMode('light');
                                                    setAccountMenuOpen(false);
                                                }}
                                            >
                                                Light
                                            </button>
                                            <button
                                                className={`navbar__account-submenu-item ${themeMode === 'dark' ? 'navbar__account-submenu-item--active' : ''}`}
                                                onClick={() => {
                                                    setThemeMode('dark');
                                                    setAccountMenuOpen(false);
                                                }}
                                            >
                                                Dark
                                            </button>
                                            <button
                                                className={`navbar__account-submenu-item ${themeMode === 'system' ? 'navbar__account-submenu-item--active' : ''}`}
                                                onClick={() => {
                                                    setThemeMode('system');
                                                    setAccountMenuOpen(false);
                                                }}
                                            >
                                                System
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

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
