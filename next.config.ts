import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    // Static export requires unoptimized: true (Next.js image optimisation
    // requires a server).
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Isolate the entire 3D stack into one long-lived cacheable chunk.
            // Matches three and @react-three/fiber (and any sub-packages).
            three: {
              test: /[\\/]node_modules[\\/](three|@react-three[\\/]fiber)[\\/]/,
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
            phosphor: {
              test: /[\\/]node_modules[\\/]@phosphor-icons[\\/]/,
              name: 'phosphor-icons',
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

export default nextConfig;
