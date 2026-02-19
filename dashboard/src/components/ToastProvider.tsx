// src/components/ToastProvider.tsx
import { useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';

export function ToastProvider() {
    useEffect(() => {
        // Conectar ao fluxo Server-Sent Events do Backend
        const eventSource = new EventSource('http://localhost:7474/api/v3/events');

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // Tipos de Notificações
                switch (data.type) {
                    case 'machine.connected':
                        toast.success(`🟢 Nova máquina conectada: ${data.hostname}`);
                        break;
                    case 'machine.offline':
                        toast.error(`🔴 Máquina offline > 2h: ${data.hostname}`);
                        break;
                    case 'alert.cpu_high':
                        toast.error(`⚠️ CPU > 90% na máquina ${data.hostname}`, { icon: '⚠️' });
                        break;
                    case 'policy.violated':
                        toast.error(`🛡️ Política violada em ${data.hostname}`);
                        break;
                    default:
                        toast(data.message);
                }
            } catch (err) {
                console.error("Erro ao processar evento SSE:", err);
            }
        };

        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 5000,
                style: {
                    background: 'var(--bg-primary, #1e293b)',
                    color: '#fff',
                    border: '1px solid #334155',
                },
            }}
        />
    );
}