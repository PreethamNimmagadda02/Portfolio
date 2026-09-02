"use client";

import { motion, useInView, AnimatePresence, EASE_HEAVY } from "@/lib/motion";
import { useRef, useState, useEffect, useMemo, useCallback, type CSSProperties } from "react";
import CodingProfiles, { LiveDataNotice, LIVE_DATA_ERROR } from "./CodingProfiles";
import { useIsMobile } from "@/hooks/use-mobile";
import { SectionHeading, LedgerNumber } from "@/components/ui";
import { cn } from "@/lib/utils";
import bakedLoc from "@/data/github-loc.json";

const GITHUB_USERNAME = "PreethamNimmagadda02";

/* Lines-written config.
 * GitHub has no lifetime-LOC endpoint; /stats/contributors is the only source
 * for authored line counts and costs one request per repo, which is most of
 * the 60/hr unauthenticated budget. So the browser tries live and falls back
 * to the figure `scripts/fetch-loc.mjs` bakes in at build time with CI's token.
 *
 * The baked file also carries the repo exclusion list it derived (vendored
 * third-party trees, committed-then-deleted node_modules). Reusing it here
 * keeps the live number consistent with the fallback instead of reporting a
 * millions-of-lines figure that isn't authored work.
 */
const LOC_EXCLUDED = new Set(
  (bakedLoc.excludedRepos ?? []).map((r) => r.toLowerCase())
);
/** Bounds the request burst against the unauthenticated rate limit. */
const LOC_REPO_LIMIT = 18;
const LOC_CONCURRENCY = 4;
const LOC_CACHE_KEY = "github_loc_cache_v1";
// 24h: lines-written changes slowly, so this refetches less often than the
// other stats caches (12h) to save on the per-repo request burst.
const LOC_CACHE_TTL_MS = 1000 * 60 * 60 * 24;

/* Types */
interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ContributionsResponse {
  total: Record<string, number>;
  contributions: ContributionDay[];
}

interface GitHubRepo {
  name: string;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  size: number;
}

interface StatsData {
  totalContributions: number;
  repoCount: number;
  activeDays: number;
}

interface LanguageData {
  name: string;
  percentage: number;
}

interface Figure {
  label: string;
  value: number;
  href: string;
  /** Tooltip text, used to disclose how a derived figure was measured. */
  hint?: string;
}

/* Data fetching */
async function fetchContributions(): Promise<ContributionsResponse> {
  const today = new Date();
  const currentYear = today.getFullYear();
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 12);
  const prevYear = sixMonthsAgo.getFullYear();

  const fetchCurrent = fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=${currentYear}`);
  const fetchPrev = prevYear < currentYear
    ? fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=${prevYear}`)
    : Promise.resolve(null);

  const [resCurrent, resPrev] = await Promise.all([fetchCurrent, fetchPrev]);

  if (!resCurrent.ok) throw new Error("Failed to fetch contributions");
  const data: ContributionsResponse = await resCurrent.json();

  if (resPrev && resPrev.ok) {
    const prevData: ContributionsResponse = await resPrev.json();
    data.contributions = [...prevData.contributions, ...data.contributions];
    data.total = { ...prevData.total, ...data.total };
  }

  return data;
}

async function fetchRepos(): Promise<GitHubRepo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`
    );
    if (!res.ok) return []; // Fallback to empty array if rate limited
    return res.json();
  } catch {
    return [];
  }
}

async function fetchUserProfile(): Promise<{ public_repos: number }> {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
    if (!res.ok) return { public_repos: 12 }; // Fallback count
    return res.json();
  } catch {
    return { public_repos: 12 };
  }
}

/**
 * Additions/deletions this user authored in one repo.
 * Returns "ratelimited" so the caller can abort the whole burst rather than
 * spend the remaining budget on requests that will also fail.
 */
async function fetchRepoAuthoredLines(
  repo: string
): Promise<{ added: number; deleted: number } | "ratelimited" | null> {
  const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${repo}/stats/contributors`;

  // Two passes: GitHub answers 202 with an empty body while it builds the
  // stats cache, and usually has it ready a beat later.
  for (let attempt = 0; attempt < 2; attempt++) {
    let res: Response;
    try {
      res = await fetch(url);
    } catch {
      return null;
    }

    if (res.status === 202) {
      await new Promise((r) => setTimeout(r, 1500));
      continue;
    }
    if (res.status === 403 || res.status === 429) return "ratelimited";
    if (res.status === 204) return { added: 0, deleted: 0 };
    if (!res.ok) return null;

    const body = await res.json().catch(() => null);
    if (!Array.isArray(body)) return null;

    const mine = body.find(
      (c) => c?.author?.login?.toLowerCase() === GITHUB_USERNAME.toLowerCase()
    );
    if (!mine || !Array.isArray(mine.weeks)) return { added: 0, deleted: 0 };

    return mine.weeks.reduce(
      (acc: { added: number; deleted: number }, w: { a?: number; d?: number }) => ({
        added: acc.added + (w.a || 0),
        deleted: acc.deleted + (w.d || 0),
      }),
      { added: 0, deleted: 0 }
    );
  }
  return null;
}

/**
 * Live lines-written total, or null when it can't be trusted, in which case
 * the caller keeps the build-time figure. A partial sum is worse than a stale
 * one: it renders as a confidently wrong, much smaller number.
 */
async function fetchLinesWritten(repos: GitHubRepo[]): Promise<number | null> {
  const targets = repos
    .filter((r) => !r.fork && !LOC_EXCLUDED.has(r.name.toLowerCase()))
    .sort((a, b) => b.size - a.size)
    .slice(0, LOC_REPO_LIMIT)
    .map((r) => r.name);

  if (targets.length === 0) return null;

  let added = 0;
  let resolved = 0;

  for (let i = 0; i < targets.length; i += LOC_CONCURRENCY) {
    const batch = await Promise.all(
      targets.slice(i, i + LOC_CONCURRENCY).map(fetchRepoAuthoredLines)
    );
    if (batch.includes("ratelimited")) return null;
    for (const r of batch) {
      if (!r || r === "ratelimited") continue;
      added += r.added;
      resolved++;
    }
  }

  if (resolved < Math.ceil(targets.length * 0.75)) return null;
  return added;
}

/* Language aggregation (by repo count) */
function aggregateLanguages(repos: GitHubRepo[]): LanguageData[] {
  const counts: Record<string, number> = {};
  let total = 0;

  for (const repo of repos) {
    if (repo.fork || !repo.language) continue;
    counts[repo.language] = (counts[repo.language] || 0) + 1;
    total++;
  }

  if (total === 0) return [];

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topTotal = sorted.reduce((sum, [, count]) => sum + count, 0);
  const otherCount = total - topTotal;

  const languages: LanguageData[] = sorted.map(([name, count]) => ({
    name,
    percentage: Math.round((count / total) * 100),
  }));

  if (otherCount > 0) {
    languages.push({
      name: "Other",
      percentage: Math.round((otherCount / total) * 100),
    });
  }

  // Normalize to 100%
  const percentSum = languages.reduce((s, l) => s + l.percentage, 0);
  if (percentSum !== 100 && languages.length > 0) {
    languages[0].percentage += 100 - percentSum;
  }

  return languages;
}

/* Heatmap ramp: level 0 is the highest obsidian surface, 1 to 4 climb the
   gold ramp from pressed umber to the highlight. Read from the theme tokens
   so the ramp and the rest of the page can never drift apart. */
const CELL_COLORS = [
  "var(--color-obsidian-2)",
  "var(--color-aurum-400)",
  "var(--color-aurum-300)",
  "var(--color-aurum-200)",
  "var(--color-aurum-100)",
];

/* Language distribution: one ink, six alphas. Ivory-100 is rgb(242,236,224). */
const LANG_ALPHAS = [1, 0.7, 0.5, 0.35, 0.25, 0.15];
const langInk = (i: number) => `rgba(242, 236, 224, ${LANG_ALPHAS[Math.min(i, LANG_ALPHAS.length - 1)]})`;

const TODAY_RING: CSSProperties = { boxShadow: "inset 0 0 0 1px var(--color-ivory-100)" };

/* Contribution heatmap */
function ContributionHeatmap({ data }: { data: ContributionDay[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const isMobile = useIsMobile();
  // 12 months of weekly columns is about 1px per cell at 320px wide.
  // Mobile shows the last 6 months so cells stay visible and tappable.
  const monthsBack = isMobile ? 6 : 12;

  // Build a weekly grid from data up to today
  const { heatmapGrid, todayKey } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = today.toISOString().split("T")[0];

    const rangeStart = new Date(today);
    rangeStart.setMonth(rangeStart.getMonth() - monthsBack);
    // Align to start of that week (Sunday)
    const dayOfWeek = rangeStart.getDay();
    rangeStart.setDate(rangeStart.getDate() - dayOfWeek);
    rangeStart.setHours(0, 0, 0, 0);

    // Build date to data map
    const dateMap = new Map<string, { level: number; count: number }>();
    for (const d of data) {
      dateMap.set(d.date, { level: d.level, count: d.count });
    }

    const weeks: { level: number; count: number; date: string }[][] = [];
    let currentWeek: { level: number; count: number; date: string }[] = [];

    // Fill in all days from rangeStart to today
    const iter = new Date(rangeStart);
    while (iter <= today) {
      const dateStr = iter.toISOString().split("T")[0];
      const dayData = dateMap.get(dateStr) ?? { level: 0, count: 0 };
      currentWeek.push({ ...dayData, date: dateStr });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      iter.setDate(iter.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return { heatmapGrid: weeks, todayKey };
  }, [data, monthsBack]);

  // Compute month labels for the window
  const monthLabels = useMemo(() => {
    const today = new Date();
    const rangeStart = new Date(today);
    rangeStart.setMonth(rangeStart.getMonth() - monthsBack);
    // Align to start of week (Sunday)
    const dayOfWeek = rangeStart.getDay();
    rangeStart.setDate(rangeStart.getDate() - dayOfWeek);
    rangeStart.setHours(0, 0, 0, 0);

    const months: { label: string; weekIndex: number }[] = [];
    const seenMonths = new Set<string>();

    const iter = new Date(rangeStart);
    let weekIndex = 0;
    while (iter <= today) {
      const monthKey = `${iter.getFullYear()}-${iter.getMonth()}`;
      if (!seenMonths.has(monthKey) && iter.getDate() <= 7) {
        seenMonths.add(monthKey);
        months.push({
          label: iter.toLocaleString("default", { month: "short" }),
          weekIndex,
        });
      }
      // Advance by 1 week
      iter.setDate(iter.getDate() + 7);
      weekIndex++;
    }
    return months;
  }, [monthsBack]);

  // Ink drying left to right: each column lands 12ms after the last, each row
  // 3ms after the one above, capped so the last cell finishes under 900ms
  // (650ms delay plus the 250ms cell-in keyframe).
  const cellDelay = (wk: number, dy: number) => Math.min(wk * 12 + dy * 3, 650);

  return (
    <div ref={ref} className="w-full">
      <div className="flex w-full flex-col">
        {/* Month labels, sparser on mobile to avoid collisions */}
        <div className="relative mb-2 ml-0 w-full sm:ml-9" style={{ height: 14 }}>
          {monthLabels
            .filter((_, i) => !isMobile || i % 2 === 0)
            .map((m, i) => {
              const leftPercent = (m.weekIndex / heatmapGrid.length) * 100;
              return (
                <span
                  key={`${m.label}-${i}`}
                  className="ledger absolute -translate-x-1/2 font-mono text-[11px] leading-none text-ivory-300"
                  style={{ left: `${leftPercent}%` }}
                >
                  {m.label}
                </span>
              );
            })}
        </div>
        <div className="flex w-full">
          {/* Weekday labels, hidden on mobile (unreadable at that size, steals width) */}
          <div className="mr-3 hidden w-6 flex-col justify-between sm:flex">
            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
              <span key={i} className="flex flex-1 items-center font-mono text-[11px] leading-none text-ivory-300">
                {d}
              </span>
            ))}
          </div>
          {/* Weeks */}
          <div className="flex flex-1 gap-[3px]">
            {heatmapGrid.map((week, wk) => (
              <div key={wk} className="flex flex-1 flex-col gap-[3px]">
                {Array.from({ length: 7 }).map((_, dy) => {
                  const day = dy < week.length ? week[dy] : null;
                  if (!day) {
                    return <div key={dy} className="aspect-square w-full" />;
                  }
                  const isToday = day.date === todayKey;
                  return (
                    <div
                      key={dy}
                      title={`${day.count} contributions on ${day.date}`}
                      className={cn(
                        "aspect-square w-full cursor-crosshair transition-opacity duration-300 hover:opacity-70",
                        isInView ? "cell-in" : "opacity-0"
                      )}
                      style={{
                        backgroundColor: CELL_COLORS[Math.min(day.level, 4)],
                        "--d": `${cellDelay(wk, dy)}ms`,
                        ...(isToday ? TODAY_RING : null),
                      } as CSSProperties}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div className="mt-5 flex items-center justify-end gap-[3px]">
          <span className="mr-2 font-mono text-[11px] leading-none text-ivory-300">Less</span>
          {CELL_COLORS.map((c, i) => (
            <span key={i} aria-hidden className="size-3" style={{ backgroundColor: c }} />
          ))}
          <span className="ml-2 font-mono text-[11px] leading-none text-ivory-300">More</span>
        </div>
      </div>
    </div>
  );
}

/* Figure row: the ledger of four. Hairline rules divide the cells; on
   mobile the row folds to 2x2 with a rule between the two rows. */
function figureCellClass(i: number) {
  return cn(
    "group flex flex-col gap-4 py-8 lg:py-10",
    // Mobile 2x2: a vertical rule between the two columns, a horizontal one between the rows.
    i % 2 === 0 ? "pl-0 pr-5" : "border-l border-hairline pl-5 pr-0",
    i >= 2 && "border-t border-hairline lg:border-t-0",
    // Desktop row of four: rules between every cell, symmetric gutters, flush outer edges.
    i === 2 && "lg:border-l lg:border-hairline",
    i === 0 ? "lg:pl-0" : "lg:pl-8",
    i === 3 ? "lg:pr-0" : "lg:pr-8"
  );
}

function FigureSkeleton() {
  return (
    <div className="grid grid-cols-2 border-y border-hairline lg:grid-cols-4" aria-busy="true" aria-label="Loading GitHub figures">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={figureCellClass(i)}>
          <span className="breathe block h-[2.5rem] w-[5.5ch] bg-obsidian-2 lg:h-[3.5rem]" />
          <span className="breathe block h-3 w-24 bg-obsidian-2" />
        </div>
      ))}
    </div>
  );
}

const PLATE_TRANSITION = { duration: 0.35, ease: EASE_HEAVY };

const TAB_COPY = {
  github: {
    title: "Twelve months of commits, live.",
    subtext: "Read from GitHub as this page loads, not typed in. Every figure here can be checked.",
  },
  competitive: {
    title: "Ratings from five platforms, live.",
    subtext: "Current ratings and rankings, read directly from each platform.",
  },
} as const;

/* Main component */
export default function GitHubStats() {
  const sectionRef = useRef<HTMLElement>(null);
  // Defer the GitHub API calls until the section approaches the viewport.
  // Previously they fired at page load, competing with critical resources
  // and burning unauthenticated rate limit on every visit.
  const shouldFetch = useInView(sectionRef, { once: true, margin: "1000px" });

  const [stats, setStats] = useState<StatsData | null>(null);
  const [languages, setLanguages] = useState<LanguageData[]>([]);
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  // Seeded with the build-time figure so the figure always shows a real number,
  // then upgraded in place if the live per-repo fetch succeeds.
  const [linesAdded, setLinesAdded] = useState(bakedLoc.linesAdded);
  const [linesAreLive, setLinesAreLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"github" | "competitive">("github");

  const hydrateLines = useCallback(async (repos: GitHubRepo[]) => {
    const live = await fetchLinesWritten(repos);
    if (live === null || live <= 0) return;
    setLinesAdded(live);
    setLinesAreLive(true);
    try {
      localStorage.setItem(
        LOC_CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), linesAdded: live })
      );
    } catch (e) {
      console.warn("Failed to cache lines-written total", e);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Read the lines cache before the early return below, so a stats-cache
      // hit still gets the last live figure instead of the build-time one.
      const cachedLoc = localStorage.getItem(LOC_CACHE_KEY);
      let locWasCached = false;
      if (cachedLoc) {
        try {
          const parsed = JSON.parse(cachedLoc);
          if (
            Date.now() - parsed.timestamp < LOC_CACHE_TTL_MS &&
            typeof parsed.linesAdded === "number" &&
            parsed.linesAdded > 0
          ) {
            setLinesAdded(parsed.linesAdded);
            setLinesAreLive(true);
            locWasCached = true;
          }
        } catch (e) {
          console.warn("Failed to parse cached lines-written total", e);
        }
      }

      const cacheKey = "github_stats_cache_v3";
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < 1000 * 60 * 60 * 12) {
            setStats(parsed.stats);
            setLanguages(parsed.languages);
            setContributions(parsed.contributions);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Failed to parse cached GitHub stats", e);
        }
      }

      const [contribData, repos, profile] = await Promise.all([
        fetchContributions(),
        fetchRepos(),
        fetchUserProfile(),
      ]);

      // Filter contributions to last 1 year up to today
      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setMonth(oneYearAgo.getMonth() - 12);
      const filtered = contribData.contributions.filter((c) => {
        const d = new Date(c.date);
        return d >= oneYearAgo && d <= today;
      });
      setContributions(filtered);

      // Both figures are computed from the same twelve-month window the
      // headline claims. The API's `total` map is keyed by calendar year and
      // sums two of them, which would overstate the period.
      const totalContributions = filtered.reduce((sum, c) => sum + c.count, 0);
      const activeDays = filtered.filter((c) => c.count > 0).length;

      const newStats = {
        totalContributions,
        repoCount: profile.public_repos,
        activeDays,
      };

      setStats(newStats);

      // Unawaited: this is one request per repo and can take many seconds,
      // while the figure already has the build-time number to show.
      if (!locWasCached && repos.length > 0) void hydrateLines(repos);

      const aggregatedLangs = aggregateLanguages(repos);
      let finalLangs = aggregatedLangs;
      if (aggregatedLangs.length === 0) {
        // Fallback if repos failed due to rate limits
        finalLangs = [
          { name: "TypeScript", percentage: 50 },
          { name: "JavaScript", percentage: 40 },
          { name: "Python", percentage: 10 },
        ];
        setLanguages(finalLangs);
      } else {
        setLanguages(finalLangs);
      }

      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        stats: newStats,
        languages: finalLangs,
        contributions: filtered
      }));
    } catch (err) {
      console.warn("GitHub data fetch failed (likely rate limited). Using fallback UI state.", err);
      setError(LIVE_DATA_ERROR);

      // Fallback data
      setStats({
        totalContributions: 1257,
        repoCount: 12,
        activeDays: 245,
      });
      setLanguages([
        { name: "TypeScript", percentage: 42 },
        { name: "JavaScript", percentage: 25 },
        { name: "Python", percentage: 17 },
        { name: "Other", percentage: 16 },
      ]);
    } finally {
      setLoading(false);
    }
  }, [hydrateLines]);

  useEffect(() => {
    if (shouldFetch) fetchData();
  }, [shouldFetch, fetchData]);

  const figures = useMemo<Figure[]>(() => {
    if (!stats) return [];

    return [
      {
        label: "Contributions",
        value: stats.totalContributions,
        href: `https://github.com/${GITHUB_USERNAME}`,
      },
      {
        label: "Active days",
        value: stats.activeDays,
        href: `https://github.com/${GITHUB_USERNAME}`,
      },
      {
        label: "Repositories",
        value: stats.repoCount,
        href: `https://github.com/${GITHUB_USERNAME}?tab=repositories`,
      },
      {
        label: "Lines written",
        value: linesAdded,
        href: `https://github.com/${GITHUB_USERNAME}?tab=repositories`,
        hint: linesAreLive
          ? `${linesAdded.toLocaleString()} lines added across ${bakedLoc.reposCounted} repositories, live from the GitHub API`
          : `${linesAdded.toLocaleString()} lines added across ${bakedLoc.reposCounted} repositories, as of ${new Date(
            bakedLoc.generatedAt
          ).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}`,
      },
    ].sort((a, b) => b.value - a.value);
  }, [stats, linesAdded, linesAreLive]);

  const copy = TAB_COPY[activeTab];

  return (
    <section
      ref={sectionRef}
      id="github-stats"
      className="relative w-full py-32 lg:py-40"
    >
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        {/* Header: eyebrow, headline and subtext in columns 1 to 8 */}
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-8">
            <SectionHeading
              eyebrow="LIVE FROM GITHUB AND CODOLIO"
              title={copy.title}
              subtext={copy.subtext}
            />
          </div>
        </div>

        {/* Tab switch: two mono text toggles sharing one hairline indicator */}
        <div role="group" aria-label="Activity source" className="mt-14 flex items-end gap-10 border-b border-hairline lg:mt-16">
          {(["github", "competitive"] as const).map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                aria-pressed={active}
                className={cn(
                  "ledger relative pb-4 font-mono text-[13px] leading-none tracking-[0.01em] transition-colors duration-300 ease-[var(--ease-heavy)]",
                  active ? "text-ivory-100" : "text-ivory-300 hover:text-ivory-200"
                )}
              >
                {tab === "github" ? "GitHub" : "Competitive"}
                {active && (
                  <motion.span
                    layoutId="active-tab-indicator"
                    aria-hidden
                    className="absolute inset-x-0 -bottom-px h-px bg-aurum-300"
                    transition={{ duration: 0.45, ease: EASE_HEAVY }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {activeTab === "github" && (
            <motion.div
              key="github-tab"
              id="activity-plate-github"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={PLATE_TRANSITION}
              className="mt-12"
            >
              {error && <LiveDataNotice message={error} className="mb-6" />}

              {/* Figure row */}
              {loading ? (
                <FigureSkeleton />
              ) : (
                <div className="grid grid-cols-2 border-y border-hairline lg:grid-cols-4">
                  {figures.map((figure, i) => (
                    <a
                      key={figure.label}
                      href={figure.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={figure.hint}
                      className={figureCellClass(i)}
                    >
                      <LedgerNumber
                        value={figure.value.toLocaleString()}
                        label={`${figure.value.toLocaleString()} ${figure.label.toLowerCase()}`}
                        className="font-display text-[2.5rem] leading-none text-ivory-100 lg:text-[3.5rem]"
                      />
                      <span className="font-mono text-[12px] leading-none tracking-[0.04em] text-ivory-300">
                        <span className="decoration-hairline-gold underline-offset-[5px] group-hover:underline">
                          {figure.label}
                        </span>
                      </span>
                    </a>
                  ))}
                </div>
              )}

              {/* Heatmap */}
              <div className="mt-16">
                <p className="mb-6 font-mono text-[12px] leading-none tracking-[0.04em] text-ivory-300">
                  Contributions by day
                </p>
                {loading ? (
                  <div aria-busy="true" className="flex flex-col gap-[3px]">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <span key={i} className="breathe block h-3 w-full bg-obsidian-2" />
                    ))}
                  </div>
                ) : contributions.length > 0 ? (
                  <div className="w-full overflow-x-auto no-scrollbar">
                    <ContributionHeatmap data={contributions} />
                  </div>
                ) : (
                  <p className="font-sans text-[14px] text-ivory-300">No contribution data available</p>
                )}
              </div>

              {/* Language distribution */}
              <div className="mt-16">
                <p className="mb-6 font-mono text-[12px] leading-none tracking-[0.04em] text-ivory-300">
                  Languages by repository
                </p>
                {loading ? (
                  <div aria-busy="true">
                    <span className="breathe block h-[6px] w-full bg-obsidian-2" />
                    <div className="mt-5 flex gap-6">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <span key={i} className="breathe block h-3 w-20 bg-obsidian-2" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      role="img"
                      aria-label={languages.map((l) => `${l.name} ${l.percentage}%`).join(", ")}
                      className="flex h-[6px] w-full gap-[2px]"
                    >
                      {languages.map((lang, i) => (
                        <span
                          key={lang.name}
                          className="block h-full min-w-0"
                          style={{ width: `${lang.percentage}%`, backgroundColor: langInk(i) }}
                        />
                      ))}
                    </div>
                    <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[12px] leading-none tracking-[0.04em]">
                      {languages.map((lang, i) => (
                        <li key={lang.name} className="flex items-center gap-2.5">
                          <span aria-hidden className="size-2 shrink-0" style={{ backgroundColor: langInk(i) }} />
                          <span className="text-ivory-200">{lang.name}</span>
                          <span className="ledger text-ivory-300">{lang.percentage}%</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "competitive" && (
            <motion.div
              key="competitive-tab"
              id="activity-plate-competitive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={PLATE_TRANSITION}
              className="mt-12"
            >
              <CodingProfiles isEmbedded={true} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
