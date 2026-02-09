"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        // Premium smooth scrolling configuration
        const lenis = new Lenis({
            duration: 1.4, // Longer duration for luxurious feel
            easing: (t) => {
                // Custom easing: slow start, smooth acceleration, gentle stop
                // This creates a more natural, physics-based scrolling feel
                return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            },
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 0.8, // Slightly reduced for more control
            touchMultiplier: 1.5, // Balanced touch sensitivity
            infinite: false,
            lerp: 0.06, // Lower lerp for smoother, more gradual interpolation
            syncTouch: true, // Sync touch events for consistent mobile experience
            syncTouchLerp: 0.04, // Even smoother touch scrolling
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
