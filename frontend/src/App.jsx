/**
 * App — Root component with providers and routing.
 * Wraps app in BrowserRouter, AuthProvider, ThemeProvider.
 * Home page gets full-width layout; other pages use app-container.
 */
import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './config/AuthContext';
import { ThemeProvider } from './config/ThemeContext';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

function AppLayout() {
    const location = useLocation();
    const isFullWidth = location.pathname === '/home';

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
                    <AppLayout />
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
