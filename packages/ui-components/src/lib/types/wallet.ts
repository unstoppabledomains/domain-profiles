import type {SerializedPriceHistory, TokenType} from './domain';

export enum CustodyState {
  CUSTODY = 'CUSTODY',
  SELF_CUSTODY = 'SELF_CUSTODY',
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

export const WALLET_CARD_HEIGHT = 275;

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

export interface WalletPalette {
  background: {
    main: string;
    gradient: {
      start: string;
      end: string;
    };
  };
  card: {
    text: string;
    gradient: {
      start: string;
      end: string;
    };
    selected: {
      background: string;
      text: string;
    };
  };
  text: {
    primary: string;
    secondary: string;
  };
  chart: {
    up: string;
    down: string;
  };
}

// From https://m2.material.io/inline-tools/color/
export const WalletPaletteOwner: WalletPalette = {
  background: {
    main: '#fafafa', //100
    gradient: {
      start: '#f5f5f5', //200
      end: '#fafafa', //100
    },
  },
  card: {
    text: '#606060', //800
    selected: {
      background: '#fafafa', //100
      text: '#606060', //800
    },
    gradient: {
      start: '#dedede', //400
      end: '#f0f0f0', //300
    },
  },
  text: {
    primary: '#606060', //800
    secondary: '#979797', //600
  },
  chart: {
    up: '#15b64c',
    down: '#9f9fa7',
  },
};

// Currently the same as owner palette, but can be customized
export const WalletPalettePublic: WalletPalette = {
  background: {
    main: '#fafafa', //100
    gradient: {
      start: '#f5f5f5', //200
      end: '#fafafa', //100
    },
  },
  card: {
    text: '#606060', //800
    selected: {
      background: '#fafafa', //100
      text: '#606060', //800
    },
    gradient: {
      start: '#dedede', //400
      end: '#f0f0f0', //300
    },
  },
  text: {
    primary: '#606060', //800
    secondary: '#979797', //600
  },
  chart: {
    up: '#15b64c',
    down: '#9f9fa7',
  },
};
