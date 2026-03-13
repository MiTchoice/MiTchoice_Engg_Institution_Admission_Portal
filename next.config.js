/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "localhost" }],
  },
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs", "@prisma/client", "prisma"],
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), "bcrypt"];
    return config;
  },
};

module.exports = nextConfig;
