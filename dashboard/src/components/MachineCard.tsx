import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MachineCard({ machine }: { machine: any }) {
    const navigate = useNavigate();

    return (
        <div
            // Navega para a página de detalhes usando o ID da máquina.
            // Nota: Confirma se a tua rota no App.tsx é "/machines/:id" ou "/machine/:id"
            onClick={() => navigate(`/machines/${machine.machine_id || machine.id}`)}
            className="liquid-glass rounded-xl p-6 border border-white/10 cursor-pointer hover:border-emerald-500/50 hover:bg-white/5 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all"
        >
            <h3 className="text-xl font-bold text-white mb-2">
                {machine.custom_name || machine.hostname}
            </h3>
            <p className="text-gray-400 text-sm">
                IP: {machine.local_ip || 'N/A'}
            </p>
            <div className="mt-4 flex items-center justify-between">
                {machine.is_online ? (
                    <span className="badge-apple-online">Online</span>
                ) : (
                    <span className="badge-apple text-gray-500">Offline</span>
                )}

                {/* Uma pequena seta para indicar que é possível entrar */}
                <span className="text-emerald-500/0 hover:text-emerald-500 transition-colors group-hover:text-emerald-500">
                    ➔
                </span>
            </div>
        </div>
    );
}