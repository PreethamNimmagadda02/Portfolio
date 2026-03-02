"use client";

import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    duration?: number;
    once?: boolean;
    amount?: number;
}

export default function ScrollReveal({
    children,
    className = "",
    delay = 0,
    direction = "up",
    duration = 0.6,
    once = true,
    amount = 0.1,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, {
        once,
        amount,
    });

    // Subtle directional hint — small enough to not cause layout shifts
    const dirOffset = {
        up: { y: 16 },
        down: { y: -16 },
        left: { x: 16 },
        right: { x: -16 },
        none: {},
    };

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, ...dirOffset[direction] }}
            animate={isInView ? { opacity: 1, x: 0, y: 0 } : undefined}
            transition={{
                duration,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
