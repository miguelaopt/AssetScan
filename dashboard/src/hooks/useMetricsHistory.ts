import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface MetricData {
    timestamp: string;
    cpu: number;
    ram: number;
}

export function useMetricsHistory(machineId: string = 'all', hours: number = 12) {
    const [data, setData] = useState<MetricData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMetrics();
        const interval = setInterval(loadMetrics, 30_000); // Actualiza a cada 30s
        return () => clearInterval(interval);
    }, [machineId, hours]);

    const loadMetrics = async () => {
        try {
            setLoading(true);
            const result = await invoke<Array<[string, number, number]>>('get_metrics_history', {
                machineId,
                hours,
            });

            // Transforma dados do backend
            const formatted = result.map(([timestamp, cpu, ram]) => ({
                timestamp,
                cpu,
                ram,
            }));

            setData(formatted);
        } catch (err) {
            console.error('Error loading metrics:', err);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, reload: loadMetrics };
}