/**
 * AccountPage — Manage verification, password reset, and email change.
 */
import React, { useState } from 'react';
import { useAuth } from '../config/AuthContext';
import { useTheme } from '../config/ThemeContext';

const FEATURE_META = {
    all: {
        title: 'Account Security',
        subtitle: 'Manage email verification and authentication settings.',
    },
    'email-verification': {
        title: 'Email Verification',
        subtitle: 'Check verification status and send a verification email.',
    },
    'password-reset': {
        title: 'Password Reset',
        subtitle: 'Send a secure reset link to your registered email address.',
    },
    'change-email': {
        title: 'Change Email',
        subtitle: 'Request email change verification for a new email address.',
    },
    'theme-preference': {
        title: 'Theme Preference',
        subtitle: 'Choose how your app theme is applied across sessions.',
    },
};

export default function AccountPage({ feature = 'all' }) {
    const {
        user,
        resendVerificationEmail,
        resetPassword,
        changeEmail,
        refreshUser,
    } = useAuth();
    const { themeMode, setThemeMode } = useTheme();

    const [newEmail, setNewEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [busyAction, setBusyAction] = useState('');

    const selectedFeature = FEATURE_META[feature] ? feature : 'all';
    const meta = FEATURE_META[selectedFeature];
    const showEmailVerification = selectedFeature === 'all' || selectedFeature === 'email-verification';
    const showPasswordReset = selectedFeature === 'all' || selectedFeature === 'password-reset';
    const showChangeEmail = selectedFeature === 'all' || selectedFeature === 'change-email';
    const showThemePreference = selectedFeature === 'all' || selectedFeature === 'theme-preference';

    const runAction = async (action, successMessage) => {
        setError('');
        setMessage('');
        setBusyAction(action);
        try {
            if (action === 'verify') await resendVerificationEmail();
            if (action === 'reset') await resetPassword(user?.email || '');
            if (action === 'change') await changeEmail(newEmail.trim());
            if (action === 'refresh') await refreshUser();
            setMessage(successMessage);
            if (action === 'change') setNewEmail('');
        } catch (err) {
            const msg = err?.message || 'Request failed.';
            setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
        } finally {
            setBusyAction('');
        }
    };

    return (
        <div className="account-page">
            <div className="account-card">
                <div className="account-header">
                    <h1>{meta.title}</h1>
                    <p>{meta.subtitle}</p>
                </div>

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

                {showEmailVerification && <section className="account-section">
                    <h2>Email Verification</h2>
                    <p>
                        Current email: <strong>{user?.email || 'Unknown'}</strong>
                    </p>
                    <p>
                        Status: <strong>{user?.emailVerified ? 'Verified' : 'Not verified'}</strong>
                    </p>
                    <div className="account-actions-row">
                        {!user?.emailVerified && (
                            <button
                                className="btn-primary"
                                onClick={() => runAction('verify', 'Verification email sent. Please check your inbox.')}
                                disabled={busyAction === 'verify'}
                            >
                                {busyAction === 'verify' ? 'Sending...' : 'Send Verification Email'}
                            </button>
                        )}
                        <button
                            className="btn-secondary"
                            onClick={() => runAction('refresh', 'Account status refreshed.')}
                            disabled={busyAction === 'refresh'}
                        >
                            {busyAction === 'refresh' ? 'Refreshing...' : 'Refresh Status'}
                        </button>
                    </div>
                </section>}

                {showPasswordReset && <section className="account-section">
                    <h2>Password Reset</h2>
                    <p>Send a password reset email to your current account address.</p>
                    <button
                        className="btn-primary"
                        onClick={() => runAction('reset', 'Password reset email sent.')}
                        disabled={busyAction === 'reset' || !user?.email}
                    >
                        {busyAction === 'reset' ? 'Sending...' : 'Send Password Reset Email'}
                    </button>
                </section>}

                {showChangeEmail && <section className="account-section">
                    <h2>Change Email</h2>
                    <p>Firebase will send a verification link to your new email before updating.</p>
                    <div className="account-input-wrap">
                        <input
                            type="email"
                            className="auth-input"
                            placeholder="Enter new email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            id="account-new-email"
                        />
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => runAction('change', 'Email-change verification sent to your new email address.')}
                        disabled={busyAction === 'change' || !newEmail.trim()}
                    >
                        {busyAction === 'change' ? 'Sending...' : 'Send Email Change Link'}
                    </button>
                </section>}

                {showThemePreference && <section className="account-section">
                    <h2>Theme Preference</h2>
                    <p>Choose your preferred appearance mode. System follows your device setting.</p>
                    <div className="theme-mode-group" role="group" aria-label="Theme preference selector">
                        <button
                            className={`theme-mode-btn ${themeMode === 'light' ? 'theme-mode-btn--active' : ''}`}
                            onClick={() => setThemeMode('light')}
                            type="button"
                        >
                            Light
                        </button>
                        <button
                            className={`theme-mode-btn ${themeMode === 'dark' ? 'theme-mode-btn--active' : ''}`}
                            onClick={() => setThemeMode('dark')}
                            type="button"
                        >
                            Dark
                        </button>
                        <button
                            className={`theme-mode-btn ${themeMode === 'system' ? 'theme-mode-btn--active' : ''}`}
                            onClick={() => setThemeMode('system')}
                            type="button"
                        >
                            System
                        </button>
                    </div>
                </section>}
            </div>
        </div>
    );
}
