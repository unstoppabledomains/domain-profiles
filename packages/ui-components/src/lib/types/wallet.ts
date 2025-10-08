import type {SerializedPriceHistory, TokenType} from './domain';

export enum CustodyState {
  CUSTODY = 'CUSTODY',
  SELF_CUSTODY = 'SELF_CUSTODY',
  CLAIMING = 'CLAIMING',
}

export interface CustodyWallet {
  secret?: string;
  state: CustodyState;
  status: 'COMPLETED' | 'QUEUED' | 'PROCESSING';
  addresses?: Record<string, string>;
}

export interface LoginResult {
  address: string;
  domain: string;
}

export const SUPPORTED_SIGNING_SYMBOLS = ['ETH', 'MATIC', 'POL', 'SOL', 'BTC'];

export type TokenEntry = {
  address?: string;
  type: TokenType;
  symbol: string;
  name: string;
  ticker: string;
  value: number;
  tokenConversionUsd: number;
  balance: number;
  pctChange?: number;
  imageUrl?: string;
  history?: SerializedPriceHistory[];
  walletAddress: string;
  walletBlockChainLink: string;
  walletName: string;
  walletType?: string;
};

export const WALLET_CARD_HEIGHT = 285;

export type WagmiConnectorType =
  | 'injected'
  | 'metaMask'
  | 'walletConnect'
  | 'coinbaseWallet';

export interface WalletAccountResponse {
  emailAddress: string;
  active: boolean;
  clock: number;
  records?: Record<string, string>;
}

export enum WalletName {
  MetaMask = 'MetaMask',
  WalletConnect = 'WalletConnect',
  TrustWallet = 'TrustWallet',
  BlockchainCom = 'BlockchainCom',
  CoinbaseWallet = 'CoinbaseWallet',
  CryptoCom = 'CryptoCom',
  Brave = 'Brave',
  Phantom = 'Phantom',
  Kresus = 'Kresus',
  UnstoppableWalletReact = 'UnstoppableWalletReact',
  UnstoppableWalletExtension = 'UnstoppableWalletExtension',
}

interface walletProps {
  connectorType: WagmiConnectorType;
}

export const WalletOptions: Record<WalletName, walletProps> = {
  [WalletName.Phantom]: {
    connectorType: 'metaMask',
  },
  [WalletName.UnstoppableWalletReact]: {
    connectorType: 'walletConnect',
  },
  [WalletName.UnstoppableWalletExtension]: {
    connectorType: 'injected',
  },
  [WalletName.MetaMask]: {
    connectorType: 'metaMask',
  },
  [WalletName.WalletConnect]: {
    connectorType: 'walletConnect',
  },
  [WalletName.TrustWallet]: {
    connectorType: 'walletConnect',
  },
  [WalletName.BlockchainCom]: {
    connectorType: 'walletConnect',
  },
  [WalletName.CoinbaseWallet]: {
    connectorType: 'coinbaseWallet',
  },
  [WalletName.CryptoCom]: {
    connectorType: 'metaMask',
  },
  [WalletName.Brave]: {
    connectorType: 'metaMask',
  },
  [WalletName.Kresus]: {
    connectorType: 'walletConnect',
  },
};
