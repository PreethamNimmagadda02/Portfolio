"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.0,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 2,
            infinite: false,
            lerp: 0.08,
        });

        lenisRef.current = lenis;

        // Track scroll direction and snap at end
        let settleTimeout: NodeJS.Timeout | null = null;
        let lastVelocity = 0;
        let isSnapping = false;

        lenis.on("scroll", ({ velocity, scroll }: { velocity: number; scroll: number }) => {
            // Don't process if we're currently snapping
            if (isSnapping) return;

            const scrollDirection = lastVelocity > 0 ? 1 : -1; // 1 = down, -1 = up

            // When scrolling nearly stops, push to next section in scroll direction
            if (Math.abs(velocity) < 0.3 && Math.abs(lastVelocity) > 0.1) {
                if (settleTimeout) clearTimeout(settleTimeout);

                settleTimeout = setTimeout(() => {
                    const sections = Array.from(document.querySelectorAll("section[id]")) as HTMLElement[];

                    // Find current section and next section based on scroll direction
                    let targetSection: HTMLElement | null = null;

                    for (let i = 0; i < sections.length; i++) {
                        const section = sections[i];
                        const rect = section.getBoundingClientRect();
                        const sectionMiddle = rect.top + rect.height / 2;

                        // If scrolling down, find the next section that's partially in view
                        if (scrollDirection > 0 && rect.top > -100 && rect.top < window.innerHeight * 0.5) {
                            targetSection = section;
                            break;
                        }
                        // If scrolling up, find section that's above the center
                        if (scrollDirection < 0 && rect.top < window.innerHeight * 0.3 && rect.bottom > 0) {
                            targetSection = section;
                        }
                    }

                    if (targetSection) {
                        const rect = targetSection.getBoundingClientRect();
                        // Only snap if not already close to the target
                        if (Math.abs(rect.top - 80) > 30) {
                            isSnapping = true;
                            const scrollTarget = window.scrollY + rect.top - 80;
                            lenis.scrollTo(scrollTarget, {
                                duration: 0.8,
                                onComplete: () => {
                                    isSnapping = false;
                                }
                            });
                        }
                    }
                }, 100);
            }

            lastVelocity = velocity;
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            if (settleTimeout) clearTimeout(settleTimeout);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
