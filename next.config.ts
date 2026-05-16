import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    // Static export requires unoptimized: true (Next.js image optimisation
    // requires a server). formats/deviceSizes are ignored when unoptimized.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "framerusercontent.com",
      },
    ],
  },
  experimental: {
    optimizeCss: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Isolate the entire 3D stack into one long-lived cacheable chunk.
            // Matches three, @react-three/fiber, @react-three/drei (and any sub-packages).
            three: {
              test: /[\\/]node_modules[\\/](three|@react-three[\\/]fiber|@react-three[\\/]drei)[\\/]/,
              name: 'three-vendor',
              priority: 20,
              enforce: true,
              chunks: 'all',
            },
            framer: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'framer-motion',
              priority: 15,
              enforce: true,
              chunks: 'all',
            },
            lucide: {
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              name: 'lucide-icons',
              priority: 10,
              enforce: true,
              chunks: 'all',
            },
          },
        },
      };
    }
    return config;
  },
};

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
});

export default withPWA(nextConfig);
