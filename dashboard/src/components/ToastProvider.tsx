import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: 'rgba(17, 24, 39, 0.95)',
                    color: '#F9FAFB',
                    border: '1px solid rgba(0, 217, 255, 0.3)',
                    borderRadius: '10px',
                    backdropFilter: 'blur(16px)',
                    padding: '16px',
                },
                success: { iconTheme: { primary: '#10B981', secondary: '#F9FAFB' } },
                error: { iconTheme: { primary: '#EF4444', secondary: '#F9FAFB' } },
            }}
        />
    );
}