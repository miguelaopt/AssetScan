// src/pages/Compliance.tsx
import { useState } from "react";
import { ShieldCheck, Play } from "lucide-react";

export default function Compliance() {
    const [standard, setStandard] = useState("ISO27001");
    const [isScanning, setIsScanning] = useState(false);
    const [report, setReport] = useState<any>(null);

    const runScan = () => {
        setIsScanning(true);
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
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Compliance Reports</h1>
                <p className="text-gray-500">Verificação de conformidade com normas da indústria</p>
            </div>

            <div className="liquid-glass rounded-2xl p-6 flex items-end gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Norma de Avaliação
                    </label>
                    <select
                        value={standard}
                        onChange={(e) => setStandard(e.target.value)}
                        className="w-full liquid-glass rounded-xl p-3 text-white outline-none border border-white/10 focus:border-apple-green-500 transition-colors"
                    >
                        <option value="ISO27001">ISO 27001 (Information Security)</option>
                        <option value="GDPR">RGPD / GDPR (Data Protection)</option>
                        <option value="SOC2">SOC 2 (Service Organization Control)</option>
                    </select>
                </div>
                <button
                    onClick={runScan}
                    disabled={isScanning}
                    className="btn-apple-primary ripple-container disabled:opacity-50 flex items-center gap-2"
                >
                    {isScanning ? (
                        <>A Avaliar...</>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            Correr Auditoria
                        </>
                    )}
                </button>
            </div>

            {report && (
                <div className="liquid-glass rounded-2xl p-6 border-green-500/20 spring-in">
                    <div className="flex items-center gap-4">
                        <ShieldCheck className="w-10 h-10 text-green-500 glow-green" />
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                Relatório Gerado ({report.standard})
                            </h3>
                            <p className="text-green-400">
                                Pontuação de Segurança: {((report.passed / report.total) * 100).toFixed(0)}%
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}