#!/usr/bin/env node
/**
 * Copy check for the Obsidian Aurum voice. Runs as `prebuild`.
 *
 * Walks src and fails the build (exit 1) when any .ts, .tsx, .css, .json or
 * .mjs file contains:
 *   1. an em dash (U+2014) or an en dash (U+2013), anywhere, including
 *      comments, alt text, aria labels, title attributes and JSON; or
 *   2. a banned word, matched case-insensitively at word boundaries.
 *      "revolutionary" is not "revolutionize" and is left alone (it appears
 *      inside a verbatim third-party quote).
 *
 * Every hit is printed as file:line:column so it can be jumped to directly.
 */

import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const EXTENSIONS = new Set([".ts", ".tsx", ".css", ".json", ".mjs"]);
const SKIP_DIRS = new Set(["node_modules", ".next"]);

const EM_DASH = "—";
const EN_DASH = "–";

/* Word boundaries on both sides; common inflections included so a suffix
   cannot smuggle a banned word past the check. */
const BANNED = new RegExp(
  [
    "elevat(?:e|es|ed|ing)",
    "seamless(?:ly)?",
    "unleash(?:es|ed|ing)?",
    "next-gen",
    "revolutioni[sz](?:e|es|ed|ing)",
    "delv(?:e|es|ed|ing)",
    "tapestr(?:y|ies)",
    "empower(?:s|ed|ing|ment)?",
    "passionate(?:ly)?",
    "cutting-edge",
  ]
    .map((w) => `\\b${w}\\b`)
    .join("|"),
  "gi"
);

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walk(join(dir, entry.name));
    } else if (entry.isFile()) {
      const dot = entry.name.lastIndexOf(".");
      if (dot !== -1 && EXTENSIONS.has(entry.name.slice(dot))) {
        yield join(dir, entry.name);
      }
    }
  }
}

function checkLine(line) {
  const hits = [];
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === EM_DASH) hits.push({ column: i + 1, reason: "em dash (U+2014)" });
    else if (ch === EN_DASH) hits.push({ column: i + 1, reason: "en dash (U+2013)" });
  }
  BANNED.lastIndex = 0;
  let match;
  while ((match = BANNED.exec(line)) !== null) {
    hits.push({ column: match.index + 1, reason: `banned word "${match[0]}"` });
  }
  return hits.sort((a, b) => a.column - b.column);
}

async function main() {
  const problems = [];
  let files = 0;

  for await (const file of walk(SRC)) {
    files++;
    const text = await readFile(file, "utf8");
    const lines = text.split(/\r?\n/);
    const rel = relative(ROOT, file);
    lines.forEach((line, index) => {
      for (const hit of checkLine(line)) {
        problems.push(`${rel}:${index + 1}:${hit.column}: ${hit.reason}`);
      }
    });
  }

  if (problems.length > 0) {
    process.stderr.write(`[check-copy] ${problems.length} problem(s) in ${files} file(s):\n`);
    for (const p of problems) process.stderr.write(`  ${p}\n`);
    process.exit(1);
  }

  process.stdout.write(`[check-copy] ${files} files under src are clean: no dashes, no banned words.\n`);
}

main().catch((err) => {
  process.stderr.write(`[check-copy] failed to run: ${err?.message ?? err}\n`);
  process.exit(1);
});
