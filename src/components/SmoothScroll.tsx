"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

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

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            if ((window as unknown as { lenis: Lenis }).lenis === lenis) {
                delete (window as unknown as { lenis?: Lenis }).lenis;
            }
        };
    }, []);

    return <>{children}</>;
}
