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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Logs de Auditoria</h1>
                <p className="text-slate-400">{logs.length} entrada(s) recentes</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-900">
                        <tr>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">Timestamp</th>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">Ação</th>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">Recurso</th>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">Utilizador</th>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">Detalhes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-700/50">
                                <td className="p-4 text-sm text-slate-400">
                                    {new Date(log.timestamp).toLocaleString("pt-PT")}
                                </td>
                                <td className="p-4 text-sm text-white font-medium">{log.action}</td>
                                <td className="p-4 text-xs text-slate-400">
                                    {log.resource_type} / {log.resource_id.substring(0, 8)}...
                                </td>
                                <td className="p-4 text-sm text-slate-300">{log.user}</td>
                                <td className="p-4 text-sm text-slate-400">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}