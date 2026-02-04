/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Server output keeps dynamic routes working for deep links.
  // Static export would require pre-generated paths and hosting rewrites.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

module.exports = nextConfig;
