"use client";

import { useSheen } from "@/hooks/use-sheen";
import { cn } from "@/lib/utils";

export interface PortraitPlateProps {
  className?: string;
}

/* Width descriptors, not density ones: with "1x, 2x" a standard display got
   the 240px copy for a plate up to 480px wide, stretched to fill it. Now the
   browser picks by the plate's real width times the screen's density. The set
   is cut from the master by scripts/brand/headshot.mjs. */
const SOURCES = "/ai-headshot-sm.webp 240w, /ai-headshot-md.webp 480w, /ai-headshot.webp 864w";
/* Mirrors the figure's width classes below: 480px from lg, 420px from md,
   and on phones min(40vw, 20vh), approximated by its usual 40vw bound. */
const SIZES = "(min-width: 1024px) 480px, (min-width: 768px) 420px, 40vw";
const FALLBACK = "/ai-headshot.jpeg";
// The enclosing figure already announces that this is a portrait, so the alt
// carries the name alone rather than repeating it.
const ALT = "Preetham Nimmagadda";

/**
 * The hero portrait as a two-layer photogravure plate.
 *
 * The lower picture is the LCP image and carries the static warm monochrome
 * grade (.plate-mono). The upper picture is the untouched colour image at
 * opacity 0; hovering or focusing the figure (the group) lifts it to full
 * colour over 900ms and it drains back on leave. Opacity is the only thing
 * that ever animates, so the filter on the LCP image is painted once.
 *
 * Sizing: a 4:5 plate filling its column from md up (420px on tablet, 480px
 * at most). Below md it is a 3:4 plate at 40vw, right-aligned, whose width is
 * also bounded by a height cap (20vh, 16vh when the viewport is 700px tall or
 * less) so the three-line headline and both calls to action still fit the
 * first screen, and the frame keeps its ratio when the cap wins.
 *
 * A second, quieter layer sits on top: a gold raking light that follows the
 * cursor across the plate (`.sheen` plus useSheen), so the frame reads as a
 * physical object catching a light source rather than a flat crop.
 *
 * Owners who want the image to rest in colour can set
 * --portrait-rest-color: 1 on any ancestor.
 */
export function PortraitPlate({ className }: PortraitPlateProps) {
  const sheen = useSheen();

  return (
    <figure
      {...sheen}
      tabIndex={0}
      aria-label="Portrait of Preetham Nimmagadda"
      className={cn(
        "group sheen relative block overflow-hidden",
        "ml-auto aspect-[3/4] w-[min(40vw,20vh)]",
        "[@media(max-height:700px)_and_(max-width:767px)]:w-[min(34vw,16vh)]",
        "md:aspect-[4/5] md:w-full md:max-w-[420px] lg:ml-auto lg:max-w-[480px]",
        className
      )}
    >
      {/* Resting layer: the photogravure grade. This is the LCP element. */}
      <picture className="absolute inset-0 block">
        <source srcSet={SOURCES} sizes={SIZES} type="image/webp" />
        <img
          src={FALLBACK}
          alt={ALT}
          className="plate-mono block h-full w-full object-cover"
          width={864}
          height={1184}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </picture>

      {/* Colour layer: same decoded source, lifted on hover or focus. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 [opacity:var(--portrait-rest-color,0)]",
          "transition-opacity duration-[900ms] ease-[var(--ease-heavy)]",
          "group-hover:opacity-100 group-focus-within:opacity-100"
        )}
      >
        <picture className="absolute inset-0 block">
          <source srcSet={SOURCES} sizes={SIZES} type="image/webp" />
          <img
            src={FALLBACK}
            alt=""
            className="block h-full w-full object-cover"
            width={864}
            height={1184}
            decoding="async"
          />
        </picture>
      </div>

      {/* Bottom scrim so the gold light behind the plate never fights the face. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 55%, color-mix(in srgb, var(--color-obsidian-0) 55%, transparent))",
        }}
      />

      {/* Double bezel: outer frame at the edge, inner frame inset 12px. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 border border-hairline" />
      <span aria-hidden className="pointer-events-none absolute inset-3 border border-hairline" />
    </figure>
  );
}

export default PortraitPlate;
