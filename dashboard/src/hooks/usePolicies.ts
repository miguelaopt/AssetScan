import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface Policy {
    id: string;
    machine_id: string | null;
    name: string;
    description: string;
    policy_type: string;
    priority: number;
    target: string;
    action: string;
    config_json: string;
    reason: string;
    created_at: string;
    enabled: boolean;
}

export function usePolicies(machineId?: string) {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPolicies = async () => {
        try {
            setLoading(true);
            const data = await invoke<Policy[]>("list_policies", { machineId: machineId || null });
            setPolicies(data);
        } catch (error) {
            console.error("Failed to load policies", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadPolicies(); }, [machineId]);

    const createPolicy = async (policyData: any) => {
        try {
            await invoke("create_policy", {
                machineId: policyData.machineId === "all" ? null : policyData.machineId,
                name: policyData.name || "Nova Política",
                description: policyData.description || "",
                policyType: policyData.policyType || "app",
                priority: parseInt(policyData.priority) || 1,
                target: policyData.target || "*",
                action: policyData.action || "block",
                configJson: policyData.configJson || "{}",
                reason: policyData.reason || "Criado via Dashboard Enterprise"
            });
            await loadPolicies();
        } catch (error) {
            console.error("Failed to create policy", error);
            throw error;
        }
    };

    const deletePolicy = async (id: string) => {
        try {
            await invoke("delete_policy", { id });
            await loadPolicies();
        } catch (error) {
            console.error("Failed to delete policy", error);
        }
    };

    return { policies, loading, createPolicy, deletePolicy };
}