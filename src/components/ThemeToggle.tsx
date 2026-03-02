"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { motion } from "framer-motion";

type Theme = "deep-space" | "nebula";

const ThemeContext = createContext<{
    theme: Theme;
    toggleTheme: () => void;
}>({
    theme: "deep-space",
    toggleTheme: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("deep-space");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("portfolio-theme") as Theme | null;
        if (saved && (saved === "deep-space" || saved === "nebula")) {
            setTheme(saved);
            document.documentElement.setAttribute("data-theme", saved);
        }
    }, []);

    const toggleTheme = () => {
        const next: Theme = theme === "deep-space" ? "nebula" : "deep-space";
        setTheme(next);
        localStorage.setItem("portfolio-theme", next);
        document.documentElement.setAttribute("data-theme", next);
    };

    if (!mounted) return <>{children}</>;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2 rounded-full bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/10 transition-colors group"
            aria-label={`Switch to ${theme === "deep-space" ? "Nebula" : "Deep Space"} theme`}
            title={`${theme === "deep-space" ? "Nebula" : "Deep Space"} Mode`}
        >
            {/* Deep Space icon (moon/stars) */}
            <motion.div
                className="relative w-5 h-5"
                animate={{ rotate: theme === "nebula" ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
                {theme === "deep-space" ? (
                    // Stars icon for deep space
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-full h-full text-gray-300 group-hover:text-purple-300 transition-colors"
                    >
                        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                        <path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z" />
                        <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z" />
                    </svg>
                ) : (
                    // Nebula icon (cloud/sparkle)
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-full h-full text-purple-300 group-hover:text-pink-300 transition-colors"
                    >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                        <path d="M12 6l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
                        <circle cx="17" cy="8" r="1" fill="currentColor" />
                        <circle cx="7" cy="16" r="0.5" fill="currentColor" />
                    </svg>
                )}
            </motion.div>

            {/* Glow effect */}
            <div
                className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-50 blur-md transition-opacity duration-300"
                style={{
                    background: theme === "deep-space"
                        ? "linear-gradient(135deg, #7c3aed, #3b82f6)"
                        : "linear-gradient(135deg, #ec4899, #a855f7)",
                }}
            />
        </motion.button>
    );
}
