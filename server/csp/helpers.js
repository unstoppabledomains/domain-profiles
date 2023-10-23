/* eslint-disable @typescript-eslint/no-var-requires */

// Helper utils for constructing CSP
const {URL} = require('node:url');

const toWildcardDomain = domain => {
  if (!domain) {
    return domain;
  }
  const url = new URL(domain);
  if (url.hostname === 'localhost') {
    return domain;
  }

  const hostParts = url.hostname.split('.');

  // remove subdomain part(s)
  const baseDomain =
    hostParts[hostParts.length - 2] + '.' + hostParts[hostParts.length - 1];

  return `${url.protocol || 'https:'}//*.${baseDomain}`;
};

module.exports = {
  toWildcardDomain,
};
