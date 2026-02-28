/**
 * AppRoutes — Multi-page routing for the SaaS application.
 * /home       → landing page (public)
 * /auth       → login/signup (public)
 * /workspace  → resume upload + PDF viewer (protected)
 * /dashboard  → analysis results (protected)
 * *           → redirects to /home
 */
import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const HomePage = lazy(() => import('../pages/HomePage'));
const AuthPage = lazy(() => import('../pages/AuthPage'));
const WorkspacePage = lazy(() => import('../pages/WorkspacePage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));

const PageLoader = () => (
    <div className="loading-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
        <div className="loading-text">Loading...</div>
    </div>
);

export default function AppRoutes() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/home" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route
                    path="/workspace"
                    element={
                        <ProtectedRoute>
                            <WorkspacePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
        </Suspense>
    );
}
