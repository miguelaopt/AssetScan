import { useEffect, useState } from "react";
import { Plus, Trash2, ShieldAlert } from "lucide-react";
import { usePolicies } from "../hooks/usePolicies";
import { useMachines } from "../hooks/useMachines";

export default function Policies() {
    const { policies, createPolicy, deletePolicy } = usePolicies();
    const { machines } = useMachines();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ policyType: "application", target: "", action: "block", reason: "", machineId: "all" });

    useEffect(() => { document.title = "Políticas - AssetScan"; }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const mId = formData.machineId === "all" ? undefined : formData.machineId;
        await createPolicy(formData.policyType, formData.target, formData.action, formData.reason, mId);
        setShowModal(false);
        setFormData({ policyType: "application", target: "", action: "block", reason: "", machineId: "all" });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Políticas de Segurança</h1>
                    <p className="text-emerald-400/80 font-medium">{policies.length} política(s) ativa(s)</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer">
                    <Plus className="w-5 h-5" /> Nova Política
                </button>
            </div>

            <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-black/40 text-slate-400 font-medium">
                        <tr>
                            <th className="px-6 py-4">Alvo</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4">Ação</th>
                            <th className="px-6 py-4">Máquina</th>
                            <th className="px-6 py-4 text-right">Remover</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {policies.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhuma política configurada.</td></tr>
                        ) : (
                            policies.map((p) => (
                                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{p.target}</td>
                                    <td className="px-6 py-4 text-emerald-400">{p.policy_type}</td>
                                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${p.action === 'block' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>{p.action.toUpperCase()}</span></td>
                                    <td className="px-6 py-4 text-slate-400">{p.machine_id ? p.machine_id.substring(0, 8) + "..." : "Global"}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => deletePolicy(p.id)} className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Glass */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#111318] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldAlert className="w-6 h-6 text-emerald-400" />
                            <h2 className="text-xl font-bold text-white">Criar Política</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Máquina Alvo</label>
                                <select value={formData.machineId} onChange={(e) => setFormData({ ...formData, machineId: e.target.value })} className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none">
                                    <option value="all">Global (Todas as Máquinas)</option>
                                    {machines.map(m => <option key={m.id} value={m.machine_id}>{m.hostname}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Nome/Processo (ex: chrome.exe)</label>
                                <input type="text" value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} required className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors">Cancelar</button>
                                <button type="submit" className="flex-1 p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors font-medium">Aplicar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}