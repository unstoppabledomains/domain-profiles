import type {SerializedDomainMarket} from './domain';

export enum Network {
  Mainnet = '1',
  Goerli = '5',
  Polygon = '137',
  Mumbai = '80001',
  Binance = '56',
  Avalanche = '43114',
  Fantom = '250',
}

export type Nft = SerializedNftMetadata & {
  toggleVisibility?: (symbol: string, mint: string, visible: boolean) => void;
  peerNfts?: Nft[];
};

export type NftMintItem = NftRequestItem & {
  symbol: string;
};

export const NftPageSize = 25;

export interface NftRequestItem {
  mint: string;
  public: boolean;
}

export interface NftResponse {
  nfts: Nft[];
  address: string;
  verified: boolean;
  enabled: boolean;
  cursor?: string;
  showAllItems?: boolean;
}

export interface SerializedMarketplaceData {
  listings?: SerializedNftMetadata[];
  floorPrice?: SerializedPrice;
  avgPrice?: SerializedPrice;
  supply?: number;
  holders?: number;
  sales?: number;
  volume?: number;
}

export type SerializedNftMetadata = {
  link: string;
  name: string;
  image_url: string;
  description: string;
  video_url: string;
  collection: string;
  collectionLink?: string;
  tags?: string[];
  owner?: boolean;
  public?: boolean;
  mint?: string;
  symbol?: string;
  chainId?: Network;
  verified?: boolean;
  contractType?: string;
  ownerAddress?: string;
  price?: SerializedPrice;
  mintDetails?: SerializedDomainMarket;
  createdDate?: Date;
  acquiredDate?: Date;
  traits?: Record<string, string>;
  rarity?: {
    rank?: number;
    score?: number;
    uniqueAttributes?: number;
  };
  supply?: number;
};

export type SerializedPrice = {
  currency: string;
  value: number;
};
