import { useState } from "react";
import { AlertTriangle, ShieldAlert, CheckCircle, X } from "lucide-react";
import StatCard from "../components/StatCard";

interface Vulnerability {
    id: number;
    machine_id: string;
    software_name: string;
    cve_id: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    status: string;
    description: string;
}

export default function Vulnerabilities() {
    const [vulns, setVulns] = useState<Vulnerability[]>([
        { id: 1, machine_id: "mac-001", software_name: "Google Chrome", cve_id: "CVE-2023-4863", severity: "CRITICAL", status: "open", description: "Vulnerabilidade de heap buffer overflow no WebP do Google Chrome que permite execução arbitrária de código." },
        { id: 2, machine_id: "srv-db", software_name: "OpenSSL", cve_id: "CVE-2022-3602", severity: "HIGH", status: "open", description: "Vulnerabilidade no parsing de certificados X.509 que pode resultar em Denial of Service (DoS)." },
    ]);
    const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'HIGH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
    };

    const handleIgnore = (id: number) => {
        setVulns(vulns.filter(v => v.id !== id));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Vulnerabilidades</h1>
                <p className="text-slate-400">CVEs detectados nos assets (Powered by NVD)</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <StatCard title="Críticas (Ação Imediata)" value={vulns.filter(v => v.severity === 'CRITICAL').length} icon={ShieldAlert} iconColor="text-red-500" />
                <StatCard title="Alta/Média Severidade" value={vulns.filter(v => v.severity === 'HIGH' || v.severity === 'MEDIUM').length} icon={AlertTriangle} iconColor="text-orange-500" />
                <StatCard title="Vulnerabilidades Mitigadas" value="42" icon={CheckCircle} iconColor="text-green-500" />
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-400 text-sm">
                        <tr>
                            <th className="p-4 font-semibold">CVE ID</th>
                            <th className="p-4 font-semibold">Software</th>
                            <th className="p-4 font-semibold">Máquina</th>
                            <th className="p-4 font-semibold">Severidade</th>
                            <th className="p-4 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 text-sm">
                        {vulns.map((v) => (
                            <tr key={v.id} className="hover:bg-slate-700/50">
                                <td className="p-4 font-medium text-white">{v.cve_id}</td>
                                <td className="p-4 text-slate-300">{v.software_name}</td>
                                <td className="p-4 text-slate-400 font-mono text-xs">{v.machine_id}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(v.severity)}`}>
                                        {v.severity}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => setSelectedVuln(v)} className="text-blue-400 hover:text-blue-300 mr-4 transition-colors">Detalhes</button>
                                    <button onClick={() => handleIgnore(v.id)} className="text-slate-400 hover:text-white transition-colors">Ignorar</button>
                                </td>
                            </tr>
                        ))}
                        {vulns.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">Nenhuma vulnerabilidade detectada! Parabéns!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Detalhes */}
            {selectedVuln && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl w-[500px] shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">{selectedVuln.cve_id}</h2>
                            <button onClick={() => setSelectedVuln(null)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-sm text-slate-300">
                            <div>
                                <p className="font-semibold text-slate-400 mb-1">Software Afetado</p>
                                <p className="bg-slate-900 p-2 rounded-lg border border-slate-700">{selectedVuln.software_name}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-400 mb-1">Máquina</p>
                                <p className="bg-slate-900 p-2 rounded-lg border border-slate-700 font-mono text-xs">{selectedVuln.machine_id}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-400 mb-1">Descrição Técnica</p>
                                <p className="bg-slate-900 p-3 rounded-lg border border-slate-700 leading-relaxed">{selectedVuln.description}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedVuln(null)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}