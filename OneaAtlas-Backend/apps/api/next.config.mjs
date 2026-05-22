/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@oneatlas/db", "@oneatlas/shared", "@oneatlas/ai"],
  images: { unoptimized: true },
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000", "*.oneatlas.app", "*.oneatlas.dev"] },
  },
  redirects: async () => [],
  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Access-Control-Allow-Origin", value: "http://localhost:3000" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, x-request-id" },
        ],
      },
    ];
  },
};

export default nextConfig;
