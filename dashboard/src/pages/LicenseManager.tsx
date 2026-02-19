// src/pages/LicenseManager.tsx
import { useState } from "react";
import { Key, Users, AlertCircle, DollarSign } from "lucide-react";
import StatCard from "../components/StatCard";

interface License {
    id: string;
    software_name: string;
    type: string;
    seats_total: number;
    seats_used: number;
    cost: number;
    expiry: string;
}

export default function LicenseManager() {
    const [licenses] = useState<License[]>([
        { id: "lic-1", software_name: "Microsoft Office 365", type: "Subscrição", seats_total: 50, seats_used: 48, cost: 12.50, expiry: "2026-12-31" },
        { id: "lic-2", software_name: "JetBrains IntelliJ IDEA", type: "Anual", seats_total: 10, seats_used: 10, cost: 49.90, expiry: "2026-03-15" },
        { id: "lic-3", software_name: "Adobe Creative Cloud", type: "Volume", seats_total: 5, seats_used: 6, cost: 79.99, expiry: "2026-06-01" }, // Overuse simulado
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Gestão de Licenças</h1>
                <p className="text-slate-400">Controlo de custos, alocações e expirações de software</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total de Licenças" value={licenses.length} icon={Key} />
                <StatCard title="Custo Mensal Estimado" value={`€${licenses.reduce((acc, l) => acc + (l.cost * l.seats_used), 0).toFixed(2)}`} icon={DollarSign} iconColor="text-green-500" />
                <StatCard title="Licenças Esgotadas/Excesso" value="1" icon={AlertCircle} iconColor="text-red-500" />
                <StatCard title="Utilizadores Ativos" value="64" icon={Users} iconColor="text-blue-500" />
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-400 text-sm">
                        <tr>
                            <th className="p-4 font-semibold">Software</th>
                            <th className="p-4 font-semibold">Tipo</th>
                            <th className="p-4 font-semibold">Alocação (Usado/Total)</th>
                            <th className="p-4 font-semibold">Custo/Seat</th>
                            <th className="p-4 font-semibold">Expiração</th>
                            <th className="p-4 font-semibold text-right">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 text-sm">
                        {licenses.map((lic) => {
                            const isOverused = lic.seats_used > lic.seats_total;
                            return (
                                <tr key={lic.id} className="hover:bg-slate-700/50">
                                    <td className="p-4 font-medium text-white">{lic.software_name}</td>
                                    <td className="p-4 text-slate-300">{lic.type}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${isOverused ? 'bg-red-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${Math.min((lic.seats_used / lic.seats_total) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className={`${isOverused ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                                                {lic.seats_used} / {lic.seats_total}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-300">€{lic.cost.toFixed(2)}</td>
                                    <td className="p-4 text-slate-300">{lic.expiry}</td>
                                    <td className="p-4 text-right">
                                        {isOverused ? (
                                            <span className="px-2 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-xs font-semibold">Violação</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-semibold">Regular</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}