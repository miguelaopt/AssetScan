// src/pages/Compliance.tsx
import { useState } from "react";
import { ShieldCheck, Download, Play } from "lucide-react";

export default function Compliance() {
    const [standard, setStandard] = useState("ISO27001");
    const [isScanning, setIsScanning] = useState(false);
    const [report, setReport] = useState<any>(null);

    const runScan = () => {
        setIsScanning(true);
        // Simulação do backend `generate_compliance_report`
        setTimeout(() => {
            setReport({
                standard: standard,
                passed: 18,
                failed: 2,
                total: 20,
            });
            setIsScanning(false);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Compliance Reports</h1>
                    <p className="text-slate-400">Verificação de conformidade com normas da indústria</p>
                </div>
                <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 border border-slate-700 rounded-lg transition-colors">
                    <Download className="w-4 h-4" /> Exportar PDF
                </button>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-end gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Norma de Avaliação</label>
                    <select
                        value={standard}
                        onChange={(e) => setStandard(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:border-blue-500 outline-none"
                    >
                        <option value="ISO27001">ISO 27001 (Information Security)</option>
                        <option value="GDPR">RGPD / GDPR (Data Protection)</option>
                        <option value="SOC2">SOC 2 (Service Organization Control)</option>
                    </select>
                </div>
                <button
                    onClick={runScan}
                    disabled={isScanning}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                    {isScanning ? (
                        <>A Avaliar...</>
                    ) : (
                        <><Play className="w-4 h-4" /> Correr Auditoria</>
                    )}
                </button>
            </div>

            {report && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1 md:col-span-3 bg-green-500/10 border border-green-500/20 rounded-xl p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="w-10 h-10 text-green-500" />
                            <div>
                                <h3 className="text-lg font-bold text-white">Relatório Gerado ({report.standard})</h3>
                                <p className="text-green-400">Auditoria concluída com sucesso. Pontuação de Segurança: {((report.passed / report.total) * 100).toFixed(0)}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}