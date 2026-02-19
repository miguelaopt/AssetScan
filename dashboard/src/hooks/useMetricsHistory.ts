// src/hooks/useMetricsHistory.ts
import { useState, useEffect } from "react";
// import { invoke } from "@tauri-apps/api/core";

export interface MetricPoint {
    timestamp: string;
    cpu: number;
    ram: number;
}

export function useMetricsHistory(machineId: string = "all", hours: number = 24) {
    const [data, setData] = useState<MetricPoint[]>([]);

    useEffect(() => {
        // Simulação de dados para visualização enquanto o Backend agrega os reais.
        // Futuramente: invoke('get_metrics_history', { machineId, hours })
        const generateMockData = () => {
            const mock = [];
            const now = new Date();
            for (let i = hours; i >= 0; i--) {
                const d = new Date(now.getTime() - i * 60 * 60 * 1000);
                mock.push({
                    timestamp: `${d.getHours()}:00`,
                    cpu: Math.floor(Math.random() * 30) + 10, // 10% a 40%
                    ram: Math.floor(Math.random() * 40) + 30, // 30% a 70%
                });
            }
            return mock;
        };

        setData(generateMockData());

        const interval = setInterval(() => setData(generateMockData()), 30_000);
        return () => clearInterval(interval);
    }, [machineId, hours]);

    return { data };
}