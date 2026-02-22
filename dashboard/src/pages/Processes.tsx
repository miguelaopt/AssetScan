import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Activity, X } from "lucide-react";
import toast from "react-hot-toast";

interface ProcessInfo { id: number; machine_id: string; pid: number; name: string; exe_path: string; memory_mb: number; cpu_percent: number; }
interface Props { machineId: string; }

export default function ProcessesTab({ machineId }: Props) {
    const [processes, setProcesses] = useState<ProcessInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProcesses();
        const interval = setInterval(loadProcesses, 5000);
        return () => clearInterval(interval);
    }, [machineId]);

    const loadProcesses = async () => {
        try {
            const result = await invoke<ProcessInfo[]>("get_processes", { machine_id: machineId });
            setProcesses(result.sort((a, b) => b.cpu_percent - a.cpu_percent));
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const killProcess = async (proc: ProcessInfo) => {
        if (!confirm(`Terminar o processo ${proc.name}?`)) return;
        try {
            await invoke("kill_process", { machine_id: machineId, pid: proc.pid });
            toast.success(`Sinal enviado para ${proc.name}`); loadProcesses();
        } catch (err) { toast.error(`Erro: ${err}`); }
    };

    if (loading) return <div className="animate-pulse text-emerald-500/70">A ler processos...</div>;

    return (
        <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl mt-6">
            <div className="flex items-center gap-3 mb-6">
                <Activity className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-bold text-white tracking-tight">Processos em Execução</h3>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-black/40 text-slate-400 font-medium">
                        <tr>
                            <th className="px-6 py-4">PID</th>
                            <th className="px-6 py-4">Nome</th>
                            <th className="px-6 py-4">CPU %</th>
                            <th className="px-6 py-4">RAM (MB)</th>
                            <th className="px-6 py-4">Caminho</th>
                            <th className="px-6 py-4 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {processes.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Nenhum processo reportado.</td></tr>
                        ) : (
                            processes.slice(0, 100).map((proc) => (
                                <tr key={proc.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-3 text-slate-500 font-mono">{proc.pid}</td>
                                    <td className="px-6 py-3 font-medium text-white">{proc.name}</td>
                                    <td className="px-6 py-3">
                                        <span className={`font-semibold ${proc.cpu_percent > 50 ? 'text-rose-400' : proc.cpu_percent > 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                            {proc.cpu_percent.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-slate-300">{proc.memory_mb.toFixed(1)}</td>
                                    <td className="px-6 py-3 text-xs text-slate-500 font-mono truncate max-w-[200px]" title={proc.exe_path}>{proc.exe_path || 'N/A'}</td>
                                    <td className="px-6 py-3 text-right">
                                        <button onClick={() => killProcess(proc)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors text-xs font-medium">
                                            <X className="w-3 h-3" /> Terminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}