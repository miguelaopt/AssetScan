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
    // 1. TODOS OS HOOKS TÊM DE ESTAR AQUI DENTRO!
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filterType, setFilterType] = useState<string>("all");
    const [filterUser, setFilterUser] = useState<string>("");
    // const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date()]); // Descomentar quando implementar filtro de datas

    useEffect(() => {
        document.title = "Auditoria - AssetScan";
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            // Ajusta os parâmetros conforme a tua função Rust espera
            const result = await invoke<AuditLog[]>("get_audit_logs", { limit: 100 });
            setLogs(result);
        } catch (err) {
            console.error("Error loading logs:", err);
        }
    };

    // 2. A filtragem também tem de estar cá dentro para aceder aos estados
    const filteredLogs = logs.filter(log => {
        if (filterType !== "all" && log.action !== filterType) return false;
        if (filterUser && !log.user.includes(filterUser)) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Registo de Auditoria</h1>
                    <p className="text-slate-400">Monitorização de todas as ações administrativas</p>
                </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-slate-400">
                            <tr>
                                <th className="p-5 font-medium">Data / Hora</th>
                                <th className="p-5 font-medium">Ação</th>
                                <th className="p-5 font-medium">Recurso / ID</th>
                                <th className="p-5 font-medium">Utilizador</th>
                                <th className="p-5 font-medium">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredLogs.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Nenhum registo na auditoria.</td></tr>
                            ) : (
                                filteredLogs.map((log) => (
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