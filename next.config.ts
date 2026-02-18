import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Production: Kong handles /api/* routing directly
  // Local dev (npm run dev): proxy to prod Kong to avoid CORS
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'https://lumie0213.kro.kr/api/:path*',
        },
        {
          source: '/ws/:path*',
          destination: 'https://lumie0213.kro.kr/ws/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
