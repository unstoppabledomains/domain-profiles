export type MulticoinVersions = Record<string, string>;
export type Addresses = Record<string, string>;
export type MulticoinAddresses = Record<string, MulticoinVersions>;
export type ParsedRecords = {
  addresses: Addresses;
  multicoinAddresses: MulticoinAddresses;
};

const TICKER_REGEX = '[0-9A-Za-z*$-+]+';
export const ADDRESS_REGEX = new RegExp(`crypto\\.${TICKER_REGEX}\\.address`);
export const MULTI_CHAIN_ADDRESS_REGEX = new RegExp(
  `crypto\\.${TICKER_REGEX}\\.version\\.${TICKER_REGEX}\\.address`,
);

export type MetadataDomainRecords = Record<string, string>;

export type MetadataDomainsRecordsResponse = {
  data: {domain: string; records: MetadataDomainRecords}[];
};
