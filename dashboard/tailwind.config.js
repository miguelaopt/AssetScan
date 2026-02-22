/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                'apple-green': {
                    400: '#4ADE80',
                    500: '#10B981',
                    600: '#059669',
                },
            },
            animation: {
                'spring-in': 'spring-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
            },
            keyframes: {
                'spring-in': {
                    '0%': { opacity: '0', transform: 'scale(0.9) translateY(10px)' },
                    '60%': { opacity: '1', transform: 'scale(1.02) translateY(-2px)' },
                    '100%': { transform: 'scale(1) translateY(0)' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' },
                    '50%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.8)' },
                },
            },
        },
    },
    plugins: [],
}