"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, EASE_HEAVY, EASE_SETTLE } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { isSceneWarmed } from "@/lib/utils";

/* ---------------------------------------------------------------------------
   Timing, in milliseconds unless noted.

   MIN_SHOWN was 2200ms when the loader covered several WebGL sections warming
   in parallel. The page now has one persistent CosmicScene and nothing else to
   wait for, and the match cut into the hero carries the brand moment instead
   of the loader dwelling on it, so the floor drops to 1400ms. One constant to
   revert if the owner prefers the longer hold.
   --------------------------------------------------------------------------- */
const MIN_SHOWN = 1400;
const MIN_SHOWN_REDUCED = 600;
const MAX_WAIT = 5000;

/* The name is pressed across the panel like foil, 150ms after mount. */
const NAME_DELAY_S = 0.15;
const NAME_WIPE_S = 0.9;

/* Exit sequence. Stretch and name fade run together; the wipe starts when the
   stretch lands, and that instant is when loader-done fires. */
const STRETCH_S = 0.5;
const NAME_FADE_S = 0.3;
const WIPE_S = 0.9;
const LINE_FADE_S = 0.3;
const REDUCED_FADE_S = 0.2;

/* The drawn line: 240px wide, 1px tall. */
const TRACK_WIDTH = 240;

/* Time constant (ms) with which the drawn line closes on its target each frame,
   so real progress reads as a pour rather than a jump. */
const FILL_TAU = 180;

/* If the fill has not visibly landed this long after finish is called, exit
   anyway. Only reachable if requestAnimationFrame is throttled to nothing. */
const FILL_SETTLE_FALLBACK = 600;

type Phase = "loading" | "stretch";

type LoaderWindow = Window & { __loaderDone?: boolean };

/* Flag plus event: components mounted after the event fired can still detect
   completion via the flag (see useLoaderDone in Hero). */
function announceLoaderDone() {
  (window as LoaderWindow).__loaderDone = true;
  window.dispatchEvent(new Event("loader-done"));
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Obsidian panel with the name in Bodoni and a 240px aurum line that fills
 * with real warm-up progress. On completion the line stretches to the
 * viewport width, the name fades, loader-done fires, and the panel wipes
 * upward while the hero contracts the same line into its headline rule.
 *
 * Event timing, measured from the moment the fill lands at 1:
 *   t = 0ms      line begins stretching (500ms, ease settle); name fades (300ms)
 *   t = 500ms    window.__loaderDone = true, "loader-done" dispatched,
 *                aria-busy cleared, panel wipe begins (900ms, ease heavy),
 *                line fades (300ms)
 *   t = 1400ms   panel unmounts
 * Reduced motion: no stretch; loader-done fires as the 200ms fade begins.
 */
export default function PageLoader() {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(true);
  const [phase, setPhase] = useState<Phase>("loading");
  const [stretchFactor, setStretchFactor] = useState(1);
  const fill = useMotionValue(0);
  /* The clock survives effect re-runs (a reduced-motion preference change
     mid-load) so MIN_SHOWN is measured from the real mount. */
  const startRef = useRef<number | null>(null);

  /* Screen readers: the document is busy while the panel is up. */
  useEffect(() => {
    if (!shown) return;
    document.body.setAttribute("aria-busy", "true");
    return () => {
      document.body.removeAttribute("aria-busy");
    };
  }, [shown]);

  /* Loading phase: track progress, hold for MIN_SHOWN, bail at MAX_WAIT. */
  useEffect(() => {
    if (phase !== "loading") return;

    const start = (startRef.current ??= performance.now());
    const minShown = reduced ? MIN_SHOWN_REDUCED : MIN_SHOWN;

    let raf = 0;
    let finishing = false;
    let dismissed = false;
    let exited = false;
    let last = performance.now();
    let current = fill.get();
    let minTimer: ReturnType<typeof setTimeout> | undefined;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;

    const beginExit = () => {
      if (exited) return;
      exited = true;
      cancelAnimationFrame(raf);
      fill.set(1);
      if (reduced) {
        /* No stretch: the hero renders its rule in place, so hand over now. */
        announceLoaderDone();
        setShown(false);
        return;
      }
      setStretchFactor((window.innerWidth + 4) / TRACK_WIDTH);
      setPhase("stretch");
    };

    const frame = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      const elapsed = now - start;
      /* Real progress, with a time-based floor that reaches 1 exactly at
         MAX_WAIT so the line never stalls on a slow device. */
      const real = isSceneWarmed() ? 1 : 0;
      const floor = easeOutCubic(Math.min(elapsed / MAX_WAIT, 1));
      const target = finishing ? 1 : Math.min(1, Math.max(real, floor));
      current = reduced ? target : current + (target - current) * (1 - Math.exp(-dt / FILL_TAU));
      fill.set(current);
      if (finishing && current > 0.995) {
        beginExit();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const finish = () => {
      if (finishing) return;
      finishing = true;
      settleTimer = setTimeout(beginExit, FILL_SETTLE_FALLBACK);
    };

    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      const remaining = Math.max(0, minShown - (performance.now() - start));
      minTimer = setTimeout(finish, remaining);
    };

    const check = () => {
      if (isSceneWarmed()) dismiss();
    };

    window.addEventListener("scene-warmed", check);
    check(); // the scene may already be warm (dev fast-refresh remount)
    const maxTimer = setTimeout(finish, Math.max(0, MAX_WAIT - (performance.now() - start)));

    return () => {
      window.removeEventListener("scene-warmed", check);
      cancelAnimationFrame(raf);
      clearTimeout(maxTimer);
      if (minTimer !== undefined) clearTimeout(minTimer);
      if (settleTimer !== undefined) clearTimeout(settleTimer);
    };
  }, [phase, reduced, fill]);

  /* Stretch phase: when the line has covered the viewport, hand over to the
     hero and let AnimatePresence run the wipe. */
  useEffect(() => {
    if (phase !== "stretch") return;
    const timer = setTimeout(() => {
      announceLoaderDone();
      setShown(false);
    }, STRETCH_S * 1000);
    return () => clearTimeout(timer);
  }, [phase]);

  const stretching = phase === "stretch";

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-obsidian-0"
          initial={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
          transition={reduced ? { duration: REDUCED_FADE_S } : { duration: WIPE_S, ease: EASE_HEAVY }}
        >
          <div role="status" aria-live="polite" className="sr-only">
            Loading
          </div>

          <motion.p
            className="select-none px-6 text-center font-display font-medium text-[28px] leading-none tracking-[-0.01em] text-ivory-100 lg:text-[36px]"
            initial={{ clipPath: "inset(0% 100% 0% 0%)", opacity: 1 }}
            animate={{
              clipPath: "inset(0% 0% 0% 0%)",
              opacity: stretching ? 0 : 1,
            }}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    clipPath: { duration: NAME_WIPE_S, ease: EASE_HEAVY, delay: NAME_DELAY_S },
                    opacity: { duration: NAME_FADE_S, ease: EASE_SETTLE },
                  }
            }
          >
            Preetham Nimmagadda
          </motion.p>

          {/* The track sits 24px beneath the name. It stretches from its centre
              to the viewport width on exit; the gold fill inside grows from the
              left with progress and is at 1 before the stretch begins. */}
          <motion.div
            aria-hidden
            className="mt-6 h-px w-60 bg-hairline"
            style={{ transformOrigin: "50% 50%" }}
            initial={{ scaleX: 1, opacity: 1 }}
            animate={{ scaleX: stretching ? stretchFactor : 1, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: LINE_FADE_S } }}
            transition={{ duration: STRETCH_S, ease: EASE_SETTLE }}
          >
            <motion.div className="h-full w-full origin-left bg-aurum-300" style={{ scaleX: fill }} />
          </motion.div>

          {/* The role, set beneath the rule the way a card carries a title
              under a name, so the positioning is on screen from the first
              frame. It leaves with the name, before the line stretches. */}
          <motion.p
            className="mt-5 select-none font-mono text-[11px] uppercase leading-none tracking-[0.32em] text-ivory-300"
            initial={{ opacity: 0, y: reduced ? 0 : 6 }}
            animate={{ opacity: stretching ? 0 : 1, y: 0 }}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    opacity: stretching
                      ? { duration: NAME_FADE_S, ease: EASE_SETTLE }
                      : { duration: 0.8, ease: EASE_SETTLE, delay: NAME_DELAY_S + NAME_WIPE_S * 0.6 },
                    y: { duration: 0.8, ease: EASE_SETTLE, delay: NAME_DELAY_S + NAME_WIPE_S * 0.6 },
                  }
            }
          >
            AI architect
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
