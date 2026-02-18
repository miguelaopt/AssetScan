import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface Machine {
    id: string;
    machine_id: string;
    hostname: string;
    custom_name: string | null;
    tags: string[];
    notes: string | null;
    last_seen: string;
    cpu_name: string;
    cpu_cores: number;
    ram_total_mb: number;
    ram_used_mb: number;
    os_name: string;
    os_version: string;
    uptime_hours: number;
    disk_count: number;
    software_count: number;
    process_count: number;
    is_online: boolean;
}

export function useMachines() {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadMachines = useCallback(async () => {
        try {
            setLoading(true);
            const result = await invoke<Machine[]>("list_machines");
            setMachines(result);
            setError(null);
        } catch (err) {
            setError(err as string);
            console.error("Error loading machines:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMachines();
        const interval = setInterval(loadMachines, 30_000);
        return () => clearInterval(interval);
    }, [loadMachines]);

    return { machines, loading, error, reload: loadMachines };
}