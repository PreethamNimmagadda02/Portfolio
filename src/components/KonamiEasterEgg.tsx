"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Secret: type "PN" anywhere on the page
const KONAMI_CODE = ["KeyP", "KeyN"];

// Pre-generate particle data
function useParticles(count: number) {
    return useMemo(() =>
        Array.from({ length: count }, (_, i) => {
            const angle = (i / count) * Math.PI * 2;
            const r = 0.6 + Math.random() * 0.4;
            return {
                id: i,
                angle,
                dx: Math.cos(angle) * r,
                dy: Math.sin(angle) * r,
                size: 1 + Math.random() * 2.5,
                speed: 0.6 + Math.random() * 1.2,
                delay: Math.random() * 0.4,
                color: ["#a855f7", "#6366f1", "#ec4899", "#3b82f6", "#ffffff"][i % 5],
            };
        }),
        [count]
    );
}

export default function KonamiEasterEgg() {
    const [triggered, setTriggered] = useState(false);
    const [sequence, setSequence] = useState<string[]>([]);
    const particles = useParticles(100);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (triggered) return;

            const newSequence = [...sequence, e.code].slice(-KONAMI_CODE.length);
            setSequence(newSequence);

            if (newSequence.length === KONAMI_CODE.length &&
                newSequence.every((key, i) => key === KONAMI_CODE[i])) {
                setTriggered(true);
                setSequence([]);
                setTimeout(() => setTriggered(false), 4500);
            }
        },
        [sequence, triggered]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return (
        <AnimatePresence>
            {triggered && (
                <motion.div
                    key="easter"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-[99998] pointer-events-none overflow-hidden"
                >
                    {/* Deep dark backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-[#030014]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 4.5, times: [0, 0.08, 0.85, 1] }}
                    />

                    {/* Radial glow behind center */}
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            background: "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.08) 30%, transparent 60%)",
                        }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1.2, 1.5] }}
                        transition={{ duration: 4.5, times: [0, 0.15, 0.8, 1] }}
                    />

                    {/* Warp star trails — burst outward from center */}
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            className="absolute rounded-full"
                            style={{
                                left: "50%",
                                top: "50%",
                                width: p.size,
                                height: p.size,
                                background: p.color,
                                boxShadow: `0 0 ${4 + p.size * 2}px ${p.color}`,
                                willChange: "transform, opacity",
                            }}
                            initial={{ x: 0, y: 0, scaleX: 1, opacity: 0 }}
                            animate={{
                                x: p.dx * (typeof window !== "undefined" ? window.innerWidth : 1000),
                                y: p.dy * (typeof window !== "undefined" ? window.innerHeight : 800),
                                scaleX: [1, 30, 50],
                                opacity: [0, 1, 0.8, 0],
                            }}
                            transition={{
                                duration: p.speed,
                                delay: p.delay,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                        />
                    ))}

                    {/* Expanding ring pulse */}
                    <motion.div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-400/40"
                        initial={{ width: 0, height: 0, opacity: 0.8 }}
                        animate={{ width: "150vmax", height: "150vmax", opacity: 0 }}
                        transition={{ duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <motion.div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-400/30"
                        initial={{ width: 0, height: 0, opacity: 0.6 }}
                        animate={{ width: "150vmax", height: "150vmax", opacity: 0 }}
                        transition={{ duration: 1.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />

                    {/* Central flash */}
                    <motion.div
                        className="absolute inset-0"
                        style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 50%)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    />

                    {/* PN Logo reveal */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 4, times: [0, 0.15, 0.75, 1] }}
                    >
                        <div className="flex flex-col items-center gap-6">
                            {/* Glowing PN */}
                            <motion.div
                                initial={{ scale: 0, rotateY: -180 }}
                                animate={{ scale: 1, rotateY: 0 }}
                                transition={{ duration: 1, delay: 0.3, type: "spring", stiffness: 120, damping: 15 }}
                                style={{ perspective: 800 }}
                            >
                                <div className="relative">
                                    <motion.div
                                        className="absolute -inset-8 rounded-3xl"
                                        style={{
                                            background: "conic-gradient(from 0deg, transparent, rgba(139,92,246,0.6), rgba(236,72,153,0.4), transparent, rgba(99,102,241,0.5), transparent)",
                                            filter: "blur(20px)",
                                        }}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                    <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 p-[2px] shadow-[0_0_80px_rgba(139,92,246,0.5)]">
                                        <div className="w-full h-full rounded-[14px] bg-[#030014] flex items-center justify-center">
                                            <span
                                                className="text-3xl font-black tracking-tight bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent"
                                                style={{ fontFamily: "var(--font-space-grotesk)" }}
                                            >
                                                PN
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Main text */}
                            <motion.p
                                className="text-4xl sm:text-5xl md:text-7xl font-black text-center leading-tight"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                                    Welcome to the Matrix
                                </span>
                            </motion.p>

                            {/* Subtitle */}
                            <motion.p
                                className="text-sm sm:text-base text-gray-400 tracking-[0.3em] uppercase font-medium"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 0.8, y: 0 }}
                                transition={{ delay: 1.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            >
                                You cracked the code, legend.
                            </motion.p>

                            {/* Decorative line */}
                            <motion.div
                                className="w-24 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                                initial={{ scaleX: 0, opacity: 0 }}
                                animate={{ scaleX: 1, opacity: 0.6 }}
                                transition={{ delay: 1.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            />
                        </div>
                    </motion.div>

                    {/* Vignette */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(3,0,20,0.8)_100%)] pointer-events-none" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
