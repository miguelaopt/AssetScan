import { LayoutGrid, List, Columns } from "lucide-react";

export type ViewMode = 'grid' | 'list' | 'kanban';

interface Props {
    value: ViewMode;
    onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: Props) {
    const modes: { mode: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
        { mode: 'grid', icon: LayoutGrid, label: 'Grid' },
        { mode: 'list', icon: List, label: 'Lista' },
        { mode: 'kanban', icon: Columns, label: 'Kanban' },
    ];

    return (
        <div className="glass rounded-lg p-1 inline-flex gap-1">
            {modes.map(({ mode, icon: Icon, label }) => (
                <button
                    key={mode}
                    onClick={() => onChange(mode)}
                    className={`
            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
            ${value === mode
                            ? 'bg-gradient-to-r from-cyber-500 to-deep-blue-500 text-white shadow-lg shadow-cyber-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
          `}
                    title={label}
                >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
    );
}