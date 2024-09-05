export interface MappedResolverKey {
  type: string;
  subType: string;
  name: string;
  shortName: string;
  key: string;
  validation?: Validation;
  info?: Info;
  related?: string[];
  mapping?: Mapping;
  parents?: Parent[];
}

export interface Parent {
  type: string;
  subType: string;
  name: string;
  key: string;
  shortName?: string;
}

interface Validation {
  regexes: Regex[];
}

interface Regex {
  name: string;
  pattern: string;
}

interface Info {
  logoUrl: string;
  iconUrl: string;
  description: string;
}

interface Mapping {
  isPreferred: boolean;
  from: string[];
  to: string;
}

export type RecordUpdateResponse = {
  operationId: string;
  dependencyId: string;
  transaction: {
    messageToSign?: string;
    contractAddress?: string;
    data?: string;
    value?: string;
  };
};
