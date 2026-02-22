import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Monitor, Cpu, HardDrive, Shield } from "lucide-react";
import StatCard from "../components/StatCard";
import { useMachines } from "../hooks/useMachines";
import { useMetricsHistory } from "../hooks/useMetricsHistory";
import { CPUChart, RAMChart } from "../components/charts/MetricsCharts";

interface DashboardStats {
    total_machines: number; online_machines: number; total_ram_gb: number;
    avg_cpu_usage: number; avg_ram_usage_percent: number; total_policies: number; active_policies: number;
}

export default function Dashboard() {
    const { machines } = useMachines();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const { data: metricsData } = useMetricsHistory("all", 12);

    useEffect(() => { document.title = "Dashboard - AssetScan"; loadStats(); }, []);

    const loadStats = async () => {
        try { const result = await invoke<DashboardStats>("get_dashboard_stats"); setStats(result); }
        catch (err) { console.error("Error loading stats:", err); }
    };

    if (!stats) return <div className="animate-pulse text-emerald-500/70">A carregar estatísticas...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total de Máquinas" value={stats.total_machines || 0} icon={Monitor} subtitle={`${stats.online_machines || 0} online`} />
                <StatCard title="RAM Total Gerida" value={`${(stats.total_ram_gb || 0).toFixed(0)} GB`} icon={Cpu} iconColor="text-emerald-500" />
                <StatCard title="Uso Médio RAM" value={`${(stats.avg_ram_usage_percent || 0).toFixed(1)}%`} icon={HardDrive} iconColor="text-emerald-400" />
                <StatCard title="Políticas Ativas" value={stats.active_policies || 0} icon={Shield} iconColor="text-emerald-500" />
            </div>

            {/* Gráficos Históricos em modo Liquid Glass */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                    <h3 className="text-lg font-bold text-white mb-6">Uso Global de CPU</h3>
                    <div className="h-64"><CPUChart data={metricsData} /></div>
                </div>
                <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                    <h3 className="text-lg font-bold text-white mb-6">Uso Global de RAM</h3>
                    <div className="h-64"><RAMChart data={metricsData} /></div>
                </div>
            </div>
        </div>
    );
}