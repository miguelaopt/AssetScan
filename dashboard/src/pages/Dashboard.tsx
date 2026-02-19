import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Monitor, Cpu, HardDrive, Shield } from "lucide-react";
import StatCard from "../components/StatCard";
import { useMachines } from "../hooks/useMachines";
import { useMetricsHistory } from "../hooks/useMetricsHistory";
import { CPUChart, RAMChart } from "../components/charts/MetricsCharts";

interface DashboardStats {
    total_machines: number;
    online_machines: number;
    total_ram_gb: number;
    avg_cpu_usage: number;
    avg_ram_usage_percent: number;
    total_policies: number;
    active_policies: number;
}

export default function Dashboard() {
    const { machines } = useMachines();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const { data: metricsData } = useMetricsHistory("all", 12); // Últimas 12 horas

    useEffect(() => {
        document.title = "Dashboard - AssetScan";
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const result = await invoke<DashboardStats>("get_dashboard_stats");
            setStats(result);
        } catch (err) {
            console.error("Error loading stats:", err);
        }
    };

    if (!stats) return <div className="text-slate-400">A carregar estatísticas...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-slate-400">Visão geral do sistema</p>
            </div>
            {/* NOVOS GRÁFICOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Uso de CPU (Médio)</h3>
                    <CPUChart data={metricsData} />
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Uso de RAM (Média)</h3>
                    <RAMChart data={metricsData} />
                </div>
            </div>{/* NOVOS GRÁFICOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Uso de CPU (Médio)</h3>
                    <CPUChart data={metricsData} />
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Uso de RAM (Média)</h3>
                    <RAMChart data={metricsData} />
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    title="Total de Máquinas"
                    value={stats.total_machines}
                    icon={Monitor}
                    subtitle={`${stats.online_machines} online`}
                />
                <StatCard
                    title="RAM Total"
                    value={`${stats.total_ram_gb.toFixed(0)} GB`}
                    icon={Cpu}
                    iconColor="text-green-500"
                />
                <StatCard
                    title="Uso Médio RAM"
                    value={`${stats.avg_ram_usage_percent.toFixed(1)}%`}
                    icon={HardDrive}
                    iconColor="text-yellow-500"
                />
                <StatCard
                    title="Políticas Ativas"
                    value={stats.active_policies}
                    icon={Shield}
                    iconColor="text-red-500"
                    subtitle={`${stats.total_policies} total`}
                />
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Máquinas Recentes</h3>
                <div className="space-y-2">
                    {machines.slice(0, 5).map((machine) => (
                        <div
                            key={machine.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                        >
                            <div>
                                <p className="font-medium text-white">
                                    {machine.custom_name || machine.hostname}
                                </p>
                                <p className="text-sm text-slate-400">{machine.os_name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`w-2 h-2 rounded-full ${machine.is_online ? "bg-green-500" : "bg-slate-500"
                                        }`}
                                />
                                <span className="text-sm text-slate-400">
                                    {machine.is_online ? "Online" : "Offline"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}