/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false,
  },
};

export default nextConfig;
