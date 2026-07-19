"use client";

import { motion, useInView, AnimatePresence } from "@/lib/motion";
import { useRef, useState, useEffect, useMemo, useCallback, type CSSProperties } from "react";
import { Github, GitCommit, Flame, Code2, GitBranch, Loader2, AlertCircle, Activity, Zap, ExternalLink } from "lucide-react";
import CodingProfiles from "./CodingProfiles";
import { useIsMobile } from "@/hooks/use-mobile";
import { InViewClass, SectionKicker } from "./Reveal";

const GITHUB_USERNAME = "PreethamNimmagadda02";

/* ─── Known language colors (GitHub linguist) ─── */
const LANG_COLORS: Record<string, string> = {
  TypeScript: "#c9974a",
  JavaScript: "#d3a662",
  Python: "#ad7f3c",
  "C++": "#e2bd85",
  C: "#8a6530",
  Java: "#c9974a",
  Go: "#d3a662",
  Rust: "#ad7f3c",
  HTML: "#e2bd85",
  CSS: "#8a6530",
  Shell: "#c9974a",
  Dockerfile: "#d3a662",
  Other: "#ad7f3c",
};

/* ─── Types ─── */
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
  latestRepo: string;
  activeDays: number;
}

interface LanguageData {
  name: string;
  percentage: number;
  color: string;
}

/* ─── Data fetching ─── */
async function fetchContributions(): Promise<ContributionsResponse> {
  const today = new Date();
  const currentYear = today.getFullYear();
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 12);
  const prevYear = sixMonthsAgo.getFullYear();

  // Fetch current year
  const res = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=${currentYear}`
  );
  if (!res.ok) throw new Error("Failed to fetch contributions");
  const data: ContributionsResponse = await res.json();

  // If 6-month window crosses into previous year, fetch that too
  if (prevYear < currentYear) {
    const resPrev = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=${prevYear}`
    );
    if (resPrev.ok) {
      const prevData: ContributionsResponse = await resPrev.json();
      data.contributions = [...prevData.contributions, ...data.contributions];
      data.total = { ...prevData.total, ...data.total };
    }
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

/* ─── Language aggregation (by repo count) ─── */
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
    color: LANG_COLORS[name] || LANG_COLORS.Other,
  }));

  if (otherCount > 0) {
    languages.push({
      name: "Other",
      percentage: Math.round((otherCount / total) * 100),
      color: LANG_COLORS.Other,
    });
  }

  // Normalize to 100%
  const percentSum = languages.reduce((s, l) => s + l.percentage, 0);
  if (percentSum !== 100 && languages.length > 0) {
    languages[0].percentage += 100 - percentSum;
  }

  return languages;
}

/* ─── Cell colors for heatmap ─── */
const cellColors = [
  "rgba(245, 241, 234, 0.06)",
  "rgba(201, 151, 74, 0.25)",
  "rgba(201, 151, 74, 0.45)",
  "rgba(201, 151, 74, 0.7)",
  "rgba(201, 151, 74, 0.95)",
];

/* ─── Animated counter ─── */
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const start = Date.now();
    let frameId: number;
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(value * eased));
      if (progress < 1) frameId = requestAnimationFrame(animate);
      else setDisplayValue(value);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Contribution Heatmap ─── */
function ContributionHeatmap({ data }: { data: ContributionDay[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const isMobile = useIsMobile();
  // 12 months of weekly columns is ~1px per cell at 320px wide.
  // Mobile shows the last 6 months so cells stay visible and tappable.
  const monthsBack = isMobile ? 6 : 12;

  // Build a weekly grid from data up to today
  const heatmapGrid = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rangeStart = new Date(today);
    rangeStart.setMonth(rangeStart.getMonth() - monthsBack);
    // Align to start of that week (Sunday)
    const dayOfWeek = rangeStart.getDay();
    rangeStart.setDate(rangeStart.getDate() - dayOfWeek);
    rangeStart.setHours(0, 0, 0, 0);

    // Build date→data map
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

    return weeks;
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

  return (
    <div ref={ref} className="w-full pb-2">
      <div className="w-full flex flex-col">
        {/* Month labels — sparser on mobile to avoid collisions */}
        <div className="flex mb-1 ml-0 sm:ml-8 relative w-full" style={{ height: 16 }}>
          {monthLabels
            .filter((_, i) => !isMobile || i % 2 === 0)
            .map((m, i) => {
              const leftPercent = (m.weekIndex / heatmapGrid.length) * 100;
              return (
                <span
                  key={`${m.label}-${i}`}
                  className="text-[10px] text-gray-500 font-medium absolute transform -translate-x-1/2"
                  style={{ left: `${leftPercent}%` }}
                >
                  {m.label}
                </span>
              );
            })}
        </div>
        <div className="flex w-full justify-between">
          {/* Day labels — hidden on mobile (unreadable at 9px, steals width) */}
          <div className="hidden sm:flex flex-col justify-between mr-2 py-[2px]">
            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
              <span
                key={i}
                className="text-[9px] text-gray-600 font-medium flex items-center h-[11px]"
              >
                {d}
              </span>
            ))}
          </div>
          {/* Weeks */}
          <div className="flex flex-1 justify-between gap-[2px] sm:gap-1">
            {heatmapGrid.map((week, wk) => (
              <div key={wk} className="flex flex-col justify-between gap-[2px] sm:gap-1 flex-1">
                {Array.from({ length: 7 }).map((_, dy) => {
                  const day = dy < week.length ? week[dy] : null;
                  if (!day) {
                    return <div key={dy} className="w-full aspect-square" />;
                  }
                  return (
                    <div
                      key={dy}
                      title={`${day.count} contributions on ${day.date}`}
                      className={
                        "w-full aspect-square rounded-[3px] hover:ring-2 hover:ring-white/50 transition-all cursor-crosshair z-10 hover:z-20 hover:scale-125" +
                        (isInView ? " cell-in" : " opacity-0")
                      }
                      style={{
                        backgroundColor: cellColors[Math.min(day.level, 4)],
                        "--d": `${(wk * 5 + dy * 5) % 600}ms`,
                      } as CSSProperties}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4">
          <span className="text-[10px] text-gray-500 font-medium mr-1">Less</span>
          {cellColors.slice(0, 5).map((c, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-[3px]"
              style={{ backgroundColor: c }}
            />
          ))}
          <span className="text-[10px] text-gray-500 font-medium ml-1">More</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Loading skeleton for stat cards ─── */
function StatSkeleton() {
  return (
    <div className="relative p-4 md:p-5 rounded-2xl bg-zinc-900/90 border border-white/10 text-center animate-pulse">
      <div className="w-6 h-6 mx-auto mb-2 rounded bg-white/10" />
      <div className="h-8 w-20 mx-auto rounded bg-white/10 mb-2" />
      <div className="h-3 w-16 mx-auto rounded bg-white/10" />
    </div>
  );
}

/* ─── Main Component ─── */
export default function GitHubStats() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  // Defer the 4 GitHub API calls until the section approaches the viewport —
  // previously they fired at page load, competing with critical resources
  // and burning unauthenticated rate limit on every visit.
  const shouldFetch = useInView(sectionRef, { once: true, margin: "600px" });

  const [stats, setStats] = useState<StatsData | null>(null);
  const [languages, setLanguages] = useState<LanguageData[]>([]);
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"github" | "competitive">("github");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [contribData, repos, profile] = await Promise.all([
        fetchContributions(),
        fetchRepos(),
        fetchUserProfile(),
      ]);

      // Calculate stats
      const totalContributions = Object.values(contribData.total).reduce(
        (sum, v) => sum + v,
        0
      );
      // Filter contributions to last 1 year up to today
      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setMonth(oneYearAgo.getMonth() - 12);
      const filtered = contribData.contributions.filter((c) => {
        const d = new Date(c.date);
        return d >= oneYearAgo && d <= today;
      });
      setContributions(filtered);

      const activeDays = filtered.filter((c) => c.count > 0).length;
      const latestRepo = repos.length > 0 ? repos[0].name : "N/A";

      setStats({
        totalContributions,
        repoCount: profile.public_repos,
        latestRepo,
        activeDays,
      });

      const aggregatedLangs = aggregateLanguages(repos);
      if (aggregatedLangs.length === 0) {
        // Fallback if repos failed due to rate limits
        setLanguages([
          { name: "TypeScript", percentage: 50, color: "#3178c6" },
          { name: "JavaScript", percentage: 40, color: "#f1e05a" },
          { name: "Python", percentage: 10, color: "#3572A5" },
        ]);
      } else {
        setLanguages(aggregatedLangs);
      }
    } catch (err) {
      console.warn("GitHub data fetch failed (likely rate limited). Using fallback UI state.", err);
      setError("API Rate Limit Exceeded. Showing cached snapshot.");

      // Fallback data
      setStats({
        totalContributions: 1257,
        repoCount: 12,
        latestRepo: "portfolio",
        activeDays: 245,
      });
      setLanguages([
        { name: "TypeScript", percentage: 42, color: "#3178c6" },
        { name: "JavaScript", percentage: 25, color: "#f1e05a" },
        { name: "Python", percentage: 17, color: "#3572A5" },
        { name: "Other", percentage: 16, color: "#8b5cf6" },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (shouldFetch) fetchData();
  }, [shouldFetch, fetchData]);

  const statCards = useMemo(() => {
    if (!stats) return [];
    
    const repoLink = stats.latestRepo && stats.latestRepo !== "portfolio" 
        ? `https://github.com/${GITHUB_USERNAME}/${stats.latestRepo}`
        : `https://github.com/${GITHUB_USERNAME}`;

    return [
      {
        label: "Contributions",
        value: stats.totalContributions,
        icon: GitCommit,
        gradient: "from-purple-400 to-pink-400",
        suffix: "",
        href: `https://github.com/${GITHUB_USERNAME}`,
      },
      {
        label: "Active Days",
        value: stats.activeDays,
        icon: Flame,
        gradient: "from-yellow-400 to-amber-400",
        suffix: "",
        href: `https://github.com/${GITHUB_USERNAME}`,
      },
      {
        label: "Repositories",
        value: stats.repoCount,
        icon: GitBranch,
        gradient: "from-orange-400 to-red-400",
        suffix: "",
        href: `https://github.com/${GITHUB_USERNAME}?tab=repositories`,
      },
      {
        label: "Latest Commit",
        value: stats.latestRepo,
        isText: true,
        icon: Zap,
        gradient: "from-blue-400 to-cyan-400",
        suffix: "",
        href: repoLink,
      },
    ];
  }, [stats]);

  return (
    <section
      ref={sectionRef}
      id="github-stats"
      className="relative w-full py-10 md:py-14 overflow-visible"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 25% 30%, rgba(168,85,247,0.06), transparent 45%), radial-gradient(circle at 75% 70%, rgba(59,130,246,0.05), transparent 45%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-2"
          >
            <Activity size={16} />
            <span>Coding Activity</span>
            {loading && (
              <Loader2 size={14} className="animate-spin text-purple-300" />
            )}
          </motion.span>
          <InViewClass as="div">
            <SectionKicker num="05" label="Activity" />
            <h2 className="text-display text-3xl md:text-4xl text-white mb-1">
              <span className="line-mask">
                <span className="line-rise">
                  {activeTab === "github" ? (
                    <>GitHub <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 via-pink-400 to-blue-400">Activity</span></>
                  ) : (
                    <>Competitive <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-cyan-400 to-blue-400">Programming</span></>
                  )}
                </span>
              </span>
            </h2>
          </InViewClass>
          <p className="text-gray-400 text-sm max-w-lg mx-auto">
            {activeTab === "github"
              ? "A year of commits and contribution streaks, pulled live from GitHub."
              : "Live ratings and rankings, pulled directly from each platform."}
          </p>

          {error && activeTab === "github" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs"
            >
              <AlertCircle size={12} />
              {error}
            </motion.div>
          )}

          {/* Toggle Button */}
          <div className="flex justify-center mt-4 relative z-20">
            <div className="bg-black/70 p-1.5 rounded-full border border-white/10 flex items-center relative shadow-xl">
              {(["github", "competitive"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  aria-pressed={activeTab === tab}
                  aria-label={tab === "github" ? "Show GitHub stats" : "Show competitive programming stats"}
                  className={`relative px-4 sm:px-6 py-2.5 rounded-full flex items-center gap-2 text-xs sm:text-sm font-bold transition-all z-10 ${activeTab === tab ? "text-white" : "text-gray-300 hover:text-white"
                    }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="active-tab-indicator"
                      className="absolute inset-0 bg-white/10 rounded-full z-[-1] border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  {tab === "github" ? (
                    <><Github size={16} /> GitHub</>
                  ) : (
                    <><Code2 size={16} /> Competitive</>
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "github" && (
            <motion.div
              key="github-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Stat Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8"
              >
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <StatSkeleton key={i} />
                  ))
                  : statCards.map((stat, i) => (
                    <motion.a
                      href={stat.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={stat.label}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                      transition={{
                        delay: 0.15 + i * 0.1,
                        duration: 0.5,
                        type: "spring",
                      }}
                      className="relative group block cursor-pointer"
                    >
                      <div className={`absolute -inset-px bg-linear-to-r ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500`} />
                      <div className="relative p-4 sm:p-5 md:p-6 rounded-2xl bg-zinc-900/95 border border-white/10 group-hover:border-transparent transition-all text-center h-full flex flex-col items-center justify-center shadow-2xl">
                        <div className={`p-3 rounded-full bg-white/5 mb-3 group-hover:scale-110 transition-transform duration-500`}>
                          <stat.icon
                            size={24}
                            className="text-gray-300 group-hover:text-white transition-colors"
                          />
                        </div>
                        <div className={`text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-linear-to-r ${stat.gradient} drop-shadow-sm`}>
                          {stat.isText ? (
                               <span
                                 className="block text-2xl md:text-3xl mx-auto text-center wrap-break-word"
                                 title={String(stat.value)}
                               >
                              {stat.value}
                            </span>
                          ) : (
                            <AnimatedCounter value={Number(stat.value)} suffix={stat.suffix} />
                          )}
                        </div>
                        <p className="text-xs text-gray-300 mt-2 font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                          {stat.label}
                        </p>
                      </div>
                    </motion.a>
                  ))}
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contribution Heatmap */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="lg:col-span-2 relative group flex flex-col"
                >
                  <div className="absolute -inset-px bg-linear-to-r from-purple-500/30 via-blue-500/20 to-pink-500/30 rounded-2xl opacity-50 group-hover:opacity-80 blur-sm transition-opacity duration-500" />
                  <div className="relative p-4 sm:p-6 md:p-8 rounded-2xl bg-zinc-900/90 border border-white/10 flex flex-col grow">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Code2 size={18} className="text-purple-400" />
                        Contribution Graph
                      </h3>
                      <a
                        href={`https://github.com/${GITHUB_USERNAME}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 p-2 -m-2 text-sm text-gray-300 hover:text-purple-400 transition-colors font-medium"
                      >
                        <span className="hidden sm:inline">View on GitHub</span>
                        <span className="sm:hidden">GitHub</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                    <div className="grow flex items-center justify-center">
                      {loading ? (
                        <div className="flex items-center justify-center h-32 w-full">
                          <Loader2
                            size={24}
                            className="animate-spin text-purple-400"
                          />
                        </div>
                      ) : contributions.length > 0 ? (
                        <ContributionHeatmap data={contributions} />
                      ) : (
                        <div className="flex items-center justify-center h-32 text-gray-300 text-sm w-full">
                          No contribution data available
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Languages */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.45 }}
                  className="relative group flex flex-col"
                >
                  <div className="absolute -inset-px bg-linear-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl opacity-40 group-hover:opacity-70 blur-sm transition-opacity duration-500" />
                  <div className="relative p-6 md:p-8 rounded-2xl bg-zinc-900/90 border border-white/10 flex flex-col grow">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <Code2 size={18} className="text-blue-400" />
                      Top Languages
                    </h3>
                    <div className="grow flex flex-col justify-center">
                      {loading ? (
                        <div className="space-y-4 w-full">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-1.5">
                              <div className="w-20 h-3 rounded bg-white/10 animate-pulse" />
                              <div className="h-2.5 rounded-full bg-white/5 animate-pulse" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4 w-full">
                          {languages.map((lang, i) => (
                            <motion.div
                              key={lang.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={isInView ? { opacity: 1, x: 0 } : {}}
                              transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                                    style={{ backgroundColor: lang.color }}
                                  />
                                  <span className="text-sm text-gray-300 font-semibold">
                                    {lang.name}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500 font-bold tabular-nums">
                                  {lang.percentage}%
                                </span>
                              </div>
                              <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={isInView ? { width: `${lang.percentage}%` } : {}}
                                  transition={{ delay: 0.6 + i * 0.1, duration: 1, type: "spring", damping: 20 }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: lang.color }}
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === "competitive" && (
            <motion.div
              key="competitive-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <CodingProfiles isEmbedded={true} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
