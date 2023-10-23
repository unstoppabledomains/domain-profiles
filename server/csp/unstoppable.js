/* eslint-disable @typescript-eslint/no-var-requires */
const {toWildcardDomain} = require('./helpers');

const CLIENT_WILDCARD_DOMAIN = toWildcardDomain(
  process.env.NEXT_PUBLIC_CLIENT_URL,
);
const API_WILDCARD_DOMAIN = toWildcardDomain(
  process.env.NEXT_PUBLIC_API_BASE_URL,
);

const unstoppabledomains = {
  connectSrc: [
    CLIENT_WILDCARD_DOMAIN,
    API_WILDCARD_DOMAIN,
    process.env.NEXT_PUBLIC_CLIENT_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    'https://informationunstoppable.com',
    'https://metadata.unstoppabledomains.com',
    'https://metadata.staging.unstoppabledomains.com',
    'https://api.unstoppabledomains.com',
    'https://api.ud-staging.com',
    'https://beop.unstoppabledomains.com',
    'https://beos.unstoppabledomains.com',
    'https://identity.unstoppabledomains.com',
    'https://profile.unstoppabledomains.com',
    'https://messaging.unstoppabledomains.com',
    'https://messaging.ud-staging.com',
    'https://identity.ud-staging.com',
    'https://storage.googleapis.com/dot-crypto-metadata-api/',
    'https://auth.unstoppabledomains.com/.well-known/openid-configuration',
    'https://auth.unstoppabledomains.com/oauth2/token',
    'https://auth.unstoppabledomains.com/.well-known/jwks.json',
  ],
  fontSrc: ['https://storage.googleapis.com/unstoppable-client-assets/fonts/'],
  frameSrc: [
    CLIENT_WILDCARD_DOMAIN,
    API_WILDCARD_DOMAIN,
    process.env.NEXT_PUBLIC_CLIENT_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    'https://unstoppable-domains.firebaseapp.com',
    'https://unstoppable-domains-staging.firebaseapp.com',
    'https://ud.me',
  ],
  imgSrc: [
    CLIENT_WILDCARD_DOMAIN,
    API_WILDCARD_DOMAIN,
    process.env.NEXT_PUBLIC_CLIENT_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    'https://storage.googleapis.com/dot-crypto-metadata-api/',
    'https://metadata.unstoppabledomains.com',
    'https://api.unstoppabledomains.com',
    'https://api.ud-staging.com',
  ],
  mediaSrc: [
    CLIENT_WILDCARD_DOMAIN,
    API_WILDCARD_DOMAIN,
    process.env.NEXT_PUBLIC_CLIENT_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    'https://cdn.unstoppabledomains.com',
  ],
  scriptSrc: [
    CLIENT_WILDCARD_DOMAIN,
    API_WILDCARD_DOMAIN,
    process.env.NEXT_PUBLIC_CLIENT_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    process.env.NEXT_PUBLIC_CLIENT_URL.includes('ud-staging') ||
    process.env.NEXT_PUBLIC_CLIENT_URL.includes('localhost')
      ? 'ud-staging.com'
      : '',
  ],
};

module.exports = unstoppabledomains;
