/**
 * Firebase Configuration — Authentication & Session Persistence.
 * Replace env vars with your own Firebase project values.
 */
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    setPersistence,
    browserLocalPersistence,
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Persist session across page reloads
setPersistence(auth, browserLocalPersistence);

export const googleProvider = new GoogleAuthProvider();
export default app;
