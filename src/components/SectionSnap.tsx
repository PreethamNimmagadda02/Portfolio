"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * SectionSnap — premium section-by-section navigation.
 *
 * Each scroll gesture smoothly glides to the next section.
 * Special behavior:
 *   - After Hero, stops at Skills Marquee
 *   - Experience section allows free scrolling until its bottom is reached,
 *     then snaps to Contact
 */
export default function SectionSnap() {
    const currentIndex = useRef(0);
    const isAnimating = useRef(false);
    const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const touchStartY = useRef(0);

    // Sections that allow free scroll within them (user can scroll freely
    // through the content, and snapping only happens when leaving the section)
    const FREE_SCROLL_SECTIONS = ["experience", "contact"];

    const SECTION_IDS = [
        "home",
        "skills-marquee",
        "about",
        "projects",
        "achievements",
        "experience",
        "contact",
    ];

    const NAVBAR_HEIGHT = 72;
    const SECTION_GAP = 8;

    /** Get the scroll-to Y position for a given section. */
    const getSectionTarget = useCallback((id: string): number => {
        const el = document.getElementById(id);
        if (!el) return 0;

        if (id === "home") return 0;

        const rect = el.getBoundingClientRect();
        return Math.max(0, window.scrollY + rect.top - NAVBAR_HEIGHT - SECTION_GAP);
    }, []);

    /** Check if the user is currently inside a free-scroll section. */
    const isInFreeScrollSection = useCallback((): {
        inFreeScroll: boolean;
        sectionId: string | null;
        atBottom: boolean;
        atTop: boolean;
    } => {
        for (const sectionId of FREE_SCROLL_SECTIONS) {
            const el = document.getElementById(sectionId);
            if (!el) continue;

            const rect = el.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionBottom = rect.bottom;
            const viewportHeight = window.innerHeight;

            // User is "inside" this section if the section top is above
            // the viewport center and the section bottom is below viewport center
            const inSection = sectionTop < NAVBAR_HEIGHT + 100 && sectionBottom > viewportHeight * 0.5;

            if (inSection) {
                // At bottom: section bottom is near or above the viewport bottom
                const atBottom = sectionBottom <= viewportHeight + 50;
                // At top: section top is near the navbar
                const atTop = sectionTop >= NAVBAR_HEIGHT - 20;

                return { inFreeScroll: true, sectionId, atBottom, atTop };
            }
        }
        return { inFreeScroll: false, sectionId: null, atBottom: false, atTop: false };
    }, []);

    /** Find which section index we're currently closest to. */
    const findCurrentIndex = useCallback((): number => {
        const scrollY = window.scrollY;
        let closestIdx = 0;
        let closestDist = Infinity;

        for (let i = 0; i < SECTION_IDS.length; i++) {
            const target = getSectionTarget(SECTION_IDS[i]);
            const dist = Math.abs(scrollY - target);
            if (dist < closestDist) {
                closestDist = dist;
                closestIdx = i;
            }
        }
        return closestIdx;
    }, [getSectionTarget]);

    useEffect(() => {
        const ANIMATION_DURATION_MS = 1200;
        const COOLDOWN_MS = 200;
        const WHEEL_THRESHOLD = 20;
        const TOUCH_THRESHOLD = 40;

        /** Get the Lenis instance from the global window object. */
        const getLenis = () => {
            return (window as unknown as {
                lenis?: {
                    scrollTo: (target: number, options?: Record<string, unknown>) => void;
                    stop: () => void;
                    start: () => void;
                }
            }).lenis;
        };

        /** Scroll to a section by index using Lenis. */
        const goToSection = (index: number) => {
            const targetIndex = Math.max(0, Math.min(index, SECTION_IDS.length - 1));

            if (targetIndex === currentIndex.current && isAnimating.current) return;
            if (targetIndex === currentIndex.current && !isAnimating.current) {
                const targetY = getSectionTarget(SECTION_IDS[targetIndex]);
                if (Math.abs(window.scrollY - targetY) < 10) return;
            }

            currentIndex.current = targetIndex;
            isAnimating.current = true;

            if (cooldownTimer.current) {
                clearTimeout(cooldownTimer.current);
                cooldownTimer.current = null;
            }

            const targetY = getSectionTarget(SECTION_IDS[targetIndex]);
            const lenis = getLenis();

            if (lenis) {
                lenis.scrollTo(Math.max(0, targetY), {
                    duration: ANIMATION_DURATION_MS / 1000,
                    easing: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
                    lock: true,
                    force: true,
                    onComplete: () => {
                        lenis.start(); // Ensure Lenis is running after snap
                        cooldownTimer.current = setTimeout(() => {
                            isAnimating.current = false;
                        }, COOLDOWN_MS);
                    },
                });
            } else {
                window.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
                setTimeout(() => {
                    isAnimating.current = false;
                }, ANIMATION_DURATION_MS + COOLDOWN_MS);
            }
        };

        /** Handle wheel events. */
        const handleWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

            // Check if we're in a free-scroll section
            const freeScroll = isInFreeScrollSection();

            if (freeScroll.inFreeScroll) {
                e.preventDefault(); // Always prevent default — we'll use Lenis to scroll

                // At bottom boundary, scrolling down → snap to next section
                // BUT if this is the last section, keep free-scrolling to the footer
                if (e.deltaY > 0 && freeScroll.atBottom) {
                    const sectionIdx = SECTION_IDS.indexOf(freeScroll.sectionId!);
                    const isLastSection = sectionIdx >= SECTION_IDS.length - 1;

                    if (!isLastSection) {
                        // Snap to next section
                        if (isAnimating.current) return;
                        if (sectionIdx >= 0) {
                            currentIndex.current = sectionIdx;
                            goToSection(sectionIdx + 1);
                        }
                        return;
                    }
                    // Last section: fall through to free-scroll below
                }
                // At top boundary, scrolling up → snap to previous section
                if (e.deltaY < 0 && freeScroll.atTop) {
                    if (isAnimating.current) return;
                    const sectionIdx = SECTION_IDS.indexOf(freeScroll.sectionId!);
                    if (sectionIdx >= 0) {
                        currentIndex.current = sectionIdx;
                        goToSection(sectionIdx - 1);
                    }
                    return;
                }

                // Free scroll within the section using Lenis
                if (isAnimating.current) return;
                const lenis = getLenis();
                if (lenis) {
                    const scrollAmount = e.deltaY * 1.5; // Natural feeling multiplier
                    lenis.scrollTo(window.scrollY + scrollAmount, {
                        duration: 0.6,
                        easing: (t: number) => 1 - Math.pow(1 - t, 3), // Cubic ease-out
                        force: true,
                    });
                }
                return;
            }

            // Check if the user is past the last section (e.g., in the footer area)
            // If so, allow free scrolling instead of snapping back
            const lastSectionEl = document.getElementById(SECTION_IDS[SECTION_IDS.length - 1]);
            if (lastSectionEl) {
                const lastRect = lastSectionEl.getBoundingClientRect();
                if (lastRect.bottom < window.innerHeight * 0.5) {
                    // We're past the last section — allow free scroll via Lenis
                    e.preventDefault();
                    if (e.deltaY < 0) {
                        // Scrolling up — snap back to last section
                        if (isAnimating.current) return;
                        goToSection(SECTION_IDS.length - 1);
                    } else {
                        // Scrolling down in footer — use Lenis to scroll naturally
                        const lenis = getLenis();
                        if (lenis) {
                            const scrollAmount = e.deltaY * 1.5;
                            lenis.scrollTo(window.scrollY + scrollAmount, {
                                duration: 0.6,
                                easing: (t: number) => 1 - Math.pow(1 - t, 3),
                                force: true,
                            });
                        }
                    }
                    return;
                }
            }

            // Normal section-snap behavior for all other sections
            e.preventDefault();
            if (isAnimating.current) return;
            if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;

            currentIndex.current = findCurrentIndex();

            if (e.deltaY > 0) {
                goToSection(currentIndex.current + 1);
            } else {
                goToSection(currentIndex.current - 1);
            }
        };

        /** Handle touch start. */
        const handleTouchStart = (e: TouchEvent) => {
            touchStartY.current = e.touches[0].clientY;
        };

        /** Handle touch move. */
        const handleTouchMove = (e: TouchEvent) => {
            const freeScroll = isInFreeScrollSection();
            if (freeScroll.inFreeScroll) return; // Allow natural scroll in free-scroll sections

            if (isAnimating.current) {
                e.preventDefault();
            }
        };

        /** Handle touch end. */
        const handleTouchEnd = (e: TouchEvent) => {
            if (isAnimating.current) return;

            const freeScroll = isInFreeScrollSection();
            if (freeScroll.inFreeScroll) {
                const touchEndY = e.changedTouches[0].clientY;
                const deltaY = touchStartY.current - touchEndY;
                // Only snap if at boundary
                if (deltaY > TOUCH_THRESHOLD && freeScroll.atBottom) {
                    const sectionIdx = SECTION_IDS.indexOf(freeScroll.sectionId!);
                    if (sectionIdx >= 0) {
                        currentIndex.current = sectionIdx;
                        goToSection(sectionIdx + 1);
                    }
                } else if (deltaY < -TOUCH_THRESHOLD && freeScroll.atTop) {
                    const sectionIdx = SECTION_IDS.indexOf(freeScroll.sectionId!);
                    if (sectionIdx >= 0) {
                        currentIndex.current = sectionIdx;
                        goToSection(sectionIdx - 1);
                    }
                }
                return;
            }

            const touchEndY = e.changedTouches[0].clientY;
            const deltaY = touchStartY.current - touchEndY;
            if (Math.abs(deltaY) < TOUCH_THRESHOLD) return;

            currentIndex.current = findCurrentIndex();
            if (deltaY > 0) {
                goToSection(currentIndex.current + 1);
            } else {
                goToSection(currentIndex.current - 1);
            }
        };

        /** Handle keyboard navigation. */
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isAnimating.current) return;

            const navKeys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "];
            if (!navKeys.includes(e.key)) return;

            // Allow normal key scrolling in free-scroll sections
            const freeScroll = isInFreeScrollSection();
            if (freeScroll.inFreeScroll) {
                if ((e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") && freeScroll.atBottom) {
                    e.preventDefault();
                    const sectionIdx = SECTION_IDS.indexOf(freeScroll.sectionId!);
                    if (sectionIdx >= 0) {
                        currentIndex.current = sectionIdx;
                        goToSection(sectionIdx + 1);
                    }
                } else if ((e.key === "ArrowUp" || e.key === "PageUp") && freeScroll.atTop) {
                    e.preventDefault();
                    const sectionIdx = SECTION_IDS.indexOf(freeScroll.sectionId!);
                    if (sectionIdx >= 0) {
                        currentIndex.current = sectionIdx;
                        goToSection(sectionIdx - 1);
                    }
                }
                // Otherwise let the browser handle normal scrolling
                return;
            }

            e.preventDefault();
            currentIndex.current = findCurrentIndex();

            switch (e.key) {
                case "ArrowDown":
                case "PageDown":
                case " ":
                    goToSection(currentIndex.current + 1);
                    break;
                case "ArrowUp":
                case "PageUp":
                    goToSection(currentIndex.current - 1);
                    break;
                case "Home":
                    goToSection(0);
                    break;
                case "End":
                    goToSection(SECTION_IDS.length - 1);
                    break;
            }
        };

        // Initialize current index
        currentIndex.current = findCurrentIndex();

        window.addEventListener("wheel", handleWheel, { passive: false });
        window.addEventListener("touchstart", handleTouchStart, { passive: true });
        window.addEventListener("touchmove", handleTouchMove, { passive: false });
        window.addEventListener("touchend", handleTouchEnd, { passive: true });
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("wheel", handleWheel);
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
            window.removeEventListener("keydown", handleKeyDown);
            if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
        };
    }, [findCurrentIndex, getSectionTarget, isInFreeScrollSection]);

    return null;
}
