import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface Machine {
    id: number;
    machine_id: string;
    hostname: string;
    custom_name?: string;
    local_ip?: string;
    mac_address?: string;
    domain_name?: string;
    current_user?: string;
    is_online: boolean;
    last_seen: string;
    cpu_name: string;
    cpu_cores: number;
    cpu_threads?: number;
    ram_total_mb: number;
    ram_used_mb: number;
    os_name: string;
    os_version: string;
    uptime_hours: number;
}

export function useMachines() {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadMachines = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await invoke<Machine[]>("list_machines");
            setMachines(data);
        } catch (err) {
            setError(err as string);
            console.error("Error loading machines:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMachines();

        // Auto-refresh cada 30 segundos
        const interval = setInterval(loadMachines, 30000);
        return () => clearInterval(interval);
    }, []);

    return { machines, loading, error, refresh: loadMachines };
}