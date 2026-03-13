/** @type {import('next').NextConfig} */
const nextConfig = {
  // Renamed in Next.js 14.1 — use both for compatibility
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs", "@prisma/client", "prisma"],
  },
  images: {
    remotePatterns: [{ hostname: "localhost" }],
  },
};

module.exports = nextConfig;
