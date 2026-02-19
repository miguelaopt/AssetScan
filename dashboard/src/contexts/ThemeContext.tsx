// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'blue' | 'purple' | 'high-contrast';

interface ThemeContextType {
    theme: Theme;
    accentColor: string;
    setTheme: (theme: Theme) => void;
    setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');
    const [accentColor, setAccentColor] = useState('#2563eb'); // blue-600 default

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        const savedColor = localStorage.getItem('accentColor');

        if (savedTheme) setTheme(savedTheme);
        if (savedColor) setAccentColor(savedColor);
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        localStorage.setItem('accentColor', accentColor);
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.setProperty('--theme-accent', accentColor);
    }, [theme, accentColor]);

    return (
        <ThemeContext.Provider value={{ theme, accentColor, setTheme, setAccentColor }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};