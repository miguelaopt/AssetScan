import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

// CORRETO: A função NÃO É async
export function useMetricsHistory(machineId: string, hours: number) {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        // A função async fica aqui dentro!
        const fetchMetrics = async () => {
            try {
                const result = await invoke("get_metrics_history", { machineId, hours });
                setData(result as any[]);
            } catch (err) {
                console.error("Erro ao carregar métricas:", err);
            }
        };

        fetchMetrics();
    }, [machineId, hours]);

    return { data };
}