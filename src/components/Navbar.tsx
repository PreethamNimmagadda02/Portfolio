"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { AnimatePresence, EASE_HEAVY, EASE_SETTLE, motion } from "@/lib/motion";
import { TextButton } from "@/components/ui/TextButton";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { CHAPTERS, CHAPTER_COUNT, type Chapter } from "@/lib/chapters";
import { cn, smoothScrollTo } from "@/lib/utils";

/* The letterhead carries three things: the name, the chapter the reader is
   in, and the way out to everything else (the Index). Eight links in a row
   made the bar read as a template; the Index overlay holds all nine chapters
   instead, numbered the way the sections number themselves. */

const CONTACT_HREF = "#contact";
const CONTACT_LABEL = "Get in touch";
const MENU_ID = "site-index";
const EMAIL = "preethamnimmagadda@gmail.com";

const ELSEWHERE = [
  { label: "GitHub", href: "https://github.com/PreethamNimmagadda02" },
  { label: "LinkedIn", href: "https://linkedin.com/in/preethamnimmagadda" },
] as const;

/* Section ids measured for the active chapter, in page order. */
const SECTION_IDS = CHAPTERS.map((c) => c.id);

/* The reading line: a band 38% down the viewport, expressed as a negative
   root margin. Sections are contiguous, so exactly one can cross it, and the
   indicator moves the instant a section's edge does. */
const READING_LINE = "-38% 0px -61% 0px";

type LenisLike = { stop: () => void; start: () => void };

function getLenis(): LenisLike | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { lenis?: LenisLike }).lenis;
}

/* Scroll lock is idempotent so a link click can release it synchronously
   (Lenis ignores scrollTo while stopped) and the effect cleanup can release
   it again without side effects. */
let lockedOverflow: string | null = null;

function lockScroll() {
  if (lockedOverflow !== null) return;
  lockedOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  getLenis()?.stop();
}

function unlockScroll() {
  if (lockedOverflow === null) return;
  document.body.style.overflow = lockedOverflow;
  lockedOverflow = null;
  getLenis()?.start();
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function visibleFocusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0
  );
}

/* ------------------------------------------------------------------------
   Chapter indicator: the running head of the bar
   ------------------------------------------------------------------------ */

/**
 * The chapter the reader is in, set like a book's running head: numeral,
 * gold rule, name, folio. A change rolls the old line up out of its mask
 * and the new one in beneath it. Decorative, since every section announces
 * itself with its own heading; hidden on the cover, where there is nothing
 * to orient against yet.
 */
function ChapterIndicator({ chapter, visible, reduced }: { chapter: Chapter; visible: boolean; reduced: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-1/2 top-1/2 hidden w-[17rem] -translate-x-1/2 -translate-y-1/2 justify-center md:flex",
        "transition-opacity duration-500 ease-heavy",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="relative h-4 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={chapter.id}
            className="flex items-center gap-3 whitespace-nowrap font-mono text-[11px] uppercase leading-4 tracking-[0.14em]"
            initial={reduced ? { opacity: 0 } : { y: "100%" }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: "-100%" }}
            transition={reduced ? { duration: 0.2 } : { duration: 0.6, ease: EASE_HEAVY }}
          >
            <span className="ledger text-aurum-300">{chapter.no}</span>
            <span className="h-px w-5 bg-hairline-gold" />
            <span className="text-ivory-200">{chapter.label}</span>
            <span className="ledger text-ivory-300">
              <span className="pr-1.5 text-ivory-300/60">/</span>
              {CHAPTER_COUNT}
            </span>
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------
   Index overlay
   ------------------------------------------------------------------------ */

const RISE = (reduced: boolean, delay: number) =>
  reduced ? { duration: 0.2 } : { duration: 0.75, ease: EASE_SETTLE, delay };

/* Leaving is quick and undelayed: the panel's own wipe carries the exit, and
   AnimatePresence holds the overlay until every child has finished, so an
   inherited entrance delay would keep a closed Index on screen. */
const EXIT = { duration: 0.2, delay: 0 } as const;

function IndexOverlay({
  activeSection,
  reduced,
  onNavigate,
}: {
  activeSection: string;
  reduced: boolean;
  onNavigate: (e: MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  return (
    <motion.div
      id={MENU_ID}
      data-lenis-prevent
      className="fixed inset-0 z-0 overflow-y-auto bg-obsidian-0"
      initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
      animate={reduced ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
      exit={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
      transition={reduced ? { duration: 0.2, ease: "linear" } : { duration: 0.8, ease: EASE_HEAVY }}
    >
      {/* Paper grain, so the panel is the same stock as the page beneath it. */}
      <div className="grain" aria-hidden />

      <div className="relative mx-auto flex min-h-full w-full max-w-[1280px] flex-col px-6 pb-10 pt-24 lg:px-10 lg:pt-28">
        <div className="grid flex-1 grid-cols-12 gap-x-6 lg:gap-x-10">
          <nav aria-label="Index" className="col-span-12 lg:col-span-8">
            <p className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase leading-none tracking-[0.18em] text-ivory-300">
              Index
              <span aria-hidden className="h-px w-6 bg-hairline-gold" />
              <span className="ledger">{CHAPTERS.length} chapters</span>
            </p>

            <ol className="border-b border-hairline">
              {CHAPTERS.map((c, i) => {
                const isActive = activeSection === c.id;
                return (
                  <li key={c.id} className="border-t border-hairline">
                    <a
                      href={`#${c.id}`}
                      onClick={(e) => onNavigate(e, `#${c.id}`)}
                      aria-current={isActive ? "location" : undefined}
                      className="group grid grid-cols-12 items-center gap-x-4 py-2.5 lg:py-3"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "ledger col-span-2 flex items-center gap-2 font-mono text-[11px] leading-none tracking-[0.14em] transition-colors duration-300 ease-heavy sm:col-span-1",
                          isActive ? "text-aurum-300" : "text-ivory-300 group-hover:text-aurum-300"
                        )}
                      >
                        {c.no}
                      </span>

                      <span className="line-mask col-span-10 sm:col-span-7" style={{ paddingBottom: "0.14em", marginBottom: "-0.14em" }}>
                        <motion.span
                          className={cn(
                            "inline-flex items-center gap-4 font-display text-[1.75rem] leading-[1.12] transition-[color,translate] duration-400 ease-heavy group-hover:translate-x-2 sm:text-[clamp(1.75rem,3.2vw,2.75rem)]",
                            isActive ? "text-aurum-200" : "text-ivory-100 group-hover:text-aurum-200"
                          )}
                          initial={reduced ? false : { y: "115%" }}
                          animate={{ y: 0 }}
                          exit={{ opacity: 0, transition: EXIT }}
                          transition={RISE(reduced, 0.22 + i * 0.045)}
                        >
                          {c.label}
                          {isActive ? <span aria-hidden className="size-1.5 rotate-45 bg-aurum-300" /> : null}
                        </motion.span>
                      </span>

                      <span
                        aria-hidden
                        className="hidden text-right caption text-ivory-300 transition-colors duration-300 ease-heavy group-hover:text-ivory-200 sm:col-span-4 sm:block"
                      >
                        {c.note}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>

          <motion.aside
            className="col-span-12 mt-12 flex flex-col gap-9 lg:col-span-3 lg:col-start-10 lg:mt-[2.3rem]"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: EXIT }}
            transition={RISE(reduced, 0.55)}
          >
            <div className="border-t border-hairline pt-5">
              <p className="mb-4 caption text-ivory-300">
                Correspondence
              </p>
              <a
                href={`mailto:${EMAIL}`}
                className="rule-hover break-all font-sans text-[15px] leading-[1.5] text-ivory-100 transition-colors duration-300 ease-heavy hover:text-aurum-200"
              >
                {EMAIL}
              </a>
            </div>

            <div className="border-t border-hairline pt-5">
              <p className="mb-4 caption text-ivory-300">
                Elsewhere
              </p>
              <ul className="flex flex-col gap-3 leading-none">
                {ELSEWHERE.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rule-hover font-sans text-[15px] text-ivory-200 transition-colors duration-300 ease-heavy hover:text-ivory-100"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-hairline pt-5">
              <p className="mb-5 flex items-center gap-3 caption text-ivory-200">
                <span aria-hidden className="size-1.5 rotate-45 bg-aurum-300" />
                Taking on new work
              </p>
              <a
                href={CONTACT_HREF}
                onClick={(e) => onNavigate(e, CONTACT_HREF)}
                className="inline-flex items-center gap-3 border border-aurum-300 px-6 py-3.5 font-sans text-[15px] font-medium leading-none text-ivory-100 transition-colors duration-300 ease-heavy hover:bg-aurum-300 hover:text-obsidian-0"
              >
                {CONTACT_LABEL}
              </a>
            </div>
          </motion.aside>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------------
   Letterhead
   ------------------------------------------------------------------------ */

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const headerRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const reducedMotion = useReducedMotion();
  const menuOpen = isOpen;

  /* Letterhead state: the bar is transparent over the cover and gains its
     fill once a 1px sentinel 80px into the document leaves the viewport. */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry) setScrolled(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  /* Active chapter: whichever section is crossing the reading line.
     Sections arrive lazily, and a node can be replaced outright later (a hot
     reload, a remount), which silently drops it from the observer and leaves
     the indicator stuck on whatever was last set. So the mapping tracked is
     id to element, not id to "seen", and the MutationObserver stays alive to
     re-observe whenever the element behind an id changes. */
  useEffect(() => {
    const observed = new Map<string, Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // The colophon reads as part of the last chapter, so a jump
          // straight to the foot of the page still lands on Contact.
          if (entry.isIntersecting) setActiveSection(entry.target.id || "contact");
        }
      },
      { rootMargin: READING_LINE, threshold: 0 }
    );

    const attach = () => {
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el || observed.get(id) === el) continue;
        const previous = observed.get(id);
        if (previous) io.unobserve(previous);
        observed.set(id, el);
        io.observe(el);
      }
      const footer = document.querySelector("footer");
      if (footer && observed.get("footer") !== footer) {
        const previous = observed.get("footer");
        if (previous) io.unobserve(previous);
        observed.set("footer", footer);
        io.observe(footer);
      }
    };

    attach();

    // Coalesced to one re-scan per frame: subtree mutations are frequent while
    // the page animates, and a re-scan is nine id lookups.
    let queued = false;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        attach();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  /* Overlay open: lock scroll, move focus in, trap Tab, close on Escape. */
  useEffect(() => {
    if (!menuOpen) return;
    lockScroll();

    const raf = requestAnimationFrame(() => {
      const menu = document.getElementById(MENU_ID);
      const first = menu ? visibleFocusables(menu)[0] : undefined;
      first?.focus();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const root = headerRef.current;
      if (!root) return;
      const focusables = visibleFocusables(root);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement as HTMLElement | null;
      const inside = current ? root.contains(current) : false;
      if (e.shiftKey) {
        if (!inside || current === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (!inside || current === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
      unlockScroll();
    };
  }, [menuOpen]);

  const goTo = useCallback((e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    // Release the lock before scrolling: Lenis drops scrollTo while stopped.
    unlockScroll();
    setIsOpen(false);
    smoothScrollTo(href);
  }, []);

  const toggleMenu = () => setIsOpen((open) => !open);

  const filled = scrolled && !menuOpen;
  const current = CHAPTERS.find((c) => c.id === activeSection) ?? CHAPTERS[0];

  return (
    <>
      {/* Position sentinel, 80px into the document. Absolute against the
          initial containing block, so it never moves with the fixed bar. */}
      <div
        ref={sentinelRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-20 h-px w-px"
      />

      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-350 ease-heavy",
          filled
            ? "border-hairline bg-obsidian-1/92 backdrop-blur-[12px]"
            : "border-transparent bg-transparent"
        )}
      >
        {/* The Index sits under the bar so the letterhead name and the toggle
            stay visible and operable above it. */}
        <AnimatePresence>
          {menuOpen && <IndexOverlay activeSection={activeSection} reduced={reducedMotion} onNavigate={goTo} />}
        </AnimatePresence>

        {/* The 64px letterhead bar, aligned to the page columns. */}
        <div className="relative z-10 mx-auto flex h-16 w-full max-w-[1280px] flex-nowrap items-center justify-between px-6 lg:px-10">
          <a
            href="#home"
            onClick={(e) => goTo(e, "#home")}
            className="foil shrink-0 whitespace-nowrap font-display font-medium text-[20px] leading-none sm:text-[22px]"
          >
            Preetham Nimmagadda
          </a>

          <ChapterIndicator
            chapter={current}
            visible={!menuOpen && current.id !== "home"}
            reduced={reducedMotion}
          />

          <div className="flex items-center gap-6 lg:gap-8">
            <TextButton
              variant="secondary"
              href={CONTACT_HREF}
              className={cn(
                "hidden text-[13px] tracking-[-0.01em] text-aurum-300 transition-opacity duration-300 hover:text-aurum-200 sm:inline-flex",
                menuOpen && "pointer-events-none opacity-0"
              )}
            >
              {CONTACT_LABEL}
            </TextButton>

            {/* Index toggle. The label rolls between Index and Close; the two
                bars beside it swing into an X. Transform and opacity only. */}
            <button
              ref={toggleRef}
              type="button"
              onClick={toggleMenu}
              aria-label={menuOpen ? "Close index" : "Open index"}
              aria-expanded={menuOpen}
              aria-controls={MENU_ID}
              className="group relative -mr-2 flex h-11 shrink-0 items-center gap-3 px-2 text-ivory-100"
            >
              <span aria-hidden className="relative block h-[14px] w-[2.6rem] overflow-hidden text-right font-sans text-[13px] leading-[14px] tracking-[-0.01em]">
                <span
                  className={cn(
                    "absolute inset-x-0 top-0 transition-transform duration-500 ease-heavy",
                    menuOpen ? "-translate-y-full" : "translate-y-0"
                  )}
                >
                  Index
                </span>
                <span
                  className={cn(
                    "absolute inset-x-0 top-0 transition-transform duration-500 ease-heavy",
                    menuOpen ? "translate-y-0" : "translate-y-full"
                  )}
                >
                  Close
                </span>
              </span>
              <span aria-hidden className="relative block h-3 w-5">
                <span
                  className={cn(
                    "absolute right-0 top-[3px] h-px bg-current transition-[translate,rotate,width] duration-400 ease-heavy",
                    menuOpen ? "w-5 translate-y-[2.5px] rotate-45" : "w-5 group-hover:w-3.5"
                  )}
                />
                <span
                  className={cn(
                    "absolute right-0 top-[8px] h-px w-5 bg-current transition-transform duration-400 ease-heavy",
                    menuOpen ? "-translate-y-[2.5px] -rotate-45" : "translate-y-0 rotate-0"
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
