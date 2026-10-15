import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Added to eslint-config-next's own ignores (.next, out, build, next-env.d.ts).
  globalIgnores([
    // Local tooling directories (Claude Code worktrees, Repowise index,
    // Graphify output, session memory). Never authored source.
    ".claude/**",
    ".repowise/**",
    "graphify-out/**",
    ".agents/**",
    ".superpowers/**",
    ".remember/**",
  ]),
]);

export default eslintConfig;
