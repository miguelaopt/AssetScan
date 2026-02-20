import { useEffect, useState } from "react";
import { Plus, Trash2, Power } from "lucide-react";
import { usePolicies } from "../hooks/usePolicies";
import { useMachines } from "../hooks/useMachines";

export default function Policies() {
    const { policies, createPolicy, deletePolicy } = usePolicies();
    const { machines } = useMachines();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        policyType: "application", target: "", action: "block", reason: "", machineId: "all",
    });

    useEffect(() => { document.title = "Políticas - AssetScan"; }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const mId = formData.machineId === "all" ? undefined : formData.machineId;
        await createPolicy(formData.policyType, formData.target, formData.action, formData.reason, mId);
        setShowModal(false);
        setFormData({ policyType: "application", target: "", action: "block", reason: "", machineId: "all" });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Políticas de Segurança</h1>
                    <p className="text-slate-400">{policies.length} política(s) configurada(s)</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-5 h-5" /><span>Nova Política</span>
                </button>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-300 text-sm">
                        <tr>
                            <th className="p-4">Tipo</th><th className="p-4">Alvo</th><th className="p-4">Máquina</th>
                            <th className="p-4">Ação</th><th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {policies.map((policy) => (
                            <tr key={policy.id} className="hover:bg-slate-700/50">
                                <td className="p-4 text-sm text-slate-300 capitalize">{policy.policy_type}</td>
                                <td className="p-4 text-sm text-white font-mono">{policy.target}</td>
                                <td className="p-4 text-sm text-slate-400">{policy.machine_id ? policy.machine_id : "Todas (Global)"}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${policy.action === "block" ? "bg-red-900/50 text-red-400" : "bg-green-900/50 text-green-400"}`}>
                                        {policy.action}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => deletePolicy(policy.id)} className="p-2 text-red-400 hover:bg-red-900/50 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-4">Nova Política</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Máquina Alvo</label>
                                <select value={formData.machineId} onChange={(e) => setFormData({ ...formData, machineId: e.target.value })} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white">
                                    <option value="all">Todas as Máquinas</option>
                                    {machines.map(m => <option key={m.id} value={m.machine_id}>{m.hostname}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-300 mb-1">Tipo</label>
                                    <select value={formData.policyType} onChange={(e) => setFormData({ ...formData, policyType: e.target.value })} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white">
                                        <option value="application">Aplicação</option><option value="website">Website</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-300 mb-1">Ação</label>
                                    <select value={formData.action} onChange={(e) => setFormData({ ...formData, action: e.target.value })} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white">
                                        <option value="block">Bloquear</option><option value="allow">Permitir</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Alvo</label>
                                <input type="text" value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} placeholder="ex: chrome.exe" className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white" required />
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-2 bg-slate-700 text-white rounded-lg">Cancelar</button>
                                <button type="submit" className="flex-1 p-2 bg-blue-600 text-white rounded-lg">Criar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}