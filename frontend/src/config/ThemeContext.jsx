/**
 * ThemeContext — Global light/dark theme management.
 * Persists user preference in localStorage.
 * Adds 'light' or 'dark' class to <html> for CSS targeting.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { getThemePreference, updateThemePreference } from '../api/client';

const ThemeContext = createContext(null);

function resolveTheme(mode) {
    if (mode === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return mode;
}

export function ThemeProvider({ children }) {
    const [themeMode, setThemeModeState] = useState(() => {
        const saved = localStorage.getItem('themeMode') || localStorage.getItem('theme');
        return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
    });
    const [theme, setTheme] = useState(() => resolveTheme(themeMode));
    const [themeReady, setThemeReady] = useState(false);

    useEffect(() => {
        setTheme(resolveTheme(themeMode));
    }, [themeMode]);

    useEffect(() => {
        if (themeMode !== 'system') return undefined;

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = () => setTheme(resolveTheme('system'));

        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, [themeMode]);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
        localStorage.setItem('themeMode', themeMode);
    }, [theme, themeMode]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setThemeReady(true);
                return;
            }

            try {
                const response = await getThemePreference();
                if (response?.theme === 'light' || response?.theme === 'dark' || response?.theme === 'system') {
                    setThemeModeState(response.theme);
                }
            } catch {
                // Fallback to local preference when backend preference is unavailable
            } finally {
                setThemeReady(true);
            }
        });

        return unsubscribe;
    }, []);

    const setThemeMode = (nextMode) => {
        if (!['light', 'dark', 'system'].includes(nextMode)) return;

        setThemeModeState(nextMode);
        if (auth.currentUser) {
            updateThemePreference(nextMode).catch(() => {
                // Keep local behavior if remote save fails
            });
        }
    };

    const toggleTheme = () => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        setThemeMode(nextTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, toggleTheme, themeReady }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
