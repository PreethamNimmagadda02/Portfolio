"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        const lenis = new Lenis({
            lerp: 0.06, // Heavier, more buttery feel (was 0.1)
            duration: 1.5, // Extended momentum (was 1.2)
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            syncTouch: true, // Matches touch momentum to desktop feel
            wheelMultiplier: 1,
            touchMultiplier: 2,
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
