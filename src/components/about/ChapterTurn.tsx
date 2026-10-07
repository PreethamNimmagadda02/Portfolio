"use client";

import type { MouseEvent } from "react";
import { ArrowDown } from "@phosphor-icons/react";
import { chapter } from "@/lib/chapters";
import { smoothScrollTo } from "@/lib/utils";
import { InViewClass } from "../Reveal";

/**
 * The foot of a chapter, set the way a book closes one and announces the
 * next: "End of chapter 01", a rule, and the next chapter's numeral, name and
 * note. The rule fills with gold on hover and the whole line carries the
 * reader on, so the page turns rather than simply continuing.
 */
export function ChapterTurn({ from, to }: { from: string; to: string }) {
  const current = chapter(from);
  const next = chapter(to);

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    smoothScrollTo(`#${next.id}`);
  };

  return (
    <InViewClass amount={0.6} className="mx-auto w-full max-w-[1280px] px-6 lg:px-10">
      <a
        href={`#${next.id}`}
        onClick={onClick}
        data-cursor="Next"
        className="group flex flex-col gap-5 border-t border-hairline pt-8 sm:flex-row sm:items-center sm:gap-8"
      >
        <span className="caption shrink-0 text-ivory-300">End of chapter {current.no}</span>

        <span aria-hidden className="relative hidden h-px flex-1 bg-hairline sm:block">
          <span className="absolute inset-0 origin-left scale-x-0 bg-aurum-300 transition-transform duration-700 ease-heavy group-hover:scale-x-100 group-focus-visible:scale-x-100" />
        </span>

        <span className="flex items-baseline gap-4">
          <span className="ledger caption text-aurum-300">{next.no}</span>
          <span className="font-display text-[1.75rem] leading-none text-ivory-100 transition-colors duration-500 ease-heavy group-hover:text-aurum-200 lg:text-[2rem]">
            {next.label}
          </span>
          <span className="hidden font-sans text-[14px] text-ivory-300 md:inline">{next.note}</span>
          <ArrowDown
            size={18}
            weight="light"
            aria-hidden
            className="self-center text-aurum-300 transition-transform duration-500 ease-heavy group-hover:translate-y-1"
          />
        </span>
      </a>
    </InViewClass>
  );
}
