import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // next-pwa writes its service worker + workbox runtime into public/ at
    // build time. They're generated, minified vendor output, not authored
    // source, and were never meant to be linted.
    "public/sw.js",
    "public/workbox-*.js",
  ]),
]);

export default eslintConfig;
