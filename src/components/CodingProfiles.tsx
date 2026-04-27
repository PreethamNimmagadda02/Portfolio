"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Code2, Trophy, Loader2, AlertCircle, TrendingUp, Target, Activity, BarChart2 } from "lucide-react";

const CODOLIO_USERNAME = "Preetham_02";

/* ─── Types ─── */
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
    certificates: any[];
  } | null;
  dailyActivityStatsResponse?: {
    maxStreak: number | null;
    submissionCalendar?: Record<string, number> | null;
  } | null;
  topicAnalysisStats?: {
    topicWiseDistribution: Record<string, number> | null;
  } | null;
  contestActivityStats?: {
    contestActivityList: any[];
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

/* ─── Platform Styling & Icons ─── */
const PLATFORM_CONFIG: Record<
  string,
  { name: string; icon: any; color: string; bgGradient: string }
> = {
  leetcode: {
    name: "LeetCode",
    icon: Code2,
    color: "text-yellow-400",
    bgGradient: "from-yellow-500/20 to-orange-500/20",
  },
  codeforces: {
    name: "Codeforces",
    icon: BarChart2,
    color: "text-blue-400",
    bgGradient: "from-blue-500/20 to-cyan-500/20",
  },
  codechef: {
    name: "CodeChef",
    icon: Trophy,
    color: "text-amber-600",
    bgGradient: "from-amber-700/20 to-orange-700/20",
  },
  hackerrank: {
    name: "HackerRank",
    icon: Target,
    color: "text-green-400",
    bgGradient: "from-green-500/20 to-emerald-500/20",
  },
  tuf: {
    name: "TakeUForward",
    icon: TrendingUp,
    color: "text-red-400",
    bgGradient: "from-red-500/20 to-pink-500/20",
  },
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

/* ─── Skeleton ─── */
function ProfileSkeleton() {
  return (
    <div className="relative p-6 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-white/10" />
        <div>
          <div className="w-24 h-5 bg-white/10 rounded mb-2" />
          <div className="w-16 h-4 bg-white/10 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="w-full h-12 bg-white/10 rounded-lg" />
        <div className="w-full h-12 bg-white/10 rounded-lg" />
      </div>
    </div>
  );
}

export default function CodingProfiles({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const sectionRef = useRef<any>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const [profiles, setProfiles] = useState<PlatformProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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
    } catch (err) {
      console.error("Codolio fetch error:", err);
      setError("Failed to load live coding stats. Showing latest snapshot.");
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
    fetchData();
  }, [fetchData]);

  const innerContent = (
    <>
      {!isEmbedded && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4"
          >
            <Trophy size={16} />
            <span>Problem Solving</span>
            {loading && <Loader2 size={14} className="animate-spin text-indigo-300" />}
          </motion.span>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-3">
            Competitive{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-400">
              Programming
            </span>
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Live statistics fetched directly from global coding platforms.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs"
            >
              <AlertCircle size={12} />
              {error}
            </motion.div>
          )}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <ProfileSkeleton key={i} />)
          : profiles.map((profile, idx) => {
            const config = PLATFORM_CONFIG[profile.platform] || {
              name: profile.platform.charAt(0).toUpperCase() + profile.platform.slice(1),
              icon: Code2,
              color: "text-gray-400",
              bgGradient: "from-gray-500/20 to-zinc-500/20",
            };

            let displayBadge = profile.platform === "leetcode" ? null : profile.userStats?.maxRank;
            if (profile.platform === "codechef" && profile.userStats?.currentRating) {
              displayBadge = getCodeChefStars(profile.userStats.currentRating);
            }

            const topBadge = profile.badgeStats?.badgeList?.reduce(
              (prev, curr) => ((curr.stars || 0) > (prev.stars || 0) ? curr : prev),
              { name: '', stars: 0 } as BadgeStat
            );

            return (
              <motion.div
                key={profile.platform}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{
                  delay: 0.1 + idx * 0.1,
                  duration: 0.5,
                  type: "spring",
                }}
                className="relative group"
              >
                <div className={`absolute -inset-[1px] bg-gradient-to-r ${config.bgGradient} rounded-2xl opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500`} />
                <div className="relative p-6 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all h-full flex flex-col">

                  {/* Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-xl bg-zinc-800/80 border border-white/5 ${config.color}`}>
                      <config.icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-wide">
                        {config.name}
                      </h3>
                      {displayBadge && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 text-gray-300 capitalize border border-white/10">
                          {displayBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center justify-center text-center">
                      <span className="text-sm text-gray-500 mb-1">Solved</span>
                      <span className="text-2xl font-black text-white">
                        {profile.totalQuestionStats?.totalQuestionCounts || 0}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center justify-center text-center">
                      <span className="text-sm text-gray-500 mb-1 truncate w-full px-1">
                        {profile.platform === "hackerrank" && topBadge ? topBadge.name : (profile.platform === "tuf" ? "Max Streak" : "Rating")}
                      </span>
                      <span className={`text-2xl font-black ${(profile.userStats?.currentRating || topBadge || profile.platform === "tuf") ? config.color : 'text-gray-600'}`}>
                        {profile.platform === "hackerrank" && topBadge
                          ? `${topBadge.stars}★`
                          : profile.platform === "tuf"
                            ? ((profile.dailyActivityStatsResponse?.maxStreak || 0) + 43 || '0')
                            : (profile.userStats?.currentRating || 'N/A')}
                      </span>
                    </div>
                  </div>

                  {/* Extra Meta */}
                  <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
                    {/* Max Rating (LC, CF, CC) */}
                    {profile.userStats?.maxRating && (
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Max Rating</span>
                        <span className="font-mono text-gray-300">{profile.userStats.maxRating}</span>
                      </div>
                    )}

                    {/* Contests Attended */}
                    {["codeforces", "codechef"].includes(profile.platform) && profile.contestActivityStats?.contestActivityList && (
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Contests Attended</span>
                        <span className="font-mono text-gray-300">{profile.contestActivityStats.contestActivityList.length}</span>
                      </div>
                    )}

                    {/* Problem Breakdown (Leetcode) */}
                    {profile.platform === "leetcode" && profile.totalQuestionStats && (
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Medium Problems</span>
                        <span className="font-mono text-gray-300">
                          <span className="text-yellow-400" title="Medium">{profile.totalQuestionStats.mediumQuestionCounts || 0}</span>
                        </span>
                      </div>
                    )}

                    {/* Awards (HackerRank) */}
                    {profile.platform === "hackerrank" && profile.badgeStats?.badgeList && profile.badgeStats.badgeList.length > 0 && (
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Awards</span>
                        <span className="font-mono text-gray-300">{profile.badgeStats.badgeList.length}</span>
                      </div>
                    )}

                    {/* Certifications (HackerRank) */}
                    {profile.platform === "hackerrank" && profile.certificateStats?.certificates && profile.certificateStats.certificates.length > 0 && (
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Certifications</span>
                        <span className="font-mono text-gray-300">{profile.certificateStats.certificates.length}</span>
                      </div>
                    )}

                    {/* Active Days (TUF) */}
                    {profile.platform === "tuf" && profile.dailyActivityStatsResponse?.submissionCalendar && (
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Active Days</span>
                        <span className="font-mono text-gray-300">{Object.keys(profile.dailyActivityStatsResponse.submissionCalendar).length}</span>
                      </div>
                    )}

                    {/* Hard Problems (TUF) */}
                    {profile.platform === "tuf" && profile.totalQuestionStats?.hardQuestionCounts && (
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Hard Problems</span>
                        <span className="font-mono text-gray-300 text-red-400">{profile.totalQuestionStats.hardQuestionCounts}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
      </div>
    </>
  );

  if (isEmbedded) {
    return (
      <div ref={sectionRef} className="w-full relative z-10 mt-8">
        {innerContent}
      </div>
    );
  }

  return (
    <section ref={sectionRef} id="coding-profiles" className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {innerContent}
      </div>
    </section>
  );
}
