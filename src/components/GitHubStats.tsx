"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Github, GitCommit, Flame, Code2, Star, GitBranch, Loader2, AlertCircle, Activity, Zap } from "lucide-react";
import CodingProfiles from "./CodingProfiles";

const GITHUB_USERNAME = "PreethamNimmagadda02";

/* ─── Known language colors (GitHub linguist) ─── */
const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  "C++": "#f34b7d",
  C: "#555555",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  Other: "#8b5cf6",
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
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  size: number;
}

interface StatsData {
  totalContributions: number;
  repoCount: number;
  highestDay: number;
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
  } catch (e) {
    return [];
  }
}

async function fetchUserProfile(): Promise<{ public_repos: number }> {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
    if (!res.ok) return { public_repos: 12 }; // Fallback count
    return res.json();
  } catch (e) {
    return { public_repos: 12 };
  }
}

/* ─── Streak calculator ─── */
function calculateMaxStreak(contributions: ContributionDay[]): number {
  let max = 0;
  let current = 0;

  // Sort contributions chronologically (oldest to newest)
  const sorted = [...contributions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const day of sorted) {
    if (day.count > 0) {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
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
  "rgba(255,255,255,0.04)",
  "rgba(139, 92, 246, 0.3)",
  "rgba(139, 92, 246, 0.55)",
  "rgba(168, 85, 247, 0.85)",
  "rgba(192, 132, 252, 1)",
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

  // Build a ~26-week grid from data, showing last 6 months up to today
  const heatmapGrid = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 6 months ago
    const rangeStart = new Date(today);
    rangeStart.setMonth(rangeStart.getMonth() - 12);
    // Align to start of that week (Sunday)
    const dayOfWeek = rangeStart.getDay();
    rangeStart.setDate(rangeStart.getDate() - dayOfWeek);
    rangeStart.setHours(0, 0, 0, 0);

    // Build date→level map
    const dateMap = new Map<string, number>();
    for (const d of data) {
      dateMap.set(d.date, d.level);
    }

    const weeks: number[][] = [];
    let currentWeek: number[] = [];

    // Fill in all days from rangeStart to today
    const iter = new Date(rangeStart);
    while (iter <= today) {
      const dateStr = iter.toISOString().split("T")[0];
      const level = dateMap.get(dateStr) ?? 0;
      currentWeek.push(level);

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
  }, [data]);

  // Compute month labels for the 6-month window
  const monthLabels = useMemo(() => {
    const today = new Date();
    const rangeStart = new Date(today);
    rangeStart.setMonth(rangeStart.getMonth() - 12);
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
  }, []);

  return (
    <div ref={ref} className="w-full pb-2">
      <div className="w-full flex flex-col">
        {/* Month labels */}
        <div className="flex mb-1 ml-8 relative w-full" style={{ height: 16 }}>
          {monthLabels.map((m) => {
            // weekIndex goes from 0 to ~52.
            // We can place it at a percentage of the width.
            const leftPercent = (m.weekIndex / heatmapGrid.length) * 100;
            return (
              <span
                key={m.label}
                className="text-[10px] text-gray-500 font-mono absolute transform -translate-x-1/2"
                style={{ left: `${leftPercent}%` }}
              >
                {m.label}
              </span>
            );
          })}
        </div>
        <div className="flex w-full justify-between">
          {/* Day labels */}
          <div className="flex flex-col justify-between mr-2 py-[2px]">
            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
              <span
                key={i}
                className="text-[9px] text-gray-600 font-mono flex items-center h-[11px]"
              >
                {d}
              </span>
            ))}
          </div>
          {/* Weeks */}
          <div className="flex flex-1 justify-between gap-1">
            {heatmapGrid.map((week, wk) => (
              <div key={wk} className="flex flex-col justify-between gap-1 flex-1">
                {Array.from({ length: 7 }).map((_, dy) => {
                  const level = dy < week.length ? week[dy] : -1;
                  if (level === -1) {
                    return <div key={dy} className="w-full aspect-square" />;
                  }
                  return (
                    <motion.div
                      key={dy}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{
                        delay: wk * 0.01 + dy * 0.005,
                        duration: 0.2,
                      }}
                      className="w-full aspect-square rounded-[2px]"
                      style={{
                        backgroundColor: cellColors[Math.min(level, 4)],
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-2">
          <span className="text-[10px] text-gray-500 mr-1">Less</span>
          {cellColors.slice(0, 4).map((c, i) => (
            <div
              key={i}
              className="w-[11px] h-[11px] rounded-[2px]"
              style={{ backgroundColor: c }}
            />
          ))}
          <span className="text-[10px] text-gray-500 ml-1">More</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Loading skeleton for stat cards ─── */
function StatSkeleton() {
  return (
    <div className="relative p-4 md:p-5 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 text-center animate-pulse">
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
      const currentYear = new Date().getFullYear();
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
      const highestDay = Math.max(0, ...filtered.map((c) => c.count));

      setStats({
        totalContributions,
        repoCount: profile.public_repos,
        highestDay,
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
      console.warn("GitHub data fetch failed (likely rate limited). Using fallback UI state.");
      setError("API Rate Limit Exceeded. Showing cached snapshot.");

      // Fallback data
      setStats({
        totalContributions: 1257,
        repoCount: 12,
        highestDay: 42,
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
    fetchData();
  }, [fetchData]);

  const statCards = useMemo(() => {
    if (!stats) return [];
    const cards = [
      {
        label: "Contributions",
        value: stats.totalContributions,
        icon: GitCommit,
        gradient: "from-purple-400 to-pink-400",
        suffix: "",
      },
      {
        label: "Best Day",
        value: stats.highestDay,
        icon: Zap,
        gradient: "from-blue-400 to-cyan-400",
        suffix: "",
      },
      {
        label: "Repositories",
        value: stats.repoCount,
        icon: GitBranch,
        gradient: "from-orange-400 to-red-400",
        suffix: "",
      },
      {
        label: "Active Days",
        value: stats.activeDays,
        icon: Flame,
        gradient: "from-yellow-400 to-amber-400",
        suffix: "",
      },
    ];
    return cards.sort((a, b) => b.value - a.value);
  }, [stats]);

  return (
    <section
      ref={sectionRef}
      id="github-stats"
      className="py-20 relative overflow-hidden"
    >
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4"
          >
            <Activity size={16} />
            <span>Coding Activity</span>
            {loading && (
              <Loader2 size={14} className="animate-spin text-purple-300" />
            )}
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3">
            {activeTab === "github" ? (
              <>GitHub <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">Activity</span></>
            ) : (
              <>Competitive <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-400">Programming</span></>
            )}
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            {activeTab === "github"
              ? "Consistency breeds excellence. Every purple square represents dedication."
              : "Live statistics fetched directly from global coding platforms."}
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
          <div className="flex justify-center mt-6 relative z-20">
            <div className="bg-zinc-900/80 p-1.5 rounded-full border border-white/10 backdrop-blur-md flex items-center">
              <button
                onClick={() => setActiveTab('github')}
                className={`px-5 py-2 rounded-full flex items-center gap-2 text-sm font-semibold transition-all ${activeTab === 'github' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Github size={16} /> GitHub
              </button>
              <button
                onClick={() => setActiveTab('competitive')}
                className={`px-5 py-2 rounded-full flex items-center gap-2 text-sm font-semibold transition-all ${activeTab === 'competitive' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Code2 size={16} /> Competitive
              </button>
            </div>
          </div>
        </motion.div>

        {activeTab === "github" && (
          <>
            {/* Stat Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                  <StatSkeleton key={i} />
                ))
                : statCards.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={
                      isInView ? { opacity: 1, y: 0, scale: 1 } : {}
                    }
                    transition={{
                      delay: 0.15 + i * 0.1,
                      duration: 0.5,
                      type: "spring",
                    }}
                    className="relative group"
                  >
                    <div
                      className={`absolute -inset-[1px] bg-gradient-to-r ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-60 blur-sm transition-opacity duration-500`}
                    />
                    <div className="relative p-4 md:p-5 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all text-center">
                      <stat.icon
                        size={22}
                        className="mx-auto mb-2 text-gray-400 group-hover:text-white transition-colors"
                      />
                      <div
                        className={`text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r ${stat.gradient}`}
                      >
                        <AnimatedCounter
                          value={stat.value}
                          suffix={stat.suffix}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wider">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
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
                <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/30 via-blue-500/20 to-pink-500/30 rounded-2xl opacity-50 group-hover:opacity-80 blur-sm transition-opacity duration-500" />
                <div className="relative p-6 md:p-8 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Code2 size={18} className="text-purple-400" />
                      Contribution Graph
                    </h3>
                    <span className="text-sm text-gray-500 font-mono">
                      Last 1 year
                    </span>
                  </div>
                  <div className="flex-grow flex items-center justify-center">
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
                      <div className="flex items-center justify-center h-32 text-gray-500 text-sm w-full">
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
                <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl opacity-40 group-hover:opacity-70 blur-sm transition-opacity duration-500" />
                <div className="relative p-6 md:p-8 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <Code2 size={18} className="text-blue-400" />
                    Top Languages
                  </h3>
                  <div className="flex-grow flex flex-col justify-center">
                    {loading ? (
                      <div className="space-y-3 w-full">
                        <div className="h-3 rounded-full bg-white/5 animate-pulse" />
                        <div className="flex gap-4">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-white/10 animate-pulse" />
                              <div className="w-16 h-3 rounded bg-white/10 animate-pulse" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex h-3 rounded-full overflow-hidden mb-6 bg-white/5 w-full">
                          {languages.map((lang, i) => (
                            <motion.div
                              key={lang.name}
                              initial={{ width: 0 }}
                              animate={
                                isInView ? { width: `${lang.percentage}%` } : {}
                              }
                              transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }}
                              className="h-full first:rounded-l-full last:rounded-r-full"
                              style={{ backgroundColor: lang.color }}
                            />
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-4 w-full">
                          {languages.map((lang) => (
                            <div key={lang.name} className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: lang.color }}
                              />
                              <span className="text-sm text-gray-300 font-medium">
                                {lang.name}
                              </span>
                              <span className="text-xs text-gray-500 font-mono">
                                {lang.percentage}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}

        {activeTab === "competitive" && (
          <CodingProfiles isEmbedded={true} />
        )}
      </div>
    </section>
  );
}
