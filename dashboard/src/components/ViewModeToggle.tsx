// src/components/ViewModeToggle.tsx
import { LayoutGrid, List as ListIcon, Columns } from "lucide-react";

export type ViewMode = 'grid' | 'list' | 'kanban';

interface Props {
    value: ViewMode;
    onChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ value, onChange }: Props) {
    const options = [
        { id: 'grid', icon: LayoutGrid, label: 'Grid' },
        { id: 'list', icon: ListIcon, label: 'Lista' },
        { id: 'kanban', icon: Columns, label: 'Kanban' },
    ] as const;

    return (
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 w-fit">
            {options.map((opt) => {
                const Icon = opt.icon;
                const isActive = value === opt.id;
                return (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        className={`p-2 rounded-md transition-colors flex items-center gap-2 ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                        title={opt.label}
                    >
                        <Icon className="w-4 h-4" />
                    </button>
                );
            })}
        </div>
    );
}