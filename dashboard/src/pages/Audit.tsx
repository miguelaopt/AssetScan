import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface AuditLog {
    id: number;
    timestamp: string;
    action: string;
    resource_type: string;
    resource_id: string;
    user: string;
    details: string;
}

export default function Audit() {
    const [logs, setLogs] = useState<AuditLog[]>([]);

    useEffect(() => {
        document.title = "Auditoria - AssetScan";
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const result = await invoke<AuditLog[]>("get_audit_logs", { limit: 100 });
            setLogs(result);
        } catch (err) {
            console.error("Error loading logs:", err);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Logs de Auditoria</h1>
                <p className="text-emerald-400/80 font-medium">{logs.length} entrada(s) recentes</p>
            </div>

            <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/40 text-slate-400">
                            <tr>
                                <th className="p-5 font-semibold">Data / Hora</th>
                                <th className="p-5 font-semibold">Ação</th>
                                <th className="p-5 font-semibold">Recurso</th>
                                <th className="p-5 font-semibold">Utilizador</th>
                                <th className="p-5 font-semibold">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {logs.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Sem registos de auditoria.</td></tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-5 text-slate-400">
                                            {new Date(log.timestamp).toLocaleString("pt-PT")}
                                        </td>
                                        <td className="p-5">
                                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-emerald-400 font-medium">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-5 text-xs text-slate-400 font-mono">
                                            {log.resource_type} / {log.resource_id.substring(0, 8)}...
                                        </td>
                                        <td className="p-5 text-white font-medium">{log.user}</td>
                                        <td className="p-5 text-slate-400 max-w-xs truncate">{log.details}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}