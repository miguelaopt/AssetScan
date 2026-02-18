import { Sun, Moon, RefreshCw } from "lucide-react";

interface Props {
    theme: "dark" | "light";
    onToggleTheme: () => void;
}

export default function TopBar({ theme, onToggleTheme }: Props) {
    return (
        <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
            <div>
                <h2 className="text-lg font-semibold text-white">
                    {document.title || "AssetScan Dashboard"}
                </h2>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleTheme}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    title={theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                >
                    {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>
        </header>
    );
}