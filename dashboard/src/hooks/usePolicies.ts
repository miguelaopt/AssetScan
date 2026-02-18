import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface Policy {
    id: string;
    machine_id: string | null;
    policy_type: "application" | "website";
    target: string;
    action: "allow" | "block";
    reason: string;
    created_by: string;
    created_at: string;
    enabled: boolean;
}

export function usePolicies(machineId?: string) {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPolicies = useCallback(async () => {
        try {
            const result = await invoke<Policy[]>("list_policies", {
                machineId: machineId || null,
            });
            setPolicies(result);
        } catch (err) {
            console.error("Error loading policies:", err);
        } finally {
            setLoading(false);
        }
    }, [machineId]);

    const createPolicy = async (
        policyType: string,
        target: string,
        action: string,
        reason: string,
        machineId?: string
    ) => {
        await invoke("create_policy", {
            machineId: machineId || null,
            policyType,
            target,
            action,
            reason,
        });
        await loadPolicies();
    };

    const deletePolicy = async (policyId: string) => {
        await invoke("delete_policy", { policyId });
        await loadPolicies();
    };

    useEffect(() => {
        loadPolicies();
    }, [loadPolicies]);

    return { policies, loading, createPolicy, deletePolicy, reload: loadPolicies };
}