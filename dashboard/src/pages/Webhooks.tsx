import { useState } from "react";
import { Webhook, Plus, Trash2, Activity } from "lucide-react";

export default function Webhooks() {
    // Dados por defeito para nunca estar vazio!
    const [webhooks, setWebhooks] = useState([
        { id: "1", name: "Alerta Slack IT", url: "https://hooks.slack.com/services/T00...", events: ["alert.cpu_high", "machine.offline"], enabled: true },
        { id: "2", name: "Microsoft Teams Sec", url: "https://outlook.office.com/webhook/...", events: ["vulnerability.found"], enabled: true }
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Webhooks</h1>
                    <p className="text-slate-400">Integração em tempo real com serviços externos</p>
                </div>
                <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer">
                    <Plus className="w-5 h-5" /> Novo Webhook
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {webhooks.map((wh) => (
                    <div key={wh.id} className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                                    <Webhook className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">{wh.name}</h3>
                                    <p className="text-xs text-slate-400 font-mono mt-1 truncate max-w-[220px]">{wh.url}</p>
                                </div>
                            </div>
                            <button className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {wh.events.map(ev => (
                                <span key={ev} className="bg-white/5 border border-white/10 text-emerald-400 px-3 py-1 rounded-lg text-xs font-medium">{ev}</span>
                            ))}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                <span className="text-sm font-medium text-white">Ativo</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                                <Activity className="w-4 h-4" /> Pronto a escutar
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}