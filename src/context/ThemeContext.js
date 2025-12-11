import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from "react";
const ThemeContext = createContext(undefined);
export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem("theme");
        if (saved) {
            return saved === "dark";
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });
    useEffect(() => {
        const html = document.documentElement;
        if (isDark) {
            html.classList.add("dark");
        }
        else {
            html.classList.remove("dark");
        }
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }, [isDark]);
    const toggleTheme = () => {
        setIsDark(prev => !prev);
    };
    return (_jsx(ThemeContext.Provider, { value: { isDark, toggleTheme }, children: children }));
}
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return context;
}
