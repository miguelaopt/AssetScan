// src/pages/ExecutiveDashboard.tsx
import { TrendingUp, Server, Activity, DollarSign } from "lucide-react";
import StatCard from "../components/StatCard";
import { useMachines } from "../hooks/useMachines";

export default function ExecutiveDashboard() {
    const { machines } = useMachines();

    // Calculadora TCO Simplificada (Baseada no Módulo 5.2)
    const calculateTCO = () => {
        const hardwareCost = machines.length * 800; // Custo médio de 800€ por máquina simulado
        const softwareCost = machines.length * 150; // Custo médio software anual
        const supportCost = machines.length * 200;  // Suporte IT
        const total = hardwareCost + softwareCost + supportCost;

        return { hardwareCost, softwareCost, supportCost, total };
    };

    const tco = calculateTCO();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Dashboard Executivo</h1>
                <p className="text-slate-400">Visão global de métricas e Total Cost of Ownership (TCO)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Assets" value={machines.length} icon={Server} />
                <StatCard title="Uptime Global Estimado" value="99.8%" icon={Activity} iconColor="text-green-500" />
                <StatCard title="TCO Global (Anual)" value={`€${(tco.total / 1000).toFixed(1)}k`} icon={DollarSign} iconColor="text-yellow-500" />
                <StatCard title="Security Score" value="A-" icon={TrendingUp} iconColor="text-blue-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Calculadora TCO Detalhada */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Desagregação TCO (Total Cost of Ownership)</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                            <span className="text-slate-400">Hardware (Amortização)</span>
                            <span className="text-white font-semibold">€{tco.hardwareCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg">
                            <span className="text-slate-400">Licenças de Software</span>
                            <span className="text-white font-semibold">€{tco.softwareCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border-l-4 border-yellow-500">
                            <span className="text-slate-400">Manutenção & Suporte IT</span>
                            <span className="text-white font-semibold">€{tco.supportCost.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-slate-700 pt-4 flex justify-between items-center">
                            <span className="text-lg font-bold text-white">Custo Total da Frota</span>
                            <span className="text-xl font-bold text-blue-500">€{tco.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Dicas de Otimização (Simulação de ML do Módulo 6.1) */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Recomendações de Inteligência (AI)</h3>
                    <div className="space-y-3">
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <h4 className="font-semibold text-blue-400">Consolidação Possível</h4>
                            <p className="text-sm text-slate-300 mt-1">Identificámos 3 máquinas com menos de 10% de uso contínuo. Considerar virtualização para poupar ~€2,400 anuais.</p>
                        </div>
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <h4 className="font-semibold text-green-400">Otimização de Licenças</h4>
                            <p className="text-sm text-slate-300 mt-1">1 Adobe Creative Cloud não é utilizada há mais de 45 dias. Cancelar subscrição irá reduzir o TCO.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}