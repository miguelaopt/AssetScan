import { Key } from "lucide-react";

export default function Settings() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Configurações</h1>
                <p className="text-slate-400">Gerir parâmetros e chaves do sistema</p>
            </div>

            <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <Key className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">API Keys do Agente</h3>
                </div>
                <p className="text-slate-400 mb-6 max-w-2xl">
                    As chaves são necessárias para a comunicação segura entre as máquinas cliente e o teu Dashboard. Nunca partilhes estas chaves publicamente.
                </p>
                <div className="bg-black/50 border border-white/10 rounded-2xl p-5 font-mono text-sm text-emerald-400 shadow-inner">
                    A chave atual foi gerada nos logs do terminal na primeira execução (Rust).
                </div>
            </div>

            <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6">Informação do Sistema</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <p className="text-slate-400 text-sm mb-1">Versão do AssetScan</p>
                        <p className="text-white font-bold text-xl">3.0.0 Pro</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <p className="text-slate-400 text-sm mb-1">Porta de Escuta (HTTP)</p>
                        <p className="text-emerald-400 font-mono font-bold text-xl">7474</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <p className="text-slate-400 text-sm mb-1">Motor de Base de Dados</p>
                        <p className="text-white font-bold text-xl">SQLite Local</p>
                    </div>
                </div>
            </div>
        </div>
    );
}