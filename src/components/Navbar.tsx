"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { List } from "@phosphor-icons/react";
import { AnimatePresence, EASE_HEAVY, EASE_SETTLE, motion } from "@/lib/motion";
import { TextButton } from "@/components/ui/TextButton";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useMediaQuery } from "@/lib/viewport-store";
import { cn, smoothScrollTo } from "@/lib/utils";

/* The eight labels and hrefs are fixed by the brief. The contact section is
   measured for the active state but never carries a highlighted link. */
const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Experiences", href: "#experience" },
  { name: "Skills", href: "#skills-sphere" },
  { name: "Projects", href: "#projects" },
  { name: "Activity", href: "#github-stats" },
  { name: "Achievements", href: "#achievements" },
  { name: "Testimonials", href: "#testimonials" },
] as const;

const CONTACT_HREF = "#contact";
const CONTACT_LABEL = "Get in touch";
const MENU_ID = "mobile-menu";

/* Section ids measured for the active link, in page order. */
const SECTION_IDS = [...navLinks.map((l) => l.href.slice(1)), CONTACT_HREF.slice(1)];

/* The reading line: a band 38% down the viewport, expressed as a negative
   root margin. Sections are contiguous, so exactly one can cross it, and the
   highlight moves the instant a section's edge does. This replaces ranking
   sections by visible area, which favoured whichever section was tallest and
   changed late at every boundary. */
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

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const headerRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)", false);
  // Derived, never synced: crossing to the desktop layout closes the overlay.
  const menuOpen = isOpen && !isDesktop;

  /* Letterhead state: the bar is transparent over the hero and gains its
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

  /* Active section: whichever one is crossing the reading line.
     Sections arrive lazily, and a node can be replaced outright later (a hot
     reload, a remount), which silently drops it from the observer and leaves
     the highlight stuck on whatever was last set. So the mapping tracked is
     id to element, not id to "seen", and the MutationObserver stays alive to
     re-observe whenever the element behind an id changes. */
  useEffect(() => {
    const observed = new Map<string, Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
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

  /* The Get in touch link in the overlay is a plain anchor at 40px; the
     shared TextButton is sized for the bar. */
  const onOverlayContact = (e: MouseEvent<HTMLAnchorElement>) => goTo(e, CONTACT_HREF);

  const filled = scrolled && !menuOpen;

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
        {/* Full-screen menu, below lg. Sits under the bar so the letterhead
            name and the toggle stay visible and operable above it. */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id={MENU_ID}
              data-lenis-prevent
              className="fixed inset-0 z-0 overflow-y-auto bg-obsidian-0 lg:hidden"
              initial={reducedMotion ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
              animate={reducedMotion ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
              exit={reducedMotion ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
              transition={
                reducedMotion
                  ? { duration: 0.2, ease: "linear" }
                  : { duration: 0.7, ease: EASE_HEAVY }
              }
            >
              <div className="mx-auto flex min-h-full w-full max-w-[1280px] flex-col px-6 pb-12 pt-24 lg:px-10">
                <nav aria-label="Menu">
                  <ul className="flex flex-col gap-2">
                    {navLinks.map((link, i) => {
                      const id = link.href.slice(1);
                      const isActive = activeSection === id;
                      return (
                        <li key={link.href} className="line-mask">
                          <motion.a
                            href={link.href}
                            onClick={(e) => goTo(e, link.href)}
                            aria-current={isActive ? "location" : undefined}
                            className="inline-block font-display text-[40px] leading-[1.1] text-ivory-100 transition-colors duration-250 ease-heavy hover:text-aurum-200"
                            initial={reducedMotion ? false : { y: "110%" }}
                            animate={{ y: 0 }}
                            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: "20%" }}
                            transition={
                              reducedMotion
                                ? { duration: 0.2 }
                                : { duration: 0.7, ease: EASE_SETTLE, delay: 0.2 + i * 0.06 }
                            }
                          >
                            {link.name}
                          </motion.a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="mt-6 border-t border-hairline pt-6">
                  <span className="line-mask">
                    <motion.a
                      href={CONTACT_HREF}
                      onClick={onOverlayContact}
                      className="inline-block font-display text-[40px] leading-[1.1] text-aurum-300 transition-colors duration-250 ease-heavy hover:text-aurum-200"
                      initial={reducedMotion ? false : { y: "110%" }}
                      animate={{ y: 0 }}
                      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: "20%" }}
                      transition={
                        reducedMotion
                          ? { duration: 0.2 }
                          : { duration: 0.7, ease: EASE_SETTLE, delay: 0.2 + navLinks.length * 0.06 }
                      }
                    >
                      {CONTACT_LABEL}
                    </motion.a>
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The 64px letterhead bar, aligned to the page columns. */}
        <div className="relative z-10 mx-auto flex h-16 w-full max-w-[1280px] flex-nowrap items-center justify-between px-6 lg:px-10">
          <a
            href="#home"
            onClick={(e) => goTo(e, "#home")}
            className="foil shrink-0 whitespace-nowrap font-display font-medium text-[22px] leading-none"
          >
            Preetham Nimmagadda
          </a>

          {/* Desktop: eight labels, then the contact link. The link gap tightens
              to 20px at lg so the row holds one line at 1024px with clear air
              between the letterhead and Home; 28px from xl. */}
          <div className="hidden lg:flex lg:items-center lg:gap-8 xl:gap-10">
            <nav aria-label="Primary">
              <ul className="flex flex-nowrap items-center gap-5 xl:gap-7">
                {navLinks.map((link) => {
                  const id = link.href.slice(1);
                  const isActive = activeSection === id;
                  return (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        onClick={(e) => goTo(e, link.href)}
                        aria-current={isActive ? "location" : undefined}
                        className={cn(
                          "relative block whitespace-nowrap py-3 font-sans text-[13px] leading-none tracking-[-0.01em] transition-colors duration-250 ease-heavy hover:text-ivory-100",
                          isActive ? "text-ivory-100" : "text-ivory-200"
                        )}
                      >
                        {link.name}
                        {isActive && (
                          <motion.span
                            layoutId="activeNav"
                            aria-hidden
                            className="absolute inset-x-0 bottom-[5px] h-px bg-aurum-300"
                            transition={{ duration: 0.5, ease: EASE_HEAVY }}
                          />
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <TextButton
              variant="secondary"
              href={CONTACT_HREF}
              className="text-[13px] tracking-[-0.01em] text-aurum-300 hover:text-aurum-200"
            >
              {CONTACT_LABEL}
            </TextButton>
          </div>

          {/* Below lg: the List glyph. Its top and bottom lines are real 1px
              bars laid exactly over the icon strokes; on open the icon fades
              and the two bars swing into an X. Transform and opacity only. */}
          <button
            ref={toggleRef}
            type="button"
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls={MENU_ID}
            className="relative -mr-2 flex h-11 w-11 shrink-0 items-center justify-center text-ivory-100 lg:hidden"
          >
            <span className="relative block h-6 w-6" aria-hidden>
              <List
                weight="light"
                size={24}
                className={cn(
                  "absolute inset-0 transition-opacity duration-150 ease-heavy",
                  menuOpen ? "opacity-0" : "opacity-100"
                )}
              />
              <span
                className={cn(
                  "absolute left-[3.75px] top-[5.5px] h-px w-[16.5px] bg-current transition-transform duration-400 ease-heavy",
                  menuOpen ? "translate-y-1.5 rotate-45" : "translate-y-0 rotate-0"
                )}
              />
              <span
                className={cn(
                  "absolute left-[3.75px] top-[17.5px] h-px w-[16.5px] bg-current transition-transform duration-400 ease-heavy",
                  menuOpen ? "-translate-y-1.5 -rotate-45" : "translate-y-0 rotate-0"
                )}
              />
            </span>
          </button>
        </div>
      </header>
    </>
  );
}
