"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Star {
    id: number;
    size: number;
    x: number;
    y: number;
    delay: number;
    duration: number;
    color: string;
}

function makeStars(count: number): Star[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        size: Math.random() * 2 + 0.5,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
        color: i % 4 === 0 ? "#a855f7" : i % 4 === 1 ? "#6366f1" : i % 4 === 2 ? "#818cf8" : "#ffffff",
    }));
}

export default function PageLoader() {
    const [loading, setLoading] = useState(true);
    // Lazy initializer: only called on the client, never during SSR.
    // This ensures Math.random() values are consistent between SSR (none)
    // and the first client render (initialized here).
    const [stars] = useState<Star[]>(() => makeStars(60));

    useEffect(() => {
        // Gate the loader on actual page readiness rather than a fixed delay.
        // - MIN_SHOWN keeps the intro from flashing on fast loads.
        // - MAX_WAIT guarantees content is never blocked indefinitely.
        const MIN_SHOWN = 600;
        const MAX_WAIT = 3500;
        const start = performance.now();
        let done = false;

        const finish = () => {
            if (done) return;
            done = true;
            setLoading(false);
            window.dispatchEvent(new Event("loader-done"));
        };

        const dismiss = () => {
            const elapsed = performance.now() - start;
            const remaining = Math.max(0, MIN_SHOWN - elapsed);
            setTimeout(finish, remaining);
        };

        const maxTimer = setTimeout(finish, MAX_WAIT);

        if (document.readyState === "complete") {
            dismiss();
        } else {
            window.addEventListener("load", dismiss, { once: true });
        }

        return () => {
            clearTimeout(maxTimer);
            window.removeEventListener("load", dismiss);
        };
    }, []);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    key="loader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#030014]"
                >
                    {/* Twinkling star field */}
                    <div className="absolute inset-0 overflow-hidden">
                        {stars.map((star) => (
                            <motion.div
                                key={star.id}
                                className="absolute rounded-full"
                                style={{
                                    width: star.size,
                                    height: star.size,
                                    left: `${star.x}%`,
                                    top: `${star.y}%`,
                                    background: star.color,
                                    willChange: "opacity",
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 0.8, 0.2, 0.6, 0] }}
                                transition={{
                                    duration: star.duration,
                                    delay: star.delay,
                                    ease: "easeInOut",
                                }}
                            />
                        ))}
                    </div>

                    {/* Central branded content */}
                    <motion.div
                        className="relative z-10 flex flex-col items-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Logo with glow */}
                        <motion.div
                            className="relative mb-10"
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Orbiting glow ring */}
                            <motion.div
                                className="absolute -inset-8 rounded-3xl"
                                style={{
                                    background: "conic-gradient(from 0deg, transparent 0%, rgba(139,92,246,0.5) 25%, transparent 50%, rgba(99,102,241,0.4) 75%, transparent 100%)",
                                    filter: "blur(20px)",
                                    willChange: "transform",
                                }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />

                            {/* Ambient pulse glow */}
                            <motion.div
                                className="absolute -inset-12 rounded-full"
                                style={{
                                    background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
                                    willChange: "opacity",
                                }}
                                animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />

                            {/* Logo card */}
                            <div className="relative w-[88px] h-[88px] rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 p-[1.5px]"
                                style={{ boxShadow: "0 0 40px rgba(139,92,246,0.3), 0 0 80px rgba(139,92,246,0.1)" }}>
                                <div className="w-full h-full rounded-[14.5px] bg-[#030014] flex items-center justify-center">
                                    <motion.span
                                        className="text-[28px] font-black tracking-tight bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent select-none"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                        style={{ fontFamily: "var(--font-space-grotesk)" }}
                                    >
                                        PN
                                    </motion.span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Name */}
                        <motion.div
                            className="text-center mb-8 px-4"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <p
                                className="text-sm sm:text-base font-semibold tracking-[0.18em] sm:tracking-[0.3em] uppercase whitespace-nowrap bg-gradient-to-r from-purple-300 via-white to-indigo-300 bg-clip-text text-transparent"
                                style={{
                                    textShadow: "0 0 30px rgba(139,92,246,0.3)",
                                    fontFamily: "var(--font-space-grotesk)",
                                }}
                            >
                                Preetham Nimmagadda
                            </p>
                        </motion.div>

                        {/* Minimal loading bar */}
                        <motion.div
                            className="w-36 h-[1.5px] rounded-full overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.04)" }}
                            initial={{ opacity: 0, scaleX: 0.8 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: 0.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <motion.div
                                className="h-full rounded-full"
                                style={{
                                    background: "linear-gradient(90deg, rgba(139,92,246,0.8), rgba(99,102,241,0.6), rgba(59,130,246,0.8))",
                                }}
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                            />
                        </motion.div>
                    </motion.div>

                    {/* Subtle radial vignette */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(3,0,20,0.8)_100%)] pointer-events-none" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
