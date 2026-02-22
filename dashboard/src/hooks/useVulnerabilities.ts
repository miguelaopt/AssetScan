import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Vulnerability } from '../types';

export function useVulnerabilities(machineId?: string) {
    const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadVulnerabilities = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await invoke<Vulnerability[]>('get_vulnerabilities', {
                machineId: machineId || null,
                severity: null,
            });
            setVulnerabilities(result);
        } catch (err) {
            setError(err as string);
            console.error('Error loading vulnerabilities:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVulnerabilities();
    }, [machineId]);

    return { vulnerabilities, loading, error, reload: loadVulnerabilities };
}