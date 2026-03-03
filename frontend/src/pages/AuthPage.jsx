/**
 * AuthPage — Login / Sign Up / Password Reset.
 * Full-screen centered card with glassmorphism.
 * Supports email/password and Google OAuth.
 */
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../config/AuthContext';
import { useTheme } from '../config/ThemeContext';

const MODES = { LOGIN: 'login', SIGNUP: 'signup', RESET: 'reset' };

export default function AuthPage() {
    const { user, login, signup, resetPassword, googleLogin } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [mode, setMode] = useState(MODES.LOGIN);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // If already logged in, redirect
    if (user) return <Navigate to="/home" replace />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (mode === MODES.RESET) {
                await resetPassword(email);
                setMessage('Password reset email sent! Check your inbox.');
                setLoading(false);
                return;
            }

            if (mode === MODES.SIGNUP && password !== confirmPassword) {
                setError('Passwords do not match.');
                setLoading(false);
                return;
            }

            if (mode === MODES.LOGIN) {
                await login(email, password);
                navigate('/home');
            } else {
                await signup(email, password);
                navigate('/account');
            }
        } catch (err) {
            const msg = err?.message || 'Authentication failed.';
            // Clean up Firebase error messages
            setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        try {
            await googleLogin();
            navigate('/home');
        } catch (err) {
            setError(err?.message || 'Google sign-in failed.');
        }
    };

    const title = mode === MODES.LOGIN ? 'Welcome Back' : mode === MODES.SIGNUP ? 'Create Account' : 'Reset Password';
    const subtitle = mode === MODES.LOGIN
        ? 'Sign in to continue your resume intelligence'
        : mode === MODES.SIGNUP
            ? 'Start optimizing your resume with AI'
            : 'Enter your email to receive a reset link';

    return (
        <div className="auth-page">
            {/* Animated background */}
            <div className="bg-orbs">
                <div className="bg-orb bg-orb--1" />
                <div className="bg-orb bg-orb--2" />
                <div className="bg-orb bg-orb--3" />
            </div>

            {/* Theme toggle */}
            <button className="auth-theme-toggle" onClick={toggleTheme} title="Toggle theme">
                <span className="material-icons-round">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
            </button>

            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo">
                    <span className="material-icons-round navbar__logo-icon" style={{ fontSize: '2rem' }}>auto_awesome</span>
                    <span className="navbar__logo-text" style={{ fontSize: '1.4rem' }}>
                        SmartResume<span className="navbar__logo-ai">AI</span>
                    </span>
                </div>

                <h1 className="auth-title">{title}</h1>
                <p className="auth-subtitle">{subtitle}</p>

                {error && (
                    <div className="auth-error">
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>error_outline</span>
                        {error}
                    </div>
                )}

                {message && (
                    <div className="auth-success">
                        <span className="material-icons-round" style={{ fontSize: '18px' }}>check_circle</span>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label className="auth-label">Email</label>
                        <div className="auth-input-wrap">
                            <span className="material-icons-round auth-input-icon">mail</span>
                            <input
                                type="email"
                                className="auth-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                id="auth-email"
                            />
                        </div>
                    </div>

                    {mode !== MODES.RESET && (
                        <div className="auth-field">
                            <div className="auth-label-row">
                                <label className="auth-label">Password</label>
                                {mode === MODES.LOGIN && (
                                    <button type="button" className="auth-link" onClick={() => setMode(MODES.RESET)}>
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <div className="auth-input-wrap">
                                <span className="material-icons-round auth-input-icon">lock</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="auth-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    id="auth-password"
                                />
                                <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                                    <span className="material-icons-round">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {mode === MODES.SIGNUP && (
                        <div className="auth-field">
                            <label className="auth-label">Confirm Password</label>
                            <div className="auth-input-wrap">
                                <span className="material-icons-round auth-input-icon">lock</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="auth-input"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    id="auth-confirm-password"
                                />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn-primary auth-submit" disabled={loading} id="auth-submit-btn">
                        {loading ? (
                            <>
                                <span className="material-icons-round" style={{ fontSize: '20px', animation: 'spin 1s linear infinite' }}>autorenew</span>
                                Processing...
                            </>
                        ) : (
                            mode === MODES.LOGIN ? 'Sign In' : mode === MODES.SIGNUP ? 'Create Account' : 'Send Reset Link'
                        )}
                    </button>
                </form>

                {mode !== MODES.RESET && (
                    <>
                        <div className="auth-divider">
                            <span>or</span>
                        </div>

                        <button className="auth-google-btn" onClick={handleGoogle} id="google-login-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>
                    </>
                )}

                <div className="auth-footer">
                    {mode === MODES.LOGIN ? (
                        <span>Don't have an account? <button type="button" className="auth-link" onClick={() => { setMode(MODES.SIGNUP); setError(''); setMessage(''); }}>Sign up</button></span>
                    ) : mode === MODES.SIGNUP ? (
                        <span>Already have an account? <button type="button" className="auth-link" onClick={() => { setMode(MODES.LOGIN); setError(''); setMessage(''); }}>Sign in</button></span>
                    ) : (
                        <span>Remembered your password? <button type="button" className="auth-link" onClick={() => { setMode(MODES.LOGIN); setError(''); setMessage(''); }}>Sign in</button></span>
                    )}
                </div>

                {/* Trust badges */}
                <div className="auth-badges">
                    <div className="auth-badge">
                        <span className="material-icons-round">lock</span>
                        Secure
                    </div>
                    <div className="auth-badge">
                        <span className="material-icons-round">auto_awesome</span>
                        AI-Powered
                    </div>
                    <div className="auth-badge">
                        <span className="material-icons-round">favorite</span>
                        Free to Start
                    </div>
                </div>
            </div>
        </div>
    );
}
