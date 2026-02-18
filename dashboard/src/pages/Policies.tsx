import { useEffect, useState } from "react";
import { Shield, Plus, Trash2 } from "lucide-react";
import { usePolicies } from "../hooks/usePolicies";

export default function Policies() {
    const { policies, createPolicy, deletePolicy, loading } = usePolicies();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        policyType: "application",
        target: "",
        action: "block",
        reason: "",
    });

    useEffect(() => {
        document.title = "Políticas - AssetScan";
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createPolicy(
            formData.policyType,
            formData.target,
            formData.action,
            formData.reason
        );
        setShowModal(false);
        setFormData({ policyType: "application", target: "", action: "block", reason: "" });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Políticas de Segurança</h1>
                    <p className="text-slate-400">{policies.length} política(s) configurada(s)</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Nova Política</span>
                </button>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-900">
                        <tr>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">Tipo</th>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">Alvo</th>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">Ação</th>
                            <th className="text-left p-4 text-sm font-semibold text-slate-300">Razão</th>
                            <th className="text-right p-4 text-sm font-semibold text-slate-300">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {policies.map((policy) => (
                            <tr key={policy.id} className="hover:bg-slate-700/50">
                                <td className="p-4">
                                    <span className="text-sm text-slate-300 capitalize">
                                        {policy.policy_type}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm text-white font-mono">{policy.target}</span>
                                </td>
                                <td className="p-4">
                                    <span
                                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${policy.action === "block"
                                                ? "bg-red-900/50 text-red-400"
                                                : "bg-green-900/50 text-green-400"
                                            }`}
                                    >
                                        {policy.action}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="text-sm text-slate-400">{policy.reason}</span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => deletePolicy(policy.id)}
                                        className="p-2 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-4">Nova Política</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Tipo
                                </label>
                                <select
                                    value={formData.policyType}
                                    onChange={(e) => setFormData({ ...formData, policyType: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                >
                                    <option value="application">Aplicação</option>
                                    <option value="website">Website</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Alvo
                                </label>
                                <input
                                    type="text"
                                    value={formData.target}
                                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                    placeholder={formData.policyType === "application" ? "ex: chrome.exe" : "ex: facebook.com"}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Ação
                                </label>
                                <select
                                    value={formData.action}
                                    onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                >
                                    <option value="block">Bloquear</option>
                                    <option value="allow">Permitir</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Razão
                                </label>
                                <input
                                    type="text"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    placeholder="ex: Política de segurança corporativa"
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                    required
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Criar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}