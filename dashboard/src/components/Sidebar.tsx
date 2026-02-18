import { View } from "../App";

interface Props {
    machineCount: number;
    currentView: View;
    onGoHome: () => void;
    onRefresh: () => void;
}

export default function Sidebar({ machineCount, onGoHome, onRefresh }: Props) {
    return (
        <aside className="w-56 bg-slate-800 border-r border-slate-700 flex flex-col">
            {/* Logo */}
            <div className="p-5 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        AS
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm">AssetScan</p>
                        <p className="text-xs text-slate-400">v1.0.0</p>
                    </div>
                </div>
            </div>

            {/* Navegação */}
            <nav className="flex-1 p-3 space-y-1">
                <button
                    onClick={onGoHome}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium
            text-slate-300 hover:bg-slate-700 hover:text-white transition-colors
            flex items-center gap-2"
                >
                    <span>🖥️</span>
                    <span>Máquinas</span>
                    <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {machineCount}
                    </span>
                </button>
            </nav>

            {/* Botão de atualizar */}
            <div className="p-3 border-t border-slate-700">
                <button
                    onClick={onRefresh}
                    className="w-full px-3 py-2 text-sm text-slate-400 hover:text-white
            hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
                >
                    <span>🔄</span>
                    <span>Atualizar</span>
                </button>
                <p className="text-xs text-slate-500 mt-2 px-1">
                    Porta: <span className="text-slate-400 font-mono">7474</span>
                </p>
            </div>
        </aside>
    );
}