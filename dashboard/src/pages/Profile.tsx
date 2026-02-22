import { User, Mail, Shield, Key, Smartphone } from "lucide-react";

export default function Profile() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header do Perfil (Liquid Glass) */}
            <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex items-center gap-8 shadow-2xl">
                <div className="w-32 h-32 rounded-full bg-emerald-500/10 border-2 border-emerald-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <User className="w-16 h-16 text-emerald-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Administrador Principal</h1>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> admin@assetscan.local</span>
                        <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20"><Shield className="w-4 h-4" /> Super Admin</span>
                    </div>
                </div>
            </div>

            {/* Definições de Conta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Key className="w-5 h-5 text-emerald-400" /> Segurança
                    </h3>
                    <div className="space-y-4">
                        <button className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <p className="text-white font-medium">Alterar Palavra-passe</p>
                            <p className="text-sm text-slate-400 mt-1">Última alteração há 30 dias</p>
                        </button>
                        <button className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <p className="text-white font-medium">Autenticação de 2 Fatores (2FA)</p>
                            <p className="text-sm text-emerald-400 mt-1">Ativo e configurado</p>
                        </button>
                    </div>
                </div>

                <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-emerald-400" /> Sessões Ativas
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                            <p className="text-white font-medium">Windows 11 - Edge (Atual)</p>
                            <p className="text-sm text-slate-400 mt-1">IP: 192.168.1.100 • Online agora</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-white font-medium">iOS - Safari</p>
                            <p className="text-sm text-slate-400 mt-1">IP: 10.0.0.50 • Há 2 horas</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}