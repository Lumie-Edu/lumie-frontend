import type { NextConfig } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://dev.lumie-edu.com';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Production: Kong handles /api/* routing directly
  // Local dev (npm run dev): proxy to dev Kong to avoid CORS
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/ws/:path*',
          destination: `${API_BASE}/ws/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
