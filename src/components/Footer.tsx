"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { ArrowUp, EnvelopeSimple, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";
import { motion, EASE_SETTLE } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn, smoothScrollTo } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Experience", id: "experience" },
  { label: "Projects", id: "projects" },
  { label: "Achievements", id: "achievements" },
  // One label per intent: contact is "Get in touch" in the hero, the nav and
  // here, never "Contact" in one place and something else in another.
  { label: "Get in touch", id: "contact" },
] as const;

const CONNECT_LINKS = [
  { label: "GitHub", href: "https://github.com/PreethamNimmagadda02", Icon: GithubLogo, external: true },
  { label: "LinkedIn", href: "https://linkedin.com/in/preethamnimmagadda", Icon: LinkedinLogo, external: true },
  { label: "Email", href: "mailto:preethamnimmagadda@gmail.com", Icon: EnvelopeSimple, external: false },
] as const;

/* Every footer link: Geist 14px ivory-200, ivory-100 on hover, and a 12px
   hairline-gold dash that slides in from the left gutter over 300ms with the
   heavy curve. The dash lives outside the text box so nothing shifts. */
const LINK =
  "group relative inline-flex items-center gap-2 font-sans text-[14px] leading-none text-ivory-200 transition-colors duration-300 ease-heavy hover:text-ivory-100";

const DASH =
  "pointer-events-none absolute top-1/2 -left-5 h-px w-3 origin-left scale-x-0 bg-hairline-gold transition-transform duration-300 ease-heavy group-hover:scale-x-100";

function Dash() {
  return <span aria-hidden className={DASH} />;
}

/* Fade in once with a 10px rise over 800ms; opacity only under reduced motion. */
function Rise({
  children,
  className,
  delay = 0,
  reduced,
  as: Tag = "div",
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  reduced: boolean;
  as?: "div" | "nav";
  ariaLabel?: string;
}) {
  const M = Tag === "nav" ? motion.nav : motion.div;
  return (
    <M
      aria-label={ariaLabel}
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: reduced ? 0.2 : 0.8, ease: EASE_SETTLE, delay: reduced ? 0 : delay }}
    >
      {children}
    </M>
  );
}

/**
 * Colophon. One hairline, a 12-column grid (brand, links, connect), a second
 * hairline, then the copyright and a back-to-top control. No clock, no
 * watermark, no badges: the record above has already made the argument.
 */
export default function Footer() {
  const reduced = useReducedMotion();
  const year = new Date().getFullYear();

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    smoothScrollTo(id);
  };

  return (
    <footer className="relative z-10 border-t border-hairline bg-obsidian-0 text-ivory-100">
      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-20">
        <div className="grid grid-cols-12 gap-y-10 lg:gap-x-8">
          {/* Brand */}
          <Rise reduced={reduced} className="col-span-12 lg:col-span-5">
            <Link
              href="/"
              className="inline-block font-display font-medium text-[24px] leading-tight tracking-[-0.005em] text-ivory-100"
            >
              Preetham Nimmagadda
            </Link>
            <p className="mt-4 max-w-[42ch] font-sans text-[15px] leading-[1.6] text-ivory-200">
              AI engineer. I build systems that act on their own judgment, and I stay accountable
              for what they do. Autonomy is not a demo.
            </p>
          </Rise>

          {/* Links */}
          <Rise
            reduced={reduced}
            delay={0.08}
            as="nav"
            ariaLabel="Footer"
            className="col-span-12 lg:col-span-3 lg:col-start-7"
          >
            <ul className="flex flex-col items-start gap-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`} onClick={(e) => handleNavClick(e, link.id)} className={LINK}>
                    <Dash />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </Rise>

          {/* Connect */}
          <Rise reduced={reduced} delay={0.16} className="col-span-12 lg:col-span-3 lg:text-right">
            <ul className="flex flex-col items-start gap-2.5 lg:items-end">
              {CONNECT_LINKS.map(({ label, href, Icon, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    className={LINK}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    <Dash />
                    <Icon size={16} weight="light" aria-hidden className="shrink-0" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </Rise>
        </div>

        {/* Bottom row */}
        <Rise
          reduced={reduced}
          delay={0.24}
          className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6"
        >
          <p className="ledger font-mono text-[12px] leading-none text-ivory-300">
            &copy; {year} Preetham Nimmagadda
          </p>
          <button
            type="button"
            onClick={() => smoothScrollTo(0)}
            className={cn(LINK, "cursor-pointer")}
          >
            Back to top
            <ArrowUp
              size={14}
              weight="light"
              aria-hidden
              className="shrink-0 transition-transform duration-300 ease-heavy group-hover:-translate-y-0.5"
            />
          </button>
        </Rise>
      </div>
    </footer>
  );
}
