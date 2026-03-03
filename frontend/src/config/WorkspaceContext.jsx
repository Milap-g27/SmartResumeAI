import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
    const [workspaceFile, setWorkspaceFile] = useState(null);
    const [workspaceJobDesc, setWorkspaceJobDesc] = useState('');

    useEffect(() => {
        const navEntry = performance.getEntriesByType('navigation')?.[0];
        if (navEntry?.type === 'reload') {
            setWorkspaceFile(null);
            setWorkspaceJobDesc('');
        }
    }, []);

    const value = useMemo(() => ({
        workspaceFile,
        setWorkspaceFile,
        workspaceJobDesc,
        setWorkspaceJobDesc,
        clearWorkspace: () => {
            setWorkspaceFile(null);
            setWorkspaceJobDesc('');
        },
    }), [workspaceFile, workspaceJobDesc]);

    return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
    const ctx = useContext(WorkspaceContext);
    if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
    return ctx;
}
