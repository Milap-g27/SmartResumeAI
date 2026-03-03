/**
 * ProtectedRoute — Redirects unauthenticated users to /auth
 * and unverified users to /account/email-verification unless explicitly allowed.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../config/AuthContext';

export default function ProtectedRoute({ children, allowUnverified = false }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
                <div className="loading-text">Authenticating...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    if (!allowUnverified && !user.emailVerified) {
        return <Navigate to="/account/email-verification" replace />;
    }

    return children;
}
