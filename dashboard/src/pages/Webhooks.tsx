import { useState, useEffect } from "react";
import { Webhook, Plus, Trash2, Power } from "lucide-react";

interface WebhookConfig {
    id: string;
    name: string;
    url: string;
    events: string[];
    enabled: boolean;
}

export default function Webhooks() {
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
    const [showCreate, setShowCreate] = useState(false);

    const eventTypes = [
        'machine.online',
        'machine.offline',
        'alert.cpu_high',
        'alert.disk_full',
        'policy.violated',
        'vulnerability.found',
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Webhooks</h1>
                    <p className="text-gray-400">Integração com serviços externos</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Novo Webhook
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {webhooks.length === 0 ? (
                    <div className="glass rounded-xl p-12 text-center">
                        <Webhook className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">Nenhum webhook configurado</p>
                        <button onClick={() => setShowCreate(true)} className="btn-ghost">
                            Criar Primeiro Webhook
                        </button>
                    </div>
                ) : (
                    webhooks.map(wh => (
                        <div key={wh.id} className="glass-hover rounded-xl p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-white">{wh.name}</h3>
                                        {wh.enabled ? (
                                            <span className="badge badge-success">Ativo</span>
                                        ) : (
                                            <span className="badge badge-error">Desativado</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 font-mono mb-3">{wh.url}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {wh.events.map(ev => (
                                            <span key={ev} className="badge badge-info">
                                                {ev}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button className="btn-icon">
                                        <Power className="w-4 h-4" />
                                    </button>
                                    <button className="btn-icon text-red-500 hover:bg-red-500/10">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass rounded-xl p-6 w-full max-w-md animate-scale-in">
                        <h2 className="text-xl font-bold text-white mb-4">Novo Webhook</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Nome</label>
                                <input type="text" className="input" placeholder="Slack Notifications" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">URL</label>
                                <input type="url" className="input" placeholder="https://hooks.slack.com/..." />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Eventos</label>
                                <div className="space-y-2">
                                    {eventTypes.map(ev => (
                                        <label key={ev} className="flex items-center gap-2">
                                            <input type="checkbox" className="rounded" />
                                            <span className="text-sm text-gray-300">{ev}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowCreate(false)} className="flex-1 btn-ghost">
                                    Cancelar
                                </button>
                                <button className="flex-1 btn-primary">
                                    Criar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}