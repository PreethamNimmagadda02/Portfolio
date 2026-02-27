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
        up: { y: 40, x: 0, rotateX: 5, rotateY: 0 },
        down: { y: -40, x: 0, rotateX: -5, rotateY: 0 },
        left: { x: 40, y: 0, rotateY: -5, rotateX: 0 },
        right: { x: -40, y: 0, rotateY: 5, rotateX: 0 },
        none: { x: 0, y: 0, rotateX: 0, rotateY: 0 },
    };

    const initial = {
        opacity: 0,
        scale: 0.98,
        ...directions[direction],
    };

    const animate = {
        opacity: 1,
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
    };

    return (
        <motion.div
            ref={ref}
            initial={initial}
            animate={isInView ? animate : initial}
            transition={{
                duration: duration + 0.1,
                delay,
                ease: [0.16, 1, 0.3, 1], // Smoother, more refined ease-out curve
            }}
            style={{ perspective: 1200 }} // Enable 3D perspective
            className={className}
        >
            {children}
        </motion.div>
    );
}
