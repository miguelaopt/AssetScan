// Mostra se a máquina está online (vista nos últimos 2h) ou offline

interface Props {
    lastSeen: string;
}

export default function StatusBadge({ lastSeen }: Props) {
    const diffHours = (Date.now() - new Date(lastSeen).getTime()) / 3_600_000;
    const isOnline = diffHours < 2;

    return (
        <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full
        ${isOnline
                    ? "bg-green-900/50 text-green-400 border border-green-800"
                    : "bg-slate-700 text-slate-400 border border-slate-600"
                }`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-400 animate-pulse" : "bg-slate-500"}`} />
            {isOnline ? "Online" : "Offline"}
        </span>
    );
}