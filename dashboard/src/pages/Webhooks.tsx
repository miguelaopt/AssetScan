// src/pages/Webhooks.tsx
import { useState } from "react";
import { Webhook, Plus, Activity, Trash2 } from "lucide-react";

interface WebhookEntry {
    id: string;
    name: string;
    url: string;
    events: string[];
    status: 'active' | 'error';
    lastTrigger: string;
}

export default function Webhooks() {
    const [webhooks] = useState<WebhookEntry[]>([
        { id: "wh-1", name: "Slack Alertas Críticos", url: "https://hooks.slack.com/services/T00...", events: ["alert.cpu_high", "machine.offline"], status: "active", lastTrigger: "Hoje às 10:45" },
        { id: "wh-2", name: "Integração ServiceNow", url: "https://empresa.service-now.com/api...", events: ["policy.violated", "vulnerability.found"], status: "error", lastTrigger: "Ontem às 14:20" },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Integrações & Webhooks</h1>
                    <p className="text-slate-400">Notifique sistemas externos em tempo real</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <Plus className="w-4 h-4" /> Novo Webhook
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {webhooks.map((wh) => (
                    <div key={wh.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-900 rounded-lg">
                                    <Webhook className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{wh.name}</h3>
                                    <p className="text-xs text-slate-500 font-mono mt-1 truncate max-w-[200px]">{wh.url}</p>
                                </div>
                            </div>
                            <button className="text-slate-500 hover:text-red-500 transition-colors">
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
                ))}
            </div>
        </div>
    );
}