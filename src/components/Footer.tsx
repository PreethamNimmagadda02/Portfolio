"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { ArrowUp, EnvelopeSimple, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";
import { motion, EASE_SETTLE } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn, smoothScrollTo } from "@/lib/utils";
import { InViewClass } from "./Reveal";

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

/* A column heading. Three stacks of links with nothing above them read as a
   template footer; the small caps are what make them a colophon's columns. */
function ColumnLabel({ children, className }: { children: ReactNode; className?: string }) {
  /* Block heading, eyebrow inside: .eyebrow is inline-flex, so it is the
     wrapper that owns the spacing and any rule, the same shape SectionHeading
     uses. */
  return (
    <h2 className={cn("mb-4", className)}>
      <span className="eyebrow text-ivory-300">
        {children}
        <span aria-hidden className="h-px w-6 bg-hairline" />
      </span>
    </h2>
  );
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
 * hairline, the copyright and a back-to-top control, and then the page is
 * signed: the name set once more across the full measure, rising out of its
 * masks as the reader arrives at the end. No clock, no watermark, no badges:
 * the record above has already made the argument.
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
      <div className="mx-auto max-w-[1280px] px-6 py-12 lg:px-10 lg:py-16">
        {/* Below lg the brand takes a full row and the two link lists share
            the next one, six columns each: stacked, the shorter Elsewhere list
            cost the footer its own height plus a row gap for three items.
            gap-y only bites here, since at lg all three sit on one row. */}
        <div className="grid grid-cols-12 gap-x-6 gap-y-8 lg:gap-x-8">
          {/* Brand */}
          <Rise reduced={reduced} className="col-span-12 lg:col-span-5">
            <Link
              href="/"
              className="foil inline-block font-display font-medium text-[24px] leading-tight tracking-[-0.005em]"
            >
              Preetham Nimmagadda
            </Link>
            <p className="mt-4 max-w-[42ch] font-sans text-[15px] leading-[1.6] text-ivory-200">
              AI architect. I design systems that act on their own judgment, and I stay accountable
              for what they do. Autonomy is not a demo.
            </p>
          </Rise>

          {/* Links */}
          <Rise
            reduced={reduced}
            delay={0.08}
            as="nav"
            ariaLabel="Footer"
            className="col-span-6 lg:col-span-3 lg:col-start-7 lg:border-l lg:border-hairline lg:pl-8"
          >
            <ColumnLabel>Navigate</ColumnLabel>
            {/* leading-none on the list, not just the anchors: the items
                otherwise inherit the body's 1.65 line-height, which gave every
                14px link a 26px line box. Six links carried 72px of leading
                they never used, and this is the tallest column, so that was
                the footer's height. */}
            <ul className="flex flex-col items-start gap-2.5 leading-none">
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
          <Rise
            reduced={reduced}
            delay={0.16}
            /* The rule runs at every width here: below lg it is what divides
               the two lists sharing the row, above lg it is the third column
               boundary. */
            className="col-span-6 border-l border-hairline pl-6 lg:col-span-3 lg:pl-8"
          >
            <ColumnLabel>Elsewhere</ColumnLabel>
            <ul className="flex flex-col items-start gap-2.5 leading-none">
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
          className="mt-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-5 border-t border-hairline pt-6"
        >
          {/* The colophon proper: what the page is set in, and where it was
              set. The line a printed edition would carry at the back. */}
          <div className="flex flex-col gap-2">
            <p className="ledger font-mono text-[12px] leading-none text-ivory-300">
              &copy; {year} Preetham Nimmagadda
            </p>
            <p className="font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-ivory-300">
              Set in Bodoni Moda and Geist. Hyderabad, Telangana.
            </p>
          </div>

          {/* A control, not a fourth link: its own hairline box, so it does
              not borrow the left dash the lists above use. */}
          <button
            type="button"
            onClick={() => smoothScrollTo(0)}
            className="group inline-flex cursor-pointer items-center gap-3 border border-hairline px-4 py-3 font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-ivory-200 transition-colors duration-300 ease-heavy hover:border-hairline-gold hover:text-aurum-200"
          >
            Back to top
            <ArrowUp
              size={14}
              weight="light"
              aria-hidden
              className="shrink-0 transition-transform duration-300 ease-heavy group-hover:-translate-y-1"
            />
          </button>
        </Rise>

        {/* The signature. Sized in container units against the rendered
            width of the name in the display cut (10.42em at this tracking,
            Nimmagadda alone 5.92em), so it spans the column edge to edge at
            every width: one line from sm, two below, where one would set it
            too small to carry. Decorative; the brand link above names him. */}
        <InViewClass amount={0.4} className="mt-12 border-t border-hairline pt-8 [container-type:inline-size] lg:mt-16 lg:pt-10">
          <p
            aria-hidden
            className="select-none whitespace-nowrap font-display font-normal leading-[0.9] tracking-[-0.02em] text-ivory-100 text-[calc(100cqw/6.05)] sm:text-[calc(100cqw/10.5)]"
          >
            <span className="word-mask">
              <span className="line-rise">Preetham</span>
            </span>
            <span className="hidden sm:inline"> </span>
            <br className="sm:hidden" />
            <span className="word-mask">
              <span className="line-rise" style={{ "--rise-delay": "110ms" } as CSSProperties}>
                Nimmagadda
              </span>
            </span>
          </p>
        </InViewClass>
      </div>
    </footer>
  );
}
