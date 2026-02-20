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
    duration = 0.7,
    once = true,
    amount = 0.15,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, {
        once,
        amount,
    });

    const directions = {
        up: { y: 60, x: 0 },
        down: { y: -60, x: 0 },
        left: { x: 60, y: 0 },
        right: { x: -60, y: 0 },
        none: { x: 0, y: 0 },
    };

    const initial = {
        opacity: 0,
        scale: 0.97,
        filter: "blur(6px)",
        ...directions[direction],
    };

    const animate = {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
    };

    return (
        <motion.div
            ref={ref}
            initial={initial}
            animate={isInView ? animate : initial}
            transition={{
                duration,
                delay,
                ease: [0.16, 1, 0.3, 1], // Custom ease-out expo curve for premium feel
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
