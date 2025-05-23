/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  reactStrictMode: true,
  swcMinify: true,
  // Configurar o diretório de páginas corretamente
  distDir: 'build',
  // Usar o diretório src
  webpack: (config, { isServer }) => {
    // Adicionar aliases para facilitar importações
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src')
    };
    return config;
  }
};

module.exports = nextConfig;
