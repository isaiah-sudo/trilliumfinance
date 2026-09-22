import type { NextConfig } from 'next';

/**
 * Next.js configuration for Trillium Finance modern app.
 * - Uses the App Router (`app/` directory).
 * - Enables TypeScript strict mode via tsconfig (handled separately).
 * - Enables SWC compiler and experimental React Server Components support.
 */
const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion', 'date-fns'],
  },

  // Tailwind CSS will purge unused classes based on the `content` field in tailwind.config.ts.
  // No further custom webpack config needed.
  // Environment variables will be available at runtime via process.env.
  // For GCP Cloud Run we expose them as secrets.
  // Enable ESLint during dev.
  eslint: {
    // Run ESLint during `next lint`
    ignoreDuringBuilds: false,
  },
  webpack: (config) => {
    // Suppress harmless critical dependency warning from protobufjs / gRPC dynamic require expressions
    config.module.exprContextCritical = false;
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
