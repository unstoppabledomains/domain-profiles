/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const locales = require('./locales.json');

// transpile any required modules
const withNtm = require('next-transpile-modules')([
  '@pushprotocol/uiweb',
]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'api.ts'],
  typescript: {
    ignoreBuildErrors: true,
  },
  poweredByHeader: false,
  webpack: (config, options) => {
    config.plugins = config.plugins || [];
    config.module.rules.push({
      test: /\.test\.tsx?$/,
      loader: 'ignore-loader',
    });
    config.module.noParse = /gun\.js|gun\/sea\.js/;
    config.output.chunkLoadingGlobal = 'wpJsonpUD';
    config.resolve.extensions.push('.d.ts', '.ts', '.tsx');
    config.resolve.modules.push(path.resolve('./'));
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  i18n: {
    locales: locales.locales.map(({code}) => code),
    defaultLocale: locales.defaultLocale,
  },
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination:
          'https://storage.googleapis.com/unstoppable-client-assets/images/favicon/favicon.ico',
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ];
  },
}

module.exports = withNtm(nextConfig);
