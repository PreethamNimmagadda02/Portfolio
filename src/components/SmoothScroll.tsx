"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        // Premium smooth scrolling configuration
        // Note: duration and lerp conflict in Lenis — using duration only for predictable animation
        const lenis = new Lenis({
            duration: 1.2, // Smooth but responsive scroll feel
            easing: (t) => {
                // Exponential ease-out: constant-feel scroll with a soft stop
                return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            },
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 0.85, // Responsive but controlled scrolling
            touchMultiplier: 1.2, // Refined touch sensitivity
            infinite: false,
            syncTouch: true, // Sync touch events for consistent mobile experience
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
        };
    }, []);

    return <>{children}</>;
}
