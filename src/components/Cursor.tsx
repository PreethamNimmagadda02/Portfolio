"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFollowPointer } from "@/hooks/use-follow-pointer";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useMediaQuery } from "@/lib/viewport-store";
import { cn } from "@/lib/utils";

/**
 * The cursor, on devices that have one.
 *
 * A gold point that sits exactly under the hand, so precision is never
 * traded for style, and a hairline ring that follows it with a little
 * weight. Over anything that acts, the ring opens; over an element that
 * names its action with data-cursor (a project row, a live site, a stage of
 * the loop) the ring becomes a small obsidian seal carrying that word.
 *
 * It stands down entirely on touch and pen, under reduced motion, in forced
 * colours, and over text fields, where the native I-beam is the honest
 * affordance. The native pointer is only hidden once this has actually drawn
 * itself, so a failed mount can never leave a page without a cursor.
 */

type Mode = "rest" | "act" | "label" | "text" | "away";

const INTERACTIVE = 'a[href], button, [role="button"], [role="tab"], [role="radio"], label, summary, select';
const TEXTUAL = 'input, textarea, [contenteditable="true"]';

export default function Cursor() {
  const reduced = useReducedMotion();
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)", false);
  const forced = useMediaQuery("(forced-colors: active)", false);
  const enabled = fine && !reduced && !forced;

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("away");
  const [label, setLabel] = useState("");
  const [pressed, setPressed] = useState(false);

  /* The point: no lag at all. */
  const writeDot = useCallback((x: number, y: number) => {
    const el = dotRef.current;
    if (el) el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }, []);
  useFollowPointer({ lerp: 1, enabled, write: writeDot });

  /* The ring: a weighted follow. */
  const writeRing = useCallback((x: number, y: number) => {
    const el = ringRef.current;
    if (el) el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }, []);
  useFollowPointer({ lerp: 0.2, enabled, write: writeRing });

  /* What is under the hand. pointerover fires only when the target changes,
     so this costs one closest() walk per element crossed, not per pixel. */
  useEffect(() => {
    if (!enabled) return;

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const target = e.target as Element | null;
      if (!target || !(target instanceof Element)) return;
      const named = target.closest<HTMLElement>("[data-cursor]");
      if (named?.dataset.cursor) {
        setLabel(named.dataset.cursor);
        setMode("label");
      } else if (target.closest(TEXTUAL)) {
        setMode("text");
      } else if (target.closest(INTERACTIVE)) {
        setMode("act");
      } else {
        setMode("rest");
      }
    };
    const onLeave = (e: PointerEvent) => {
      if (!e.relatedTarget) setMode("away");
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onLeave);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onLeave);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
    };
  }, [enabled]);

  /* Hide the native pointer only while this one is on screen. */
  const drawn = enabled && mode !== "away";
  useEffect(() => {
    if (!drawn) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");
    return () => root.classList.remove("has-cursor");
  }, [drawn]);

  if (!enabled) return null;

  const hidden = mode === "away" || mode === "text";

  return (
    <>
      <div ref={ringRef} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[10000] will-change-transform">
        <div
          className={cn(
            "flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border",
            "transition-[width,height,background-color,border-color,opacity,scale] duration-500 ease-heavy",
            mode === "label"
              ? "size-[5.5rem] border-aurum-300/70 bg-obsidian-0/88"
              : mode === "act"
                ? "size-14 border-aurum-200/80 bg-aurum-300/[0.06]"
                : "size-9 border-aurum-300/45 bg-transparent",
            hidden ? "opacity-0" : "opacity-100",
            pressed ? "scale-[0.86]" : "scale-100"
          )}
        >
          <span
            className={cn(
              "whitespace-nowrap font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-ivory-100 transition-opacity duration-300 ease-heavy",
              mode === "label" ? "opacity-100 delay-100" : "opacity-0"
            )}
          >
            {label}
          </span>
        </div>
      </div>

      <div ref={dotRef} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[10000] will-change-transform">
        <div
          className={cn(
            "size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-aurum-200 transition-[opacity,scale] duration-300 ease-heavy",
            hidden || mode === "label" ? "scale-50 opacity-0" : "scale-100 opacity-100"
          )}
        />
      </div>
    </>
  );
}
