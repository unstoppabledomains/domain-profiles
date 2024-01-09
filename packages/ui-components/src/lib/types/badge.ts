import type {SerializedMarketplaceData} from './nfts';

export type DomainBadgesResponse = {
  list: SerializedCryptoWalletBadge[];
  countActive: number;
  countTotal: number;
  badgesLastSyncedAt: Date | null;
};

export interface SerializedBadgeInfo {
  badge: SerializedCryptoWalletBadge;
  sponsorship: SerializedBadgeSponsorship;
  usage: SerializedBadgeUsage;
}

export interface SerializedBadgeSponsorship {
  max: number;
  count: number;
  latest?: string;
  domains?: Array<{
    name: string;
    count: number;
  }>;
  authorizedAddresses?: string[];
}

export interface SerializedBadgeUsage {
  holders: number;
  featured?: string[];
  rank?: number;
}

export type SerializedCryptoWalletBadge = {
  active: boolean;
  name: string;
  description: string;
  logo: string;
  linkUrl?: string | null;
  configId: number;
  code: string;
  type: string;
  videoUrl?: string;
  coverImage?: string;
  count?: number;
  expired?: boolean;
  status?: string;
  symbols?: string[];
  contracts?: string[];
  marketplace?: SerializedMarketplaceData;
  groupChatId?: string;
  groupChatLatestMessage?: string;
  groupChatTimestamp?: number;
  gallery?: {
    enabled: boolean;
    tier: number;
  };
};
