"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, EASE_HEAVY, EASE_SETTLE } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { seededRandom } from "@/lib/utils";

/* Secret: type "P" then "N" anywhere on the page. */
const KONAMI_CODE = ["KeyP", "KeyN"];

/* Auto-dismiss after this long; a click or Escape closes sooner. */
const AUTO_CLOSE_MS = 8000;
const EXIT_MS = 1200;

/* Glyph rain characters (latin, katakana, digits). */
const MATRIX_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソ0123456789@#$%&*";

/* The only tones on the page: gold ramp and ivory, via their CSS variables. */
const TONES = [
  "var(--color-aurum-300)",
  "var(--color-aurum-100)",
  "var(--color-ivory-100)",
  "var(--color-aurum-200)",
  "var(--color-aurum-500)",
];

/* The three generators below run inside lazy useState initialisers, which
   also execute during prerender, so they draw from a seeded generator and
   produce identical output on the server and the client. */
function makeParticles(count: number) {
  const rand = seededRandom(11);
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const r = 0.6 + rand() * 0.4;
    return {
      id: i,
      dx: Math.cos(angle) * r,
      dy: Math.sin(angle) * r,
      size: 1 + rand() * 2,
      speed: 0.6 + rand() * 1.2,
      delay: rand() * 0.4,
      color: TONES[i % TONES.length],
    };
  });
}

function makeMatrixColumns(count: number) {
  const rand = seededRandom(23);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (i / count) * 100,
    speed: 2 + rand() * 4,
    delay: rand() * 2,
    chars: Array.from({ length: 8 + Math.floor(rand() * 12) }, () => MATRIX_CHARS[Math.floor(rand() * MATRIX_CHARS.length)]),
    fontSize: 10 + rand() * 6,
    opacity: 0.15 + rand() * 0.35,
  }));
}

function makeOrbitals(count: number) {
  const rand = seededRandom(37);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    offset: (i / count) * 360,
    radiusX: 60 + rand() * 14,
    radiusY: 60 + rand() * 14,
    size: 2 + rand() * 2,
    duration: 2.4 + rand() * 1.6,
    color: TONES[i % TONES.length],
  }));
}

/* Deterministic jitter table for the typewriter glitch: the same offsets on
   every render instead of Math.random() at render time. */
const JITTER = (() => {
  const rand = seededRandom(53);
  return Array.from({ length: 64 }, () => ({
    x: rand() * 4 - 2,
    y: rand() * 3 - 1.5,
  }));
})();

/* One column of falling glyphs: ivory leader, gold tail fading down. */
function MatrixColumn({
  x,
  speed,
  delay,
  chars,
  fontSize,
  opacity,
}: {
  x: number;
  speed: number;
  delay: number;
  chars: string[];
  fontSize: number;
  opacity: number;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute top-0 flex flex-col items-center font-mono ledger"
      style={{ left: `${x}%`, fontSize: `${fontSize}px` }}
      initial={{ y: "-100%", opacity: 0 }}
      animate={{ y: "120vh", opacity: [0, opacity, opacity, 0] }}
      transition={{
        duration: speed,
        delay: 0.8 + delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {chars.map((char, i) => (
        <span
          key={i}
          className={i === 0 ? "leading-tight text-ivory-100" : "leading-tight text-aurum-300"}
          style={i === 0 ? undefined : { opacity: Math.max(0.2, 1 - i * 0.06) }}
        >
          {char}
        </span>
      ))}
    </motion.div>
  );
}

/* A square mote orbiting the PN plate. */
function OrbitalParticle({
  offset,
  radiusX,
  radiusY,
  size,
  duration,
  color,
}: {
  offset: number;
  radiusX: number;
  radiusY: number;
  size: number;
  duration: number;
  color: string;
}) {
  const at = (deg: number) => ((offset + deg) * Math.PI) / 180;
  return (
    <motion.div
      className="absolute"
      style={{
        width: size,
        height: size,
        background: color,
        left: "50%",
        top: "50%",
      }}
      animate={{
        x: [0, 90, 180, 270, 360].map((d) => Math.cos(at(d)) * radiusX),
        y: [0, 90, 180, 270, 360].map((d) => Math.sin(at(d)) * radiusY),
        opacity: [0.4, 1, 0.4, 1, 0.4],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
        delay: 0.5,
      }}
    />
  );
}

/* Typewriter with a one-frame glitch on the newest character. */
function TypewriterText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [glitchIndex, setGlitchIndex] = useState(-1);

  useEffect(() => {
    let i = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const glitchTimers: ReturnType<typeof setTimeout>[] = [];

    const delayTimer = setTimeout(() => {
      intervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          setGlitchIndex(i);
          glitchTimers.push(setTimeout(() => setGlitchIndex(-1), 80));
          i++;
        } else if (intervalId !== undefined) {
          clearInterval(intervalId);
        }
      }, 70);
    }, delay * 1000);

    return () => {
      clearTimeout(delayTimer);
      if (intervalId !== undefined) clearInterval(intervalId);
      glitchTimers.forEach(clearTimeout);
    };
  }, [text, delay]);

  return (
    <span className={className}>
      {displayed.split("").map((char, i) => {
        const j = JITTER[i % JITTER.length];
        const glitching = i === glitchIndex;
        return (
          <span
            key={i}
            className="inline-block transition-[transform,opacity] duration-50"
            style={{
              transform: glitching ? `translate(${j.x}px, ${j.y}px)` : "none",
              opacity: glitching ? 0.7 : 1,
            }}
          >
            {char === " " ? " " : char}
          </span>
        );
      })}
      <motion.span
        aria-hidden
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse" }}
        className="ml-1 inline-block h-[0.85em] w-px bg-aurum-300 align-middle"
      />
    </span>
  );
}

/* "Access granted" with a brief flicker as it lands. */
function AccessGrantedBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{
        opacity: [0, 1, 0.3, 1, 0.6, 1],
        scaleX: [0, 1, 1, 1, 1, 1],
      }}
      transition={{ duration: 0.8, delay: 2.5, ease: "easeOut" }}
      className="mt-4 border border-aurum-300/50 px-6 py-1.5"
    >
      <span className="font-mono text-xs tracking-[0.18em] text-aurum-300 sm:text-sm">Access granted</span>
    </motion.div>
  );
}

/**
 * Hidden "PN" sequence: an obsidian screen with gold glyph rain, warp
 * streaks, expanding square frames, and the PN plate. Click, Escape, or
 * eight seconds closes it. Under reduced motion only the centred content
 * appears, with opacity fades.
 */
export default function KonamiEasterEgg() {
  const reduced = useReducedMotion();
  const [triggered, setTriggered] = useState(false);
  const [sequence, setSequence] = useState<string[]>([]);
  const [isExiting, setIsExiting] = useState(false);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [particles] = useState(() => makeParticles(30));
  const [matrixColumns] = useState(() => makeMatrixColumns(24));
  const [orbitals] = useState(() => makeOrbitals(6));

  const close = useCallback(() => {
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    setIsExiting(true);
    exitRef.current = setTimeout(() => {
      setTriggered(false);
      setIsExiting(false);
    }, EXIT_MS);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (triggered) {
        if (e.code === "Escape" && !isExiting) close();
        return;
      }

      const newSequence = [...sequence, e.code].slice(-KONAMI_CODE.length);
      setSequence(newSequence);

      if (newSequence.length === KONAMI_CODE.length && newSequence.every((key, i) => key === KONAMI_CODE[i])) {
        setTriggered(true);
        setSequence([]);
        autoCloseRef.current = setTimeout(close, AUTO_CLOSE_MS);
      }
    },
    [sequence, triggered, isExiting, close]
  );

  const handleClick = useCallback(() => {
    if (isExiting) return;
    close();
  }, [isExiting, close]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  /* Clear pending timers on unmount. */
  useEffect(() => {
    return () => {
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
      if (exitRef.current) clearTimeout(exitRef.current);
    };
  }, []);

  const showEffects = !reduced;

  return (
    <AnimatePresence>
      {triggered && (
        <motion.div
          key="easter"
          role="dialog"
          aria-modal="true"
          aria-label="Easter egg. Press anywhere or Escape to exit."
          initial={{ opacity: 0 }}
          animate={isExiting ? { opacity: 0, scale: reduced ? 1 : 0.3 } : { opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={isExiting ? { duration: 1, ease: EASE_HEAVY } : { duration: 1, ease: EASE_SETTLE }}
          className="fixed inset-0 z-9998 cursor-pointer overflow-hidden"
          onClick={handleClick}
        >
          {/* Ground */}
          <div className="absolute inset-0 bg-obsidian-0" />

          {/* Scanlines, 3%: a faint CRT texture in ivory. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-50 opacity-[0.03]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, color-mix(in srgb, var(--color-ivory-100) 10%, transparent) 2px, color-mix(in srgb, var(--color-ivory-100) 10%, transparent) 4px)",
              backgroundSize: "100% 4px",
            }}
          />

          {showEffects && (
            <>
              {/* Glyph rain */}
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                {matrixColumns.map((col) => (
                  <MatrixColumn key={col.id} {...col} />
                ))}
              </div>

              {/* Warp streaks bursting from the centre */}
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  aria-hidden
                  className="absolute"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: p.size,
                    height: p.size,
                    background: p.color,
                    willChange: "transform, opacity",
                  }}
                  initial={{ x: 0, y: 0, scaleX: 1, opacity: 0 }}
                  animate={
                    isExiting
                      ? { x: 0, y: 0, scaleX: 1, opacity: 0 }
                      : {
                          x: `${p.dx * 100}vw`,
                          y: `${p.dy * 100}vh`,
                          scaleX: [1, 30, 50],
                          opacity: [0, 1, 0.8, 0],
                        }
                  }
                  transition={
                    isExiting
                      ? { duration: 0.8, ease: EASE_HEAVY }
                      : { duration: p.speed, delay: p.delay, ease: EASE_SETTLE }
                  }
                />
              ))}

              {/* Shockwave: three square frames, staggered */}
              {[
                { delay: 0.15, tone: "border-aurum-300/50", duration: 1.6 },
                { delay: 0.35, tone: "border-aurum-200/40", duration: 1.8 },
                { delay: 0.55, tone: "border-ivory-100/20", duration: 2.0 },
              ].map((ring, i) => (
                <motion.div
                  key={`ring-${i}`}
                  aria-hidden
                  className={`absolute top-1/2 left-1/2 border ${ring.tone}`}
                  style={{ width: "160vmax", height: "160vmax", x: "-50%", y: "-50%" }}
                  initial={{ scale: 0, opacity: 0.9 }}
                  animate={isExiting ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 0 }}
                  transition={{ duration: ring.duration, delay: ring.delay, ease: EASE_SETTLE }}
                />
              ))}
            </>
          )}

          {/* Centre: plate, headline, subtitle, rule, badge, hint */}
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={isExiting ? { opacity: 0, scale: reduced ? 1 : 0 } : { opacity: [0, 1, 1, 1], scale: 1 }}
            transition={isExiting ? { duration: 0.8, ease: EASE_HEAVY } : { duration: 8, times: [0, 0.08, 0.9, 1] }}
          >
            <div className="flex flex-col items-center gap-6 px-6">
              <motion.div
                initial={{ scale: reduced ? 1 : 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.3, ease: EASE_SETTLE }}
              >
                <div className="relative">
                  {showEffects && orbitals.map((orb) => <OrbitalParticle key={orb.id} {...orb} />)}

                  {/* The PN plate: a square, hairline frame at inset 0, gold frame inside. */}
                  <div className="relative flex size-24 items-center justify-center border border-hairline-strong">
                    <div className="absolute inset-1.5 border border-aurum-300" aria-hidden />
                    <span className="relative font-display font-normal text-[30px] leading-none tracking-[-0.01em] text-ivory-100">
                      PN
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="text-center font-display font-normal text-4xl leading-tight text-ivory-100 sm:text-5xl md:text-7xl"
                initial={{ opacity: 0, y: reduced ? 0 : 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8, ease: EASE_SETTLE }}
              >
                <TypewriterText text="Welcome to the Matrix" delay={0.7} />
              </motion.div>

              <motion.p
                className="font-mono text-sm tracking-[0.18em] text-ivory-300 sm:text-base"
                initial={{ opacity: 0, y: reduced ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.6, ease: EASE_SETTLE }}
              >
                You cracked the code, legend.
              </motion.p>

              <motion.div
                aria-hidden
                className="h-px w-32 origin-center bg-hairline-gold"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 2, duration: 0.8, ease: EASE_HEAVY }}
              />

              <AccessGrantedBadge />

              <motion.p
                className="mt-6 font-mono text-xs tracking-[0.18em] text-ivory-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: reduced ? 0.7 : [0, 0.7, 0.4, 0.7] }}
                transition={
                  reduced ? { delay: 3, duration: 0.2 } : { delay: 3, duration: 2, repeat: Infinity, ease: "easeInOut" }
                }
              >
                Press anywhere to exit
              </motion.p>
            </div>
          </motion.div>

          {/* Vignette: the same obsidian frame darkening the scene uses. */}
          <div className="cosmic-vignette z-20" aria-hidden />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
