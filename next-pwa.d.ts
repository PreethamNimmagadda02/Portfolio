// `next-pwa` ships no type declarations of its own. This ambient module
// declaration lets `next.config.ts` `import` it (instead of `require`,
// which `@typescript-eslint/no-require-imports` flags) without TypeScript
// erroring on the missing types.
declare module "next-pwa";
