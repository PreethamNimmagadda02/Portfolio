import { pad2 } from "@/lib/utils";

/**
 * The page's chapters, in reading order.
 *
 * One registry for the section ids, the chapter numerals and the names the
 * letterhead, the Index overlay and every SectionHeading print, so the page
 * reads as one numbered monograph and no two places can disagree about what
 * chapter four is called. The WebGL scene calibrates its own chapter map
 * against these same ids (see scene-store).
 */
export interface Chapter {
  /** The section element's id. */
  id: string;
  /** Two-digit chapter numeral. */
  no: string;
  /** Plain name, as the letterhead and the Index print it. */
  label: string;
  /** One-line descriptor, shown beside the name in the Index. */
  note: string;
}

export const CHAPTERS: readonly Chapter[] = [
  { id: "home", no: "00", label: "Home", note: "The cover" },
  { id: "about", no: "01", label: "About", note: "The thesis and the method" },
  { id: "experience", no: "02", label: "Experience", note: "Six roles since 2024" },
  { id: "projects", no: "03", label: "Projects", note: "Selected work" },
  { id: "skills-sphere", no: "04", label: "Skills", note: "The working toolset" },
  { id: "github-stats", no: "05", label: "Activity", note: "Live from GitHub" },
  { id: "achievements", no: "06", label: "Achievements", note: "The competitive record" },
  { id: "testimonials", no: "07", label: "Testimonials", note: "In their words" },
  { id: "contact", no: "08", label: "Contact", note: "Start a conversation" },
];

const BY_ID = new Map(CHAPTERS.map((c) => [c.id, c]));

/** The chapter for a section id. Throws on an unknown id so a typo fails loudly in development. */
export function chapter(id: string): Chapter {
  const found = BY_ID.get(id);
  if (!found) throw new Error(`Unknown chapter id "${id}"`);
  return found;
}

/** Total chapters after the cover, for "03 / 08" style folios. */
export const CHAPTER_COUNT = pad2(CHAPTERS.length - 1);
