import { Grid3x3, List, Kanban } from "lucide-react";

export type ViewMode = 'grid' | 'list' | 'kanban';

interface Props {
    mode: ViewMode;
    onChange: (mode: ViewMode) => void;
}

export default function ViewModeToggle({ mode, onChange }: Props) {
    const modes = [
        { value: 'grid' as ViewMode, icon: Grid3x3, label: 'Grade' },
        { value: 'list' as ViewMode, icon: List, label: 'Lista' },
        { value: 'kanban' as ViewMode, icon: Kanban, label: 'Kanban' },
    ];

    return (
        <div className="liquid-glass rounded-xl p-1 flex gap-1">
            {modes.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => onChange(value)}
                    className={`
            px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 ripple-container
            ${mode === value
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
          `}
                    title={label}
                >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
    );
}