/**
 * App — Root component with providers and routing.
 * Wraps app in BrowserRouter, AuthProvider, ThemeProvider.
 * Home page gets full-width layout; other pages use app-container.
 */
import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './config/AuthContext';
import { ThemeProvider } from './config/ThemeContext';
import { useTheme } from './config/ThemeContext';
import { WorkspaceProvider } from './config/WorkspaceContext';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

function AppLayout() {
    const location = useLocation();
    const { themeReady } = useTheme();
    const isFullWidth = location.pathname === '/home';

    useEffect(() => {
        const navEntry = performance.getEntriesByType('navigation')?.[0];
        if (navEntry?.type !== 'reload') return;

        sessionStorage.removeItem('latestDashboardData');
        sessionStorage.removeItem('latestCoverLetterDraft');

        Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith('coverLetterDraft:')) {
                sessionStorage.removeItem(key);
            }
        });
    }, []);

    if (!themeReady) {
        return (
            <div className="loading-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
                <div className="loading-text">Applying your theme...</div>
            </div>
        );
    }

    return (
        <>
            {/* Animated background orbs */}
            <div className="bg-orbs">
                <div className="bg-orb bg-orb--1" />
                <div className="bg-orb bg-orb--2" />
                <div className="bg-orb bg-orb--3" />
            </div>

            <Navbar />

            <div className={isFullWidth ? '' : 'app-container'}>
                <AppRoutes />
            </div>
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ThemeProvider>
                    <WorkspaceProvider>
                        <AppLayout />
                    </WorkspaceProvider>
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
