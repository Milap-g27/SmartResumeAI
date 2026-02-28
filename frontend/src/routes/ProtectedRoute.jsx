/**
 * ProtectedRoute — Redirects unauthenticated users to /auth.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../config/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
                <div className="loading-text">Authenticating...</div>
            </div>
        );
    }

    return user ? children : <Navigate to="/auth" replace />;
}
