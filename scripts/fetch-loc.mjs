#!/usr/bin/env node
/**
 * Computes lifetime lines-added/deleted authored by GITHUB_USERNAME across
 * their non-fork public repos and writes src/data/github-loc.json.
 *
 * Runs as `prebuild`. GitHub has no endpoint for lifetime LOC — the only
 * source is /repos/{o}/{r}/stats/contributors, which costs one request per
 * repo and so blows past the 60/hr unauthenticated ceiling the browser-side
 * fetch lives under. With CI's GITHUB_TOKEN (5000/hr) it always resolves
 * here, so the JSON this writes is the fallback the client uses when its own
 * live attempt gets limited.
 *
 * This never fails the build: on any error the existing JSON is left alone.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GITHUB_USERNAME = "PreethamNimmagadda02";
const OUT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../src/data/github-loc.json"
);

/**
 * Repos that vendor a third-party source tree. /stats/contributors credits
 * every line in every commit to whoever pushed it, so a repo holding someone
 * else's codebase reports millions of additions that were never authored here.
 * No heuristic can catch these — the vendored code *is* the tree, so it looks
 * self-consistent. They have to be named.
 */
const EXCLUDED_REPOS = new Map([
  ["agentic-vs-code", "vendors the microsoft/vscode + cline source trees"],
]);

/**
 * Catches the other inflation mode: generated files (node_modules, lockfiles,
 * build output) committed and later removed. Unlike /languages, the stats
 * endpoint ignores linguist's vendoring rules, so history stays inflated long
 * after the files are gone. A repo whose authored additions dwarf the code
 * actually in its tree is reporting churn, not authorship.
 */
const CHURN_RATIO = 20;
const CHURN_MIN_ADDITIONS = 100_000;
/** Rough bytes-per-line, used only to turn linguist byte counts into a scale. */
const BYTES_PER_LINE = 35;

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const MAX_AGE_MS = 1000 * 60 * 60 * 12;
const BATCH_SIZE = 8;
/** /stats/contributors returns 202 while GitHub builds its cache. */
const STATS_ATTEMPTS = 6;
const STATS_RETRY_MS = 2500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function log(msg) {
  process.stdout.write(`[fetch-loc] ${msg}\n`);
}

async function gh(path) {
  return fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": `${GITHUB_USERNAME}-portfolio-build`,
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
}

async function readExisting() {
  try {
    return JSON.parse(await readFile(OUT_PATH, "utf8"));
  } catch {
    return null;
  }
}

async function listRepos() {
  const repos = [];
  for (let page = 1; page <= 5; page++) {
    const res = await gh(
      `/users/${GITHUB_USERNAME}/repos?per_page=100&type=owner&page=${page}`
    );
    if (!res.ok) throw new Error(`repos page ${page}: HTTP ${res.status}`);
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos.filter((r) => !r.fork && !r.archived);
}

/**
 * Approximate lines currently in a repo's tree, per linguist — which *does*
 * exclude vendored and generated paths. Used as the scale check on additions.
 */
async function treeLines(repoName) {
  const res = await gh(`/repos/${GITHUB_USERNAME}/${repoName}/languages`);
  if (!res.ok) return null;
  const langs = await res.json().catch(() => null);
  if (!langs || typeof langs !== "object") return null;
  const bytes = Object.values(langs).reduce((s, v) => s + (Number(v) || 0), 0);
  return Math.round(bytes / BYTES_PER_LINE);
}

/** @returns {Promise<{added: number, deleted: number} | null>} null = unknown */
async function authoredLines(repoName) {
  for (let attempt = 1; attempt <= STATS_ATTEMPTS; attempt++) {
    const res = await gh(
      `/repos/${GITHUB_USERNAME}/${repoName}/stats/contributors`
    );

    // Stats cache is cold; GitHub is computing it in the background.
    if (res.status === 202) {
      await sleep(STATS_RETRY_MS * attempt);
      continue;
    }
    // Empty repo.
    if (res.status === 204) return { added: 0, deleted: 0 };
    if (!res.ok) {
      log(`  ${repoName}: HTTP ${res.status}, skipping`);
      return null;
    }

    const body = await res.json().catch(() => null);
    if (!Array.isArray(body)) return null;

    const mine = body.find(
      (c) =>
        c?.author?.login?.toLowerCase() === GITHUB_USERNAME.toLowerCase()
    );
    if (!mine || !Array.isArray(mine.weeks)) return { added: 0, deleted: 0 };

    return mine.weeks.reduce(
      (acc, w) => ({
        added: acc.added + (w.a || 0),
        deleted: acc.deleted + (w.d || 0),
      }),
      { added: 0, deleted: 0 }
    );
  }
  log(`  ${repoName}: stats still computing after ${STATS_ATTEMPTS} tries`);
  return null;
}

async function main() {
  const existing = await readExisting();

  if (process.env.SKIP_LOC_FETCH === "1") {
    log("SKIP_LOC_FETCH=1, keeping existing snapshot");
    return;
  }
  if (existing?.generatedAt) {
    const age = Date.now() - Date.parse(existing.generatedAt);
    if (Number.isFinite(age) && age >= 0 && age < MAX_AGE_MS) {
      log(
        `snapshot is ${Math.round(age / 3600000)}h old (< 12h), keeping it`
      );
      return;
    }
  }
  if (!TOKEN && existing) {
    // Unauthenticated needs 1 request per repo against a 60/hr budget, and a
    // partial result is worse than a slightly stale one.
    log("no GITHUB_TOKEN, keeping existing snapshot");
    return;
  }

  log(TOKEN ? "fetching with token" : "fetching unauthenticated (may fail)");
  const repos = await listRepos();
  log(`${repos.length} non-fork repos`);

  let added = 0;
  let deleted = 0;
  let counted = 0;
  let rawAdded = 0;
  const excluded = [];

  for (let i = 0; i < repos.length; i += BATCH_SIZE) {
    const slice = repos.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      slice.map(async (repo) => {
        const skipReason = EXCLUDED_REPOS.get(repo.name.toLowerCase());
        const [stats, tree] = await Promise.all([
          authoredLines(repo.name).catch(() => null),
          skipReason ? null : treeLines(repo.name).catch(() => null),
        ]);
        return { repo: repo.name, stats, tree, skipReason };
      })
    );

    for (const { repo, stats, tree, skipReason } of results) {
      if (!stats) continue;
      rawAdded += stats.added;

      const reason =
        skipReason ??
        (tree !== null &&
        stats.added >= CHURN_MIN_ADDITIONS &&
        stats.added > tree * CHURN_RATIO
          ? `additions (${stats.added.toLocaleString()}) are ${Math.round(
              stats.added / Math.max(tree, 1)
            )}x the ~${tree.toLocaleString()} lines in its tree — generated-file churn`
          : null);

      if (reason) {
        excluded.push({ repo, added: stats.added, reason });
        log(`  excluded ${repo}: ${reason}`);
        continue;
      }

      added += stats.added;
      deleted += stats.deleted;
      counted++;
    }
  }

  if (counted === 0) throw new Error("no repo stats resolved");

  const out = {
    username: GITHUB_USERNAME,
    linesAdded: added,
    linesDeleted: deleted,
    reposCounted: counted,
    reposTotal: repos.length,
    // Kept so the headline number stays auditable: what the raw API reported,
    // and exactly which repos were dropped from it and why.
    linesAddedUnfiltered: rawAdded,
    excluded,
    excludedRepos: excluded.map((e) => e.repo),
    generatedAt: new Date().toISOString(),
  };

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  log(
    `+${added.toLocaleString()} / -${deleted.toLocaleString()} across ${counted}/${repos.length} repos` +
      ` (${excluded.length} excluded, ${rawAdded.toLocaleString()} raw)`
  );
}

main().catch(async (err) => {
  log(`failed: ${err.message}`);
  const existing = await readExisting();
  if (existing) {
    log("keeping existing snapshot");
    return;
  }
  // First run with nothing to fall back on — write a zeroed file so the
  // import resolves and the UI can hide the card instead of crashing.
  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(
    OUT_PATH,
    `${JSON.stringify(
      {
        username: GITHUB_USERNAME,
        linesAdded: 0,
        linesDeleted: 0,
        reposCounted: 0,
        reposTotal: 0,
        linesAddedUnfiltered: 0,
        excluded: [],
        excludedRepos: [],
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    )}\n`,
    "utf8"
  );
});
