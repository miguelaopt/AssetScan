import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Policy } from '../types';

export function usePolicies(machineId?: string) {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPolicies = async () => {
        try {
            setLoading(true);
            const result = await invoke<Policy[]>('list_policies', {
                machineId: machineId || null,
            });
            setPolicies(result);
        } catch (err) {
            console.error('Error loading policies:', err);
        } finally {
            setLoading(false);
        }
    };

    const createPolicy = async (
        policyType: string,
        target: string,
        action: string,
        reason: string,
    ) => {
        try {
            await invoke('create_policy', {
                machineId: machineId || null,
                policyType,
                target,
                action,
                reason,
            });
            await loadPolicies();
        } catch (err) {
            console.error('Error creating policy:', err);
            throw err;
        }
    };

    const deletePolicy = async (policyId: string) => {
        try {
            await invoke('delete_policy', { policyId });
            await loadPolicies();
        } catch (err) {
            console.error('Error deleting policy:', err);
            throw err;
        }
    };

    useEffect(() => {
        loadPolicies();
    }, [machineId]);

    return { policies, loading, createPolicy, deletePolicy, reload: loadPolicies };
}