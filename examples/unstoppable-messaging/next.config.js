/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

// transpile UI-components ESM module, because Next.js does not do this
// by default for imported packages in node_modules
const withNtm = require('next-transpile-modules')([
  '@unstoppabledomains/ui-components',
]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: false,
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'api.ts'],
  experimental: {
    externalDir: true,
    forceSwcTransforms: true,
  },
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
};

module.exports = withNtm(nextConfig);
