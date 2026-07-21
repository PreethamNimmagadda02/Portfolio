"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null);
    const reqIdRef = useRef<number | null>(null);

    useEffect(() => {
        const lenis = new Lenis({
            lerp: 0.07, // Extremely smooth, floaty momentum
            smoothWheel: true,
            syncTouch: false, // Native momentum scrolling on touch is usually better
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        lenisRef.current = lenis;

        // Expose lenis globally for programmatic scrolling from other components
        (window as unknown as { lenis: Lenis }).lenis = lenis;

        function raf(time: number) {
            lenis.raf(time);
            reqIdRef.current = requestAnimationFrame(raf);
        }

        reqIdRef.current = requestAnimationFrame(raf);

        return () => {
            if (reqIdRef.current) {
                cancelAnimationFrame(reqIdRef.current);
            }
            lenis.destroy();
            if ((window as unknown as { lenis: Lenis }).lenis === lenis) {
                delete (window as unknown as { lenis?: Lenis }).lenis;
            }
        };
    }, []);

    return <>{children}</>;
}
