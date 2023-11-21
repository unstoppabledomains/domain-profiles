export const normalizeIpfsHash = (hash: string): string => {
  if (hash.match(/^\/ip(f|n)s\/.*$/)) {
    return hash;
  }
  return `/ipfs/${hash}`;
};
