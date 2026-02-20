import { useState, useEffect } from "react";
import { Webhook, Plus, Activity, Trash2, X } from "lucide-react";

interface WebhookEntry {
    id: string;
    name: string;
    url: string;
    events: string[];
    status: 'active' | 'error';
    lastTrigger: string;
}

export default function Webhooks() {
    const [webhooks, setWebhooks] = useState<WebhookEntry[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: "", url: "", event: "alert.cpu_high" });

    useEffect(() => {
        document.title = "Webhooks - AssetScan";
        // invoke<WebhookEntry[]>("list_webhooks").then(setWebhooks).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newWebhook: WebhookEntry = {
            id: `wh-${Date.now()}`,
            name: formData.name,
            url: formData.url,
            events: [formData.event],
            status: 'active',
            lastTrigger: 'Nunca',
        };

        setWebhooks([...webhooks, newWebhook]);
        setShowModal(false);
        setFormData({ name: "", url: "", event: "alert.cpu_high" });
    };

    const handleDelete = (id: string) => {
        setWebhooks(webhooks.filter(w => w.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Integrações & Webhooks</h1>
                    <p className="text-slate-400">Notifique sistemas externos em tempo real</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" /> Novo Webhook
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {webhooks.length === 0 ? (
                    <div className="col-span-full bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
                        <Webhook className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                        <p className="text-slate-400">Nenhum webhook configurado. Clique em "Novo Webhook" para começar.</p>
                    </div>
                ) : (
                    webhooks.map((wh) => (
                        <div key={wh.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-900 rounded-lg">
                                        <Webhook className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{wh.name}</h3>
                                        <p className="text-xs text-slate-500 font-mono mt-1 truncate max-w-[200px]" title={wh.url}>{wh.url}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(wh.id)}
                                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {wh.events.map(ev => (
                                    <span key={ev} className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs">
                                        {ev}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${wh.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <span className="text-xs text-slate-400">{wh.status === 'active' ? 'Ativo' : 'Erro no último disparo'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Activity className="w-3 h-3" /> {wh.lastTrigger}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Configurar Novo Webhook</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Nome da Integração</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="ex: Alertas Slack"
                                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">URL de Destino (Endpoint)</label>
                                <input
                                    type="url"
                                    required
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="https://hooks.slack.com/..."
                                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-blue-500 outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Evento a Subscrever</label>
                                <select
                                    value={formData.event}
                                    onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-blue-500 outline-none transition-colors"
                                >
                                    <option value="machine.offline">Máquina Offline</option>
                                    <option value="alert.cpu_high">Alerta: CPU Crítico (&gt;90%)</option>
                                    <option value="policy.violated">Alerta: Política de Segurança Violada</option>
                                    <option value="vulnerability.found">Alerta: Nova Vulnerabilidade Detetada</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-700 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Guardar Webhook
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}