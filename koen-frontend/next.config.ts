import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set turbopack root to silence lockfile warning
  turbopack: {
    root: __dirname,
  },

  // Disable static optimization for pages that use client-side wallet
  // This prevents SSR errors during build
  experimental: {
    // @ts-ignore
    optimizePackageImports: ['@stacks/connect', '@stacks/connect-react'],
  },

  // Don't try to statically generate pages during build
  // This is needed for pages that use wallet libraries
  output: 'standalone',
};

export default nextConfig;
