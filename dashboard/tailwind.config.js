/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: "#eff6ff",
                    600: "#2563eb",
                    700: "#1d4ed8",
                },
                // Mapeia as suas variáveis do index.css para classes Tailwind!
                primary: "rgb(var(--bg-primary))",
                secondary: "rgb(var(--bg-secondary))",
                tertiary: "rgb(var(--bg-tertiary))",
                txtPrimary: "rgb(var(--text-primary))",
                txtSecondary: "rgb(var(--text-secondary))",
                bdr: "rgb(var(--border))",
                accent: "rgb(var(--accent))"
            }
        },
    },
    plugins: [],
};