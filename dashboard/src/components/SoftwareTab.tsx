import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Package, Ban } from "lucide-react";
import toast from "react-hot-toast";

interface SoftwareEntry { name: string; version: string; publisher: string; install_date: string; }
interface Props { machineId: string; }

export default function SoftwareTab({ machineId }: Props) {
    const [software, setSoftware] = useState<SoftwareEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadSoftware(); }, [machineId]);

    const loadSoftware = async () => {
        try {
            // CORRIGIDO PARA machineId:
            const result = await invoke<SoftwareEntry[]>("get_software", { machineId });
            setSoftware(result);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const blockSoftware = async (sw: SoftwareEntry) => {
        if (!confirm(`Bloquear ${sw.name}?`)) return;
        try {
            await invoke("block_software_for_machine", { machineId, softwareName: sw.name, reason: "Bloqueado pelo administrador" });
            toast.success(`${sw.name} bloqueado nesta máquina.`);
        } catch (err) { toast.error(`Erro: ${err}`); }
    };

    if (loading) return <div className="animate-pulse text-emerald-500/70">A carregar aplicações...</div>;

    return (
        <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl mt-6">
            <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-emerald-400" />
                <h3 className="text-xl font-bold text-white tracking-tight">Software Instalado ({software.length})</h3>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-black/40 text-slate-400 font-medium">
                        <tr>
                            <th className="px-6 py-4">Nome</th>
                            <th className="px-6 py-4">Versão</th>
                            <th className="px-6 py-4">Editor</th>
                            <th className="px-6 py-4">Data Instalação</th>
                            <th className="px-6 py-4 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {software.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhum software detetado.</td></tr>
                        ) : (
                            software.map((sw, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3"><Package className="w-4 h-4 text-emerald-500/70" /> {sw.name}</td>
                                    <td className="px-6 py-4 text-slate-400">{sw.version || 'N/A'}</td>
                                    <td className="px-6 py-4 text-slate-400">{sw.publisher || 'Desconhecido'}</td>
                                    <td className="px-6 py-4 text-slate-400">{sw.install_date || 'N/A'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => blockSoftware(sw)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors text-xs font-medium"><Ban className="w-3 h-3" /> Bloquear</button>
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