import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import { analyzeResume } from './api/client';

/**
 * App — Root component. Manages global state and page navigation.
 */
export default function App() {
    const [file, setFile] = useState(null);
    const [jobDesc, setJobDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState(null);

    const handleAnalyze = async () => {
        if (!file || !jobDesc.trim()) return;
        setLoading(true);
        setError('');
        setResults(null);

        try {
            const data = await analyzeResume(file, jobDesc);
            setResults(data);
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setResults(null);
        setError('');
    };

    return (
        <>
            {/* Animated background orbs */}
            <div className="bg-orbs">
                <div className="bg-orb bg-orb--1" />
                <div className="bg-orb bg-orb--2" />
                <div className="bg-orb bg-orb--3" />
            </div>

            <Navbar />

            <div className="app-container">
                {results ? (
                    <ResultsPage data={results} onBack={handleBack} />
                ) : (
                    <HomePage
                        file={file}
                        onFileChange={setFile}
                        jobDesc={jobDesc}
                        onJobDescChange={setJobDesc}
                        onAnalyze={handleAnalyze}
                        loading={loading}
                        error={error}
                    />
                )}
            </div>
        </>
    );
}
