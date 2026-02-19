import { Sun, Moon } from "lucide-react";

interface Props {
    theme: "dark" | "light";
    onToggleTheme: () => void;
}

export default function TopBar({ theme, onToggleTheme }: Props) {
    return (
        <header className="h-16 flex items-center justify-between px-6 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))]">
            <div>
                <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                    AssetScan Dashboard
                </h2>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onToggleTheme}
                    className="p-2 rounded-lg text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] transition-colors"
                    title={theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                >
                    {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>
        </header>
    );
}