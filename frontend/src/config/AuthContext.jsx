/**
 * AuthContext — Global authentication state using Firebase.
 * Provides user, loading, login, signup, logout, resetPassword, googleLogin.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    signInWithPopup,
    sendEmailVerification,
    verifyBeforeUpdateEmail,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = (email, password) =>
        signInWithEmailAndPassword(auth, email, password);

    const signup = async (email, password) => {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(credential.user);
        return credential;
    };

    const logout = () => signOut(auth);

    const resetPassword = (email) => sendPasswordResetEmail(auth, email);

    const googleLogin = () => signInWithPopup(auth, googleProvider);

    const resendVerificationEmail = async () => {
        if (!auth.currentUser) throw new Error('No authenticated user found.');
        await sendEmailVerification(auth.currentUser);
    };

    const changeEmail = async (newEmail) => {
        if (!auth.currentUser) throw new Error('No authenticated user found.');
        await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
    };

    const refreshUser = async () => {
        if (!auth.currentUser) return;
        await auth.currentUser.reload();
        setUser({ ...auth.currentUser });
    };

    const value = {
        user,
        loading,
        login,
        signup,
        logout,
        resetPassword,
        googleLogin,
        resendVerificationEmail,
        changeEmail,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
