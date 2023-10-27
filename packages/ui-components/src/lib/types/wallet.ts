export type WagmiConnectorType =
  | 'injected'
  | 'metaMask'
  | 'walletConnect'
  | 'coinbaseWallet';

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
}

interface walletProps {
  connectorType: WagmiConnectorType;
}

export const WalletOptions: Record<WalletName, walletProps> = {
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
  [WalletName.Phantom]: {
    connectorType: 'metaMask',
  },
  [WalletName.Kresus]: {
    connectorType: 'walletConnect',
  },
};

export interface LoginResult {
  address: string;
  domain: string;
}
