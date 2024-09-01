const TICKER_REGEX = '[0-9A-Za-z*$-+]+';

export const ADDRESS_REGEX = new RegExp(`crypto\\.${TICKER_REGEX}\\.address`);
export type Addresses = Record<string, string>;
export const MULTI_CHAIN_ADDRESS_REGEX = new RegExp(
  `crypto\\.${TICKER_REGEX}\\.version\\.${TICKER_REGEX}\\.address`,
);
export type MetadataDomainRecords = Record<string, string>;
export type MetadataDomainsRecordsResponse = {
  data: {domain: string; records: MetadataDomainRecords}[];
};

export type MulticoinAddresses = Record<string, MulticoinVersions>;
export type MulticoinVersions = Record<string, string>;

export type ParsedRecords = {
  addresses: Addresses;
  multicoinAddresses: MulticoinAddresses;
};

export const TOKEN_FAMILY_REGEX = new RegExp('^token\\..*');
