import type { NextConfig } from 'next';

/**
 * Next.js configuration for Trillium Finance modern app.
 * - Uses the App Router (`app/` directory).
 * - Enables TypeScript strict mode via tsconfig (handled separately).
 * - Enables SWC compiler and experimental React Server Components support.
 */
const nextConfig: NextConfig = {

  // Tailwind CSS will purge unused classes based on the `content` field in tailwind.config.ts.
  // No further custom webpack config needed.
  // Environment variables will be available at runtime via process.env.
  // For GCP Cloud Run we expose them as secrets.
  // Enable ESLint during dev.
  eslint: {
    // Run ESLint during `next lint`
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
