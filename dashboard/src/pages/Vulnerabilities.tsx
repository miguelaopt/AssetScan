import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AlertTriangle, ShieldAlert, CheckCircle, X } from "lucide-react";
import StatCard from "../components/StatCard";

interface Vulnerability {
    id: number;
    machine_id: string;
    software_name: string;
    cve_id: string;
    severity: string;
    status: string;
    description: string;
}

export default function Vulnerabilities() {
    const [vulns, setVulns] = useState<Vulnerability[]>([]);
    const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);

    useEffect(() => {
        // Agora busca dados REAIS do Backend Tauri!
        invoke<Vulnerability[]>("list_vulnerabilities").then(setVulns).catch(console.error);
    }, []);

    const handleIgnore = async (id: number) => {
        // Num ambiente real, chamarias um comando Tauri para apagar na DB
        setVulns(vulns.filter(v => v.id !== id));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Vulnerabilidades</h1>
                <p className="text-slate-400">CVEs detetados na rede</p>
            </div>
            {/* Mantém a tabela igual ao código anterior que enviei, mas agora usa a variável vulns que vem da DB! */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden p-4">
                {vulns.length === 0 ? (
                    <p className="text-center text-slate-400 p-4">Nenhuma vulnerabilidade detetada no momento.</p>
                ) : (
                    <table className="w-full text-left">
                        <thead className="text-slate-400 text-sm"><tr><th>CVE</th><th>Software</th><th>Severidade</th><th>Ações</th></tr></thead>
                        <tbody className="text-white">
                            {vulns.map(v => (
                                <tr key={v.id} className="border-t border-slate-700">
                                    <td className="py-2">{v.cve_id}</td><td>{v.software_name}</td><td>{v.severity}</td>
                                    <td>
                                        <button onClick={() => setSelectedVuln(v)} className="text-blue-400 mr-2">Ver</button>
                                        <button onClick={() => handleIgnore(v.id)} className="text-slate-400">Ignorar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}