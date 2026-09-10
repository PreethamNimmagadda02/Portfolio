"use client";

import { useInView } from "@/lib/motion";
import { useRef, useState, useEffect, useCallback, type CSSProperties } from "react";
import { Warning } from "@phosphor-icons/react";
import { LedgerNumber } from "@/components/ui";
import { cn } from "@/lib/utils";

const CODOLIO_USERNAME = "Preetham_02";

/* Types */
interface PlatformUserStats {
  currentRating: number | null;
  maxRating: number | null;
  rank: string | null;
  maxRank: string | null;
}

interface PlatformQuestionStats {
  totalQuestionCounts: number | null;
  easyQuestionCounts: number | null;
  mediumQuestionCounts: number | null;
  hardQuestionCounts: number | null;
}

interface BadgeStat {
  name: string;
  stars: number | null;
}

interface PlatformProfile {
  platform: string;
  userStats: PlatformUserStats | null;
  totalQuestionStats: PlatformQuestionStats | null;
  badgeStats?: {
    badgeList: BadgeStat[];
  } | null;
  certificateStats?: {
    certificates: unknown[];
  } | null;
  dailyActivityStatsResponse?: {
    maxStreak: number | null;
    submissionCalendar?: Record<string, number> | null;
  } | null;
  topicAnalysisStats?: {
    topicWiseDistribution: Record<string, number> | null;
  } | null;
  contestActivityStats?: {
    contestActivityList: unknown[];
  } | null;
}

interface CodolioAPIResponse {
  data: {
    platformProfiles?: {
      platformProfiles: PlatformProfile[];
    };
    platformStats?: PlatformProfile[];
  };
}

/* Platform display names, as each platform writes them. */
const PLATFORM_NAMES: Record<string, string> = {
  leetcode: "LeetCode",
  codeforces: "Codeforces",
  codechef: "CodeChef",
  hackerrank: "HackerRank",
  tuf: "TakeUForward",
};

const getCodeChefStars = (rating: number) => {
  if (rating <= 1399) return "1★";
  if (rating <= 1599) return "2★";
  if (rating <= 1799) return "3★";
  if (rating <= 1999) return "4★";
  if (rating <= 2199) return "5★";
  if (rating <= 2499) return "6★";
  return "7★";
};

export const LIVE_DATA_ERROR = "Live data is unavailable right now. Showing the last known figures.";

/**
 * The one plain-language error line shared by the GitHub and Codolio plates:
 * a light Warning glyph and a sentence, announced politely, no pill.
 */
export function LiveDataNotice({ message, className }: { message: string; className?: string }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className={cn("flex items-center gap-2 font-sans text-[14px] leading-[1.5] text-ivory-200", className)}
    >
      <Warning size={16} weight="light" aria-hidden className="shrink-0 text-aurum-200" />
      <span>{message}</span>
    </p>
  );
}

/* One ledger row per platform, read left to right the way an entry in a
   ledger is: index, then who, then the one figure that matters, then the
   supporting figures. The lead figure is set in the display face two steps
   above the rest, which is the whole difference between a table and a ledger. */
const ROW_CLASS =
  "group grid grid-cols-1 gap-y-6 border-t border-hairline py-7 transition-colors duration-500 ease-heavy hover:border-hairline-strong md:grid-cols-12 md:gap-x-6 lg:py-8";
const INDEX_COL_CLASS = "hidden md:col-span-1 md:block";
const NAME_COL_CLASS = "flex flex-wrap items-baseline gap-x-3 gap-y-1 md:col-span-3";
/* The stat grid stays a real dl: display:contents would let the cells join the
   row grid directly, but it also drops the list semantics in several engines,
   which is exactly the dt/dd pairing that makes these figures legible to a
   screen reader. Four equal columns, lead first. */
const STATS_COL_CLASS = "grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4 sm:gap-x-0 md:col-span-8";
const STAT_CELL_CLASS = "flex flex-col gap-2.5 sm:border-l sm:border-hairline sm:px-6 sm:first:border-l-0 sm:first:pl-0";
/* The label above a figure. One treatment for every stat in the row, lead or
   supporting, so the eye reads a single line of small caps across the plate. */
const STAT_LABEL_CLASS =
  "truncate font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-ivory-300 transition-colors duration-500 ease-heavy group-hover:text-ivory-200";

interface StatColumn {
  label: string;
  value: string;
}

/**
 * The columns a platform shows, in the order the previous card listed them.
 * The conditions are unchanged; only the presentation is.
 */
function buildColumns(profile: PlatformProfile): StatColumn[] {
  const topBadge = profile.badgeStats?.badgeList?.reduce(
    (prev, curr) => ((curr.stars || 0) > (prev.stars || 0) ? curr : prev),
    { name: "", stars: 0 } as BadgeStat
  );

  const columns: StatColumn[] = [
    {
      label: "Solved",
      value: (profile.totalQuestionStats?.totalQuestionCounts || 0).toLocaleString(),
    },
  ];

  if (profile.platform === "hackerrank" && topBadge) {
    columns.push({ label: topBadge.name, value: `${(topBadge.stars || 0).toLocaleString()}★` });
  } else if (profile.platform === "tuf") {
    columns.push({
      label: "Max streak",
      value: ((profile.dailyActivityStatsResponse?.maxStreak || 0) + 43).toLocaleString(),
    });
  } else {
    columns.push({
      label: "Rating",
      value: profile.userStats?.currentRating ? profile.userStats.currentRating.toLocaleString() : "N/A",
    });
  }

  if (profile.userStats?.maxRating) {
    columns.push({ label: "Max rating", value: profile.userStats.maxRating.toLocaleString() });
  }
  if (["codeforces", "codechef"].includes(profile.platform) && profile.contestActivityStats?.contestActivityList) {
    columns.push({
      label: "Contests attended",
      value: profile.contestActivityStats.contestActivityList.length.toLocaleString(),
    });
  }
  if (profile.platform === "leetcode" && profile.totalQuestionStats) {
    columns.push({
      label: "Medium problems",
      value: (profile.totalQuestionStats.mediumQuestionCounts || 0).toLocaleString(),
    });
  }
  if (profile.platform === "hackerrank" && profile.badgeStats?.badgeList && profile.badgeStats.badgeList.length > 0) {
    columns.push({ label: "Awards", value: profile.badgeStats.badgeList.length.toLocaleString() });
  }
  if (
    profile.platform === "hackerrank" &&
    profile.certificateStats?.certificates &&
    profile.certificateStats.certificates.length > 0
  ) {
    columns.push({ label: "Certifications", value: profile.certificateStats.certificates.length.toLocaleString() });
  }
  if (profile.platform === "tuf" && profile.dailyActivityStatsResponse?.submissionCalendar) {
    columns.push({
      label: "Active days",
      value: Object.keys(profile.dailyActivityStatsResponse.submissionCalendar).length.toLocaleString(),
    });
  }
  if (profile.platform === "tuf" && profile.totalQuestionStats?.hardQuestionCounts) {
    columns.push({
      label: "Hard problems",
      value: (profile.totalQuestionStats.hardQuestionCounts || 0).toLocaleString(),
    });
  }

  return columns;
}

function displayBadge(profile: PlatformProfile): string | null | undefined {
  if (profile.platform === "codechef" && profile.userStats?.currentRating) {
    return getCodeChefStars(profile.userStats.currentRating);
  }
  return profile.platform === "leetcode" ? null : profile.userStats?.maxRank;
}

/* Skeleton rows in the exact shape of a platform row, lead figure included,
   so the row does not change height when the fetch resolves. */
function ProfileSkeleton() {
  return (
    <div className={ROW_CLASS} aria-hidden>
      <div className={INDEX_COL_CLASS}>
        <span className="breathe block h-3 w-5 bg-obsidian-2" />
      </div>
      <div className={NAME_COL_CLASS}>
        <span className="breathe block h-6 w-32 bg-obsidian-2" />
        <span className="breathe block h-3 w-14 bg-obsidian-2" />
      </div>
      <div className={STATS_COL_CLASS}>
        <div className={cn(STAT_CELL_CLASS, "gap-3")}>
          <span className="breathe block h-3 w-14 bg-obsidian-2" />
          <span className="breathe block h-8 w-24 bg-obsidian-2" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={STAT_CELL_CLASS}>
            <span className="breathe block h-3 w-16 bg-obsidian-2" />
            <span className="breathe block h-4 w-12 bg-obsidian-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CodingProfiles({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const plateRef = useRef<HTMLDivElement>(null);
  // Embedded, the parent tab already gates mounting, so fetch at once;
  // standalone, wait until the plate is within 1000px of the viewport.
  const inViewMargin = useInView(plateRef, { once: true, margin: "1000px" });
  const shouldFetch = isEmbedded || inViewMargin;

  const [profiles, setProfiles] = useState<PlatformProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = "codolio_stats_cache_v2";
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < 1000 * 60 * 60 * 12) {
            setProfiles(parsed.profiles);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Failed to parse cached Codolio stats", e);
        }
      }

      const res = await fetch(
        `https://api.codolio.com/profile?userKey=${CODOLIO_USERNAME}`
      );
      if (!res.ok) throw new Error("Failed to fetch Codolio stats");

      const data: CodolioAPIResponse = await res.json();

      const rawProfiles =
        data.data.platformProfiles?.platformProfiles ||
        data.data.platformStats ||
        [];

      // Filter out platforms with 0 questions and no rating to keep it clean
      const activeProfiles = rawProfiles.filter(
        (p) =>
          (p.totalQuestionStats?.totalQuestionCounts &&
            p.totalQuestionStats.totalQuestionCounts > 0) ||
          (p.userStats?.currentRating && p.userStats.currentRating > 0)
      );

      // Sort: LeetCode and Codeforces first
      const sorted = activeProfiles.sort((a, b) => {
        const priority: Record<string, number> = { leetcode: 1, codeforces: 2, codechef: 3 };
        const pa = priority[a.platform] || 99;
        const pb = priority[b.platform] || 99;
        return pa - pb;
      });

      setProfiles(sorted);

      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        profiles: sorted
      }));
    } catch (err) {
      console.error("Codolio fetch error:", err);
      setError(LIVE_DATA_ERROR);
      // Fallback data
      setProfiles([
        {
          platform: "leetcode",
          userStats: { currentRating: 1467, maxRating: 1516, rank: null, maxRank: null },
          totalQuestionStats: { totalQuestionCounts: 303, easyQuestionCounts: 66, mediumQuestionCounts: 229, hardQuestionCounts: 8 },
        },
        {
          platform: "codeforces",
          userStats: { currentRating: 1450, maxRating: 1583, rank: "specialist", maxRank: "specialist" },
          totalQuestionStats: { totalQuestionCounts: 29, easyQuestionCounts: null, mediumQuestionCounts: null, hardQuestionCounts: null },
        },
        {
          platform: "codechef",
          userStats: { currentRating: 1864, maxRating: null, rank: null, maxRank: null },
          totalQuestionStats: { totalQuestionCounts: 26, easyQuestionCounts: null, mediumQuestionCounts: null, hardQuestionCounts: null },
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (shouldFetch) fetchData();
  }, [shouldFetch, fetchData]);

  const plate = (
    <div ref={plateRef} className="w-full">
      {error && <LiveDataNotice message={error} className="mb-6" />}

      <div className="border-b border-hairline" aria-busy={loading || undefined}>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <ProfileSkeleton key={i} />)
          : profiles.map((profile, idx) => {
            const name =
              PLATFORM_NAMES[profile.platform] ||
              profile.platform.charAt(0).toUpperCase() + profile.platform.slice(1);
            const badge = displayBadge(profile);
            const [lead, ...rest] = buildColumns(profile);

            return (
              <article
                key={profile.platform}
                className={cn(ROW_CLASS, "cell-in")}
                style={{ "--d": `${idx * 90}ms` } as CSSProperties}
                aria-label={`${name} statistics`}
              >
                {/* Hanging index, hidden below md where the row stacks and a
                    lone numeral in the flow would read as a stat of its own. */}
                <div className={INDEX_COL_CLASS} aria-hidden>
                  <span className="ledger font-mono text-[11px] leading-none tracking-[0.14em] text-ivory-300 transition-colors duration-500 ease-heavy group-hover:text-aurum-300">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className={NAME_COL_CLASS}>
                  <h3 className="foil font-display text-[22px] font-medium leading-[1.2]">
                    {name}
                  </h3>
                  {badge && (
                    <span className="ledger font-mono text-[11px] uppercase leading-none tracking-[0.14em] text-ivory-300">
                      {badge}
                    </span>
                  )}
                </div>

                <dl className={STATS_COL_CLASS}>
                  {/* The headline figure, in the display face, two steps above
                      the rest. This is the one figure a visitor should carry
                      away from the row. */}
                  <div className={cn(STAT_CELL_CLASS, "gap-3")}>
                    <dt className={STAT_LABEL_CLASS}>{lead.label}</dt>
                    <dd className="m-0">
                      <LedgerNumber
                        value={lead.value}
                        label={`${lead.label}: ${lead.value}`}
                        delayMs={idx * 90}
                        className="font-display text-[2rem] font-medium leading-none text-ivory-100 transition-colors duration-600 ease-settle group-hover:text-aurum-200"
                      />
                    </dd>
                  </div>

                  {/* The supporting figures, each behind a hairline once they
                      sit on one row and cannot wrap across a rule. */}
                  {rest.map((col, i) => (
                    <div key={`${col.label}-${i}`} className={STAT_CELL_CLASS}>
                      <dt className={STAT_LABEL_CLASS}>{col.label}</dt>
                      <dd className="m-0">
                        <LedgerNumber
                          value={col.value}
                          label={`${col.label}: ${col.value}`}
                          delayMs={idx * 90 + (i + 1) * 60}
                          className="font-mono text-[15px] leading-none text-ivory-100"
                        />
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            );
          })}
      </div>
    </div>
  );

  if (isEmbedded) {
    return plate;
  }

  return (
    <section id="coding-profiles" className="relative w-full py-32 lg:py-40">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">{plate}</div>
    </section>
  );
}
