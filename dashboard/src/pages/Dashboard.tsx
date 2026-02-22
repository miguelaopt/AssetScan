import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Monitor, Cpu, HardDrive, Shield } from "lucide-react";
import StatCard from "../components/StatCard";
import { useMachines } from "../hooks/useMachines";

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

            {/* AVISO: Gráficos removidos temporariamente para teste */}
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-xl">
                Se consegues ver este aviso, o problema está 100% na biblioteca recharts!
            </div>

            <div className="grid grid-cols-4 gap-4">
                <StatCard title="Total de Máquinas" value={stats.total_machines || 0} icon={Monitor} subtitle={`${stats.online_machines || 0} online`} />
                <StatCard title="RAM Total" value={`${(stats.total_ram_gb || 0).toFixed(0)} GB`} icon={Cpu} iconColor="text-green-500" />
                <StatCard title="Uso Médio RAM" value={`${(stats.avg_ram_usage_percent || 0).toFixed(1)}%`} icon={HardDrive} iconColor="text-yellow-500" />
                <StatCard title="Políticas Ativas" value={stats.active_policies || 0} icon={Shield} iconColor="text-red-500" subtitle={`${stats.total_policies || 0} total`} />
            </div>
        </div>
    );
}