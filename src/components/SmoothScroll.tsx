"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { frame, cancelFrame } from "@/lib/motion";
import { setScrollVelocity } from "@/lib/scroll-velocity";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        // syncTouch: false — native momentum scrolling on touch devices is
        // smoother and cheaper than JS-driven scroll. Hijacking touch causes
        // laggy, "floaty" scrolling on low/mid-range phones.
        const lenis = new Lenis({
            lerp: 0.1, // Snappier response while staying smooth
            duration: 1.2, // Less momentum overshoot
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            syncTouch: false, // Never hijack native touch momentum
            wheelMultiplier: 1,
            touchMultiplier: 1,
            infinite: false,
        });

        lenisRef.current = lenis;

        // Expose lenis globally for programmatic scrolling from other components
        (window as unknown as { lenis: Lenis }).lenis = lenis;

        // Publish signed velocity for velocity-reactive effects (Task 6).
        lenis.on("scroll", (e: Lenis) => setScrollVelocity(e.velocity));

        // Drive Lenis inside framer-motion's single frame loop so smoothed scroll
        // and every Framer scroll-linked animation are computed in the same frame —
        // eliminating the one-frame desync from two independent rAF loops.
        const update = (data: { timestamp: number }) => {
            lenis.raf(data.timestamp);
        };
        frame.update(update, true); // keepAlive: run every frame

        return () => {
            cancelFrame(update);
            lenis.destroy();
            setScrollVelocity(0);
            if ((window as unknown as { lenis: Lenis }).lenis === lenis) {
                delete (window as unknown as { lenis?: Lenis }).lenis;
            }
        };
    }, []);

    return <>{children}</>;
}
