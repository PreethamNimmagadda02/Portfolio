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
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const EXTENSIONS = new Set([".ts", ".tsx", ".css", ".json", ".mjs"]);

const EM_DASH = "—";
const DASHES = /[—–]/g;

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

function checkLine(line) {
  const hits = [];
  for (const m of line.matchAll(DASHES)) {
    hits.push({ column: m.index + 1, reason: m[0] === EM_DASH ? "em dash (U+2014)" : "en dash (U+2013)" });
  }
  for (const m of line.matchAll(BANNED)) hits.push({ column: m.index + 1, reason: `banned word "${m[0]}"` });
  return hits.sort((a, b) => a.column - b.column);
}

async function main() {
  const files = (await readdir(SRC, { recursive: true })).filter((f) => EXTENSIONS.has(extname(f)));
  const problems = [];

  for (const file of files) {
    const path = join(SRC, file);
    const lines = (await readFile(path, "utf8")).split(/\r?\n/);
    const rel = relative(ROOT, path);
    lines.forEach((line, index) => {
      for (const hit of checkLine(line)) problems.push(`${rel}:${index + 1}:${hit.column}: ${hit.reason}`);
    });
  }

  if (problems.length > 0) {
    process.stderr.write(`[check-copy] ${problems.length} problem(s) in ${files.length} file(s):\n`);
    for (const p of problems) process.stderr.write(`  ${p}\n`);
    process.exit(1);
  }

  process.stdout.write(`[check-copy] ${files.length} files under src are clean: no dashes, no banned words.\n`);
}

main().catch((err) => {
  process.stderr.write(`[check-copy] failed to run: ${err?.message ?? err}\n`);
  process.exit(1);
});
