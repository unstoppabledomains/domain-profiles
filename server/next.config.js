/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const path = require('path');
const {createSecureHeaders} = require('next-secure-headers');
const contentSecurityPolicy = require('./contentSecurityPolicy');
const locales = require('./locales.json');

// transpile any required modules
const withNtm = require('next-transpile-modules')([]);

/**
 * By default, NextJS returns Cache-Control headers for immutable assets, telling Fastly to cache the response
 * https://nextjs.org/docs/going-to-production#caching
 * This includes pages with getStaticProps, but not pages with getServerSideProps.
 * Use this helper if you need to override the default NextJS cache headers.
 */
const fastlyCacheHeaders = ({
  purgableBy, // keys for purging the cache (optional)
  staleWhileRevalidate, // in seconds (optional, default: 0)
  staleIfError, // in seconds (optional, default: 0)
  ttl, // in seconds (required)
}) => {
  assert(typeof ttl === 'number', 'fastlyCacheHeaders ttl required');
  return [
    // Enable fastly cache.
    // Note that Fastly deletes these header before sending the response to the browser.
    // Fastly supports the max-age, stale-if-error, and stale-while-revalidate parameters by default.
    // https://docs.fastly.com/en/guides/controlling-caching#setting-different-ttls-for-fastly-cache-and-web-browsers
    // https://developer.fastly.com/learning/concepts/cache-freshness/
    ...(purgableBy
      ? [
          {
            key: 'Surrogate-Key',
            value: purgableBy.join(' '),
          },
        ]
      : []),
    {
      key: 'Surrogate-Control',
      value: [
        `stale-if-error=${staleIfError ?? 0}`,
        `stale-while-revalidate=${staleWhileRevalidate ?? 0}`,
        `max-age=${ttl ?? 0}`,
      ].join(', '),
    },

    // Disable browser cache since Fastly can't invalidate the browser cache
    // https://docs.fastly.com/en/guides/temporarily-disabling-caching
    // https://docs.fastly.com/en/guides/controlling-caching#setting-different-ttls-for-fastly-cache-and-web-browsers
    {
      key: 'Cache-Control',
      value:
        'no-cache, no-store, private, must-revalidate, max-age=0, max-stale=0, post-check=0, pre-check=0',
    },
    {
      key: 'Pragma',
      value: 'no-cache',
    },
    {
      key: 'Expires',
      value: '0',
    },
  ];
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: false,
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'api.ts'],
  // source maps are used in bugsnag to make it easier to map production errors to a line of code
  productionBrowserSourceMaps: true,
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
  async headers() {
    const headers = createSecureHeaders({
      contentSecurityPolicy,
      forceHTTPSRedirect: [
        true,
        {
          maxAge: 31536000, // 1 year
          includeSubDomains: true,
          preload: true,
        },
      ],
    });

    // Fastly cache expires after just 1 minute. We can increase the Fastly cache HIT rate by using
    // stale-while-revalidate to serve stale cached content while revalidating.
    // NextJS default cache headers returns stale-while-revalidate, but without seconds:
    // > Cache-Control: stale-maxage=60, stale-while-revalidate
    // But Fastly requires stale-while-revalidate seconds, so override the default.
    return [
      // Default headers for any path
      {
        source: '/:path*',
        headers,
      },
      // Headers for homepage
      ...['/'].map(source => ({
        source,
        headers: [
          ...fastlyCacheHeaders({
            ttl: 86400, // 1 day
          }),
          {
            key: 'Content-Security-Policy',
            value:
              'connect-src * data: blob:; img-src * data: blob:; object-src *',
          },
        ],
      })),
      // Headers for domain profile
      {
        source: '/:domain',
        headers: [
          ...fastlyCacheHeaders({
            ttl: 86400, // 1 day
            purgableBy: ['Domain/:domain', 'CryptoWallet/update'],
          }),
          {
            key: 'Content-Security-Policy',
            value:
              'connect-src * data: blob:; img-src * data: blob:; object-src *',
          },
        ],
      },
      // Headers for badge page
      {
        source: '/badge/:badgeCode',
        headers: [
          ...fastlyCacheHeaders({
            ttl: 86400,
          }),
          {
            key: 'Content-Security-Policy',
            value:
              'connect-src * data: blob:; img-src * data: blob:; object-src *',
          },
        ],
      },
      // Headers for example pages
      {
        source: '/examples/:example',
        headers: [
          ...fastlyCacheHeaders({
            ttl: 3600, // 1 hour
          }),
          {
            key: 'Content-Security-Policy',
            value:
              'connect-src * data: blob:; img-src * data: blob:; object-src *',
          },
        ],
      },
    ];
  },
};

module.exports = withNtm(nextConfig);
