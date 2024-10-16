export interface LoginResult {
  address: string;
  domain: string;
}

export const SUPPORTED_SIGNING_SYMBOLS = ['ETH', 'MATIC', 'POL', 'SOL', 'BTC'];

export const WALLET_CARD_HEIGHT = 275;

interface walletProps {
  connectorType: WagmiConnectorType;
}

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
