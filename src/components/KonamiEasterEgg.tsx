"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Secret: type "PN" anywhere on the page
const KONAMI_CODE = ["KeyP", "KeyN"];

// Matrix rain characters (mix of latin, katakana, digits)
const MATRIX_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソ0123456789@#$%&*";

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

// Pre-generate matrix rain column data
function useMatrixColumns(count: number) {
    return useMemo(() =>
        Array.from({ length: count }, (_, i) => ({
            id: i,
            x: (i / count) * 100,
            speed: 2 + Math.random() * 4,
            delay: Math.random() * 2,
            chars: Array.from({ length: 8 + Math.floor(Math.random() * 12) }, () =>
                MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
            ),
            fontSize: 10 + Math.random() * 6,
            opacity: 0.15 + Math.random() * 0.35,
        })),
        [count]
    );
}

// Pre-generate orbital particles
function useOrbitals(count: number) {
    return useMemo(() =>
        Array.from({ length: count }, (_, i) => ({
            id: i,
            offset: (i / count) * 360,
            radiusX: 55 + Math.random() * 15,
            radiusY: 55 + Math.random() * 15,
            size: 2 + Math.random() * 2,
            duration: 2 + Math.random() * 1.5,
            color: ["#a855f7", "#ec4899", "#6366f1", "#3b82f6", "#c084fc"][i % 5],
        })),
        [count]
    );
}

// Matrix rain column component
function MatrixColumn({ x, speed, delay, chars, fontSize, opacity }: {
    x: number; speed: number; delay: number; chars: string[]; fontSize: number; opacity: number;
}) {
    return (
        <motion.div
            className="absolute top-0 flex flex-col items-center pointer-events-none"
            style={{ left: `${x}%`, fontSize: `${fontSize}px`, fontFamily: "monospace" }}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "120vh", opacity: [0, opacity, opacity, 0] }}
            transition={{
                duration: speed,
                delay: 0.8 + delay,
                repeat: Infinity,
                ease: "linear",
            }}
        >
            {chars.map((char, i) => (
                <span
                    key={i}
                    className="leading-tight"
                    style={{
                        color: i === 0 ? "#ffffff" : `rgba(168, 85, 247, ${1 - i * 0.06})`,
                        textShadow: i === 0 ? "0 0 12px #a855f7" : "none",
                    }}
                >
                    {char}
                </span>
            ))}
        </motion.div>
    );
}

// Orbital particle around the PN logo
function OrbitalParticle({ offset, radiusX, radiusY, size, duration, color }: {
    offset: number; radiusX: number; radiusY: number; size: number; duration: number; color: string;
}) {
    return (
        <motion.div
            className="absolute rounded-full"
            style={{
                width: size,
                height: size,
                background: color,
                boxShadow: `0 0 ${size * 3}px ${color}`,
                left: "50%",
                top: "50%",
            }}
            animate={{
                x: [
                    Math.cos((offset * Math.PI) / 180) * radiusX,
                    Math.cos(((offset + 90) * Math.PI) / 180) * radiusX,
                    Math.cos(((offset + 180) * Math.PI) / 180) * radiusX,
                    Math.cos(((offset + 270) * Math.PI) / 180) * radiusX,
                    Math.cos((offset * Math.PI) / 180) * radiusX,
                ],
                y: [
                    Math.sin((offset * Math.PI) / 180) * radiusY,
                    Math.sin(((offset + 90) * Math.PI) / 180) * radiusY,
                    Math.sin(((offset + 180) * Math.PI) / 180) * radiusY,
                    Math.sin(((offset + 270) * Math.PI) / 180) * radiusY,
                    Math.sin((offset * Math.PI) / 180) * radiusY,
                ],
                opacity: [0.4, 1, 0.4, 1, 0.4],
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: "linear",
                delay: 0.5,
            }}
        />
    );
}

// Typewriter text with glitch flicker
function TypewriterText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
    const [displayed, setDisplayed] = useState("");
    const [glitchIndex, setGlitchIndex] = useState(-1);

    useEffect(() => {
        let i = 0;
        let intervalId: NodeJS.Timeout;

        const delayTimer = setTimeout(() => {
            intervalId = setInterval(() => {
                if (i < text.length) {
                    setDisplayed(text.slice(0, i + 1));
                    setGlitchIndex(i);
                    setTimeout(() => setGlitchIndex(-1), 80);
                    i++;
                } else {
                    clearInterval(intervalId);
                }
            }, 70);
        }, delay * 1000);

        return () => {
            clearTimeout(delayTimer);
            if (intervalId) clearInterval(intervalId);
        };
    }, [text, delay]);

    return (
        <span className={className}>
            {displayed.split("").map((char, i) => (
                <span
                    key={i}
                    style={{
                        display: "inline-block",
                        transform: i === glitchIndex ? `translateX(${Math.random() * 4 - 2}px) translateY(${Math.random() * 3 - 1.5}px)` : "none",
                        opacity: i === glitchIndex ? 0.7 : 1,
                        transition: "all 0.05s",
                    }}
                >
                    {char === " " ? "\u00A0" : char}
                </span>
            ))}
            <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse" }}
                className="inline-block w-[2px] h-[0.9em] bg-purple-400 ml-0.5 align-middle"
            />
        </span>
    );
}

// ACCESS GRANTED badge with glitch flicker
function AccessGrantedBadge() {
    return (
        <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{
                opacity: [0, 1, 0.3, 1, 0.6, 1],
                scaleX: [0, 1, 1, 1, 1, 1],
            }}
            transition={{ duration: 0.8, delay: 2.5, ease: "easeOut" }}
            className="mt-4 px-6 py-1.5 border border-green-400/50 bg-green-400/5 rounded-sm"
        >
            <span className="text-green-400 text-xs sm:text-sm font-mono tracking-[0.4em] uppercase font-bold">
                ✦ Access Granted ✦
            </span>
        </motion.div>
    );
}

export default function KonamiEasterEgg() {
    const [triggered, setTriggered] = useState(false);
    const [sequence, setSequence] = useState<string[]>([]);
    const [isExiting, setIsExiting] = useState(false);
    const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const autoCloseRef = useRef<NodeJS.Timeout | null>(null);

    const particles = useParticles(100);
    const matrixColumns = useMatrixColumns(40);
    const orbitals = useOrbitals(8);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (triggered) return;

            const newSequence = [...sequence, e.code].slice(-KONAMI_CODE.length);
            setSequence(newSequence);

            if (newSequence.length === KONAMI_CODE.length &&
                newSequence.every((key, i) => key === KONAMI_CODE[i])) {
                setTriggered(true);
                setSequence([]);
                // Auto-dismiss after 8 seconds
                autoCloseRef.current = setTimeout(() => {
                    setIsExiting(true);
                    setTimeout(() => {
                        setTriggered(false);
                        setIsExiting(false);
                    }, 1200);
                }, 8000);
            }
        },
        [sequence, triggered]
    );

    const handleClick = useCallback(() => {
        if (isExiting) return;
        if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
        setIsExiting(true);
        setTimeout(() => {
            setTriggered(false);
            setIsExiting(false);
        }, 1200);
    }, [isExiting]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
        };
    }, []);

    return (
        <AnimatePresence>
            {triggered && (
                <motion.div
                    key="easter"
                    initial={{ opacity: 0 }}
                    animate={isExiting ? { opacity: 0, scale: 0.3 } : { opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={isExiting
                        ? { duration: 1, ease: [0.55, 0, 1, 0.45] }
                        : { duration: 1, ease: [0.22, 1, 0.36, 1] }
                    }
                    className="fixed inset-0 z-[99998] pointer-events-auto overflow-hidden cursor-pointer"
                    onClick={handleClick}
                    onMouseMove={handleMouseMove}
                >
                    {/* Deep dark backdrop */}
                    <div className="absolute inset-0 bg-[#030014]" />

                    {/* Scanline overlay for CRT feel */}
                    <div
                        className="absolute inset-0 pointer-events-none z-50 opacity-[0.03]"
                        style={{
                            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
                            backgroundSize: "100% 4px",
                        }}
                    />

                    {/* Radial glow behind center */}
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            background: "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.08) 30%, transparent 60%)",
                        }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={isExiting
                            ? { opacity: 0, scale: 0 }
                            : { opacity: [0, 1, 1, 0.6], scale: [0.5, 1.2, 1.2, 1] }
                        }
                        transition={{ duration: 6.5, times: [0, 0.1, 0.85, 1] }}
                    />

                    {/* Matrix rain backdrop */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {matrixColumns.map((col) => (
                            <MatrixColumn key={col.id} {...col} />
                        ))}
                    </div>

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
                            animate={isExiting
                                ? {
                                    x: 0,
                                    y: 0,
                                    scaleX: 1,
                                    opacity: 0,
                                }
                                : {
                                    x: p.dx * (typeof window !== "undefined" ? window.innerWidth : 1000),
                                    y: p.dy * (typeof window !== "undefined" ? window.innerHeight : 800),
                                    scaleX: [1, 30, 50],
                                    opacity: [0, 1, 0.8, 0],
                                }
                            }
                            transition={isExiting
                                ? { duration: 0.8, ease: [0.55, 0, 1, 0.45] }
                                : {
                                    duration: p.speed,
                                    delay: p.delay,
                                    ease: [0.16, 1, 0.3, 1],
                                }
                            }
                        />
                    ))}

                    {/* Shockwave ring cascade — 3 staggered rings */}
                    {[
                        { delay: 0.15, color: "border-purple-400/50", duration: 1.6 },
                        { delay: 0.35, color: "border-pink-400/40", duration: 1.8 },
                        { delay: 0.55, color: "border-indigo-400/30", duration: 2.0 },
                    ].map((ring, i) => (
                        <motion.div
                            key={`ring-${i}`}
                            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${ring.color}`}
                            initial={{ width: 0, height: 0, opacity: 0.9 }}
                            animate={isExiting
                                ? { width: 0, height: 0, opacity: 0 }
                                : { width: "160vmax", height: "160vmax", opacity: 0 }
                            }
                            transition={{ duration: ring.duration, delay: ring.delay, ease: [0.22, 1, 0.36, 1] }}
                        />
                    ))}

                    {/* Central flash */}
                    <motion.div
                        className="absolute inset-0"
                        style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.5) 0%, transparent 50%)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    />

                    {/* PN Logo reveal with orbital particles */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center z-10"
                        initial={{ opacity: 0 }}
                        animate={isExiting
                            ? { opacity: 0, scale: 0, rotate: 180 }
                            : { opacity: [0, 1, 1, 1], scale: 1 }
                        }
                        transition={isExiting
                            ? { duration: 0.8, ease: [0.55, 0, 1, 0.45] }
                            : { duration: 8, times: [0, 0.08, 0.9, 1] }
                        }
                    >
                        <div className="flex flex-col items-center gap-6">
                            {/* Glowing PN with orbitals */}
                            <motion.div
                                initial={{ scale: 0, rotateY: -180 }}
                                animate={{ scale: 1, rotateY: 0 }}
                                transition={{ duration: 1, delay: 0.3, type: "spring", stiffness: 120, damping: 15 }}
                                style={{ perspective: 800 }}
                            >
                                <div className="relative">
                                    {/* Rotating conic glow */}
                                    <motion.div
                                        className="absolute -inset-8 rounded-3xl"
                                        style={{
                                            background: "conic-gradient(from 0deg, transparent, rgba(139,92,246,0.6), rgba(236,72,153,0.4), transparent, rgba(99,102,241,0.5), transparent)",
                                            filter: "blur(20px)",
                                        }}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />

                                    {/* Breathing glow pulse */}
                                    <motion.div
                                        className="absolute -inset-4 rounded-2xl"
                                        style={{
                                            background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
                                        }}
                                        animate={{
                                            opacity: [0.3, 0.8, 0.3],
                                            scale: [1, 1.15, 1],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    />

                                    {/* Orbital particles */}
                                    {orbitals.map((orb) => (
                                        <OrbitalParticle key={orb.id} {...orb} />
                                    ))}

                                    {/* The PN badge */}
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

                            {/* Main text — typewriter reveal */}
                            <motion.div
                                className="text-4xl sm:text-5xl md:text-7xl font-black text-center leading-tight"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <TypewriterText
                                    text="Welcome to the Matrix"
                                    className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"
                                    delay={0.7}
                                />
                            </motion.div>

                            {/* Subtitle */}
                            <motion.p
                                className="text-sm sm:text-base text-gray-400 tracking-[0.3em] uppercase font-medium font-mono"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 0.8, y: 0 }}
                                transition={{ delay: 1.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            >
                                You cracked the code, legend.
                            </motion.p>

                            {/* Decorative line */}
                            <motion.div
                                className="w-32 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                                initial={{ scaleX: 0, opacity: 0 }}
                                animate={{ scaleX: 1, opacity: 0.6 }}
                                transition={{ delay: 2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            />

                            {/* ACCESS GRANTED badge */}
                            <AccessGrantedBadge />

                            {/* Press anywhere to exit hint */}
                            <motion.p
                                className="text-xs text-gray-600 mt-6 tracking-widest uppercase font-mono"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 0.5, 0.3, 0.5] }}
                                transition={{ delay: 3, duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                Press anywhere to exit
                            </motion.p>
                        </div>
                    </motion.div>

                    {/* Vignette */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(3,0,20,0.8)_100%)] pointer-events-none z-20" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
