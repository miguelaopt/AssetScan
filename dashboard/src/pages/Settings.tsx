import { useEffect } from "react";
import { Settings as SettingsIcon, Key } from "lucide-react";

export default function Settings() {
    useEffect(() => {
        document.title = "Configurações - AssetScan";
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Configurações</h1>
                <p className="text-slate-400">Gerir configurações do sistema</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Key className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-white">API Keys</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                    As API Keys são geradas automaticamente na primeira execução.
                    Consulte os logs do terminal para obter a chave.
                </p>
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                    <code className="text-sm text-slate-300 font-mono">
                        Verifique o terminal do dashboard para ver a API Key gerada.
                    </code>
                </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Informação do Sistema</h3>
                <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-slate-400">Versão</dt>
                        <dd className="text-white font-mono">2.0.0</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-slate-400">Porta HTTP</dt>
                        <dd className="text-white font-mono">7474</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-slate-400">Base de Dados</dt>
                        <dd className="text-white font-mono">SQLite (local)</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}