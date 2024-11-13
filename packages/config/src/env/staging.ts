import type {ConfigOverride} from './types';

export default function getStagingConfig(): ConfigOverride {
  return {
    APP_ENV: 'staging',
    LOGIN_WITH_UNSTOPPABLE: {
      CLIENT_ID: '65637020-9d14-4d7d-880b-6a5c497d9540',
      REDIRECT_URI: 'https://staging.ud.me',
    },
    WALLETS: {
      SWAP: {
        SUPPORTED_TOKENS: {
          SOURCE: [
            {
              swing: {
                chain: 'sepolia',
                symbol: 'ETH',
                type: 'native',
              },
              walletType: 'ETH',
              chainName: 'Ethereum',
              chainSymbol: 'ETH',
              tokenSymbol: 'ETH',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/ETH/icon.svg',
            },
            {
              swing: {
                chain: 'polygon-amoy',
                symbol: 'POL',
                type: 'native',
              },
              walletType: 'MATIC',
              chainName: 'Polygon',
              chainSymbol: 'MATIC',
              tokenSymbol: 'MATIC',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/MATIC/icon.svg',
              disabledReason: 'Not working on testnet',
            },
            {
              swing: {
                chain: 'polygon-amoy',
                symbol: 'USDC',
                type: 'erc20',
              },
              walletType: 'MATIC',
              chainName: 'Polygon',
              chainSymbol: 'MATIC',
              tokenSymbol: 'USDC',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/USDC/icon.svg',
              disabledReason: 'Not working on testnet',
            },
          ],
          DESTINATION: [
            {
              swing: {
                chain: 'sepolia',
                symbol: 'ETH',
                type: 'native',
              },
              walletType: 'ETH',
              chainName: 'Ethereum',
              chainSymbol: 'ETH',
              tokenSymbol: 'ETH',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/ETH/icon.svg',
            },
            {
              swing: {
                chain: 'arbitrum-sepolia',
                symbol: 'ETH',
                type: 'native',
              },
              walletType: 'ETH',
              chainName: 'Arbitrum',
              chainSymbol: 'ARB',
              tokenSymbol: 'ETH',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/ARB/icon.svg',
            },
            {
              swing: {
                chain: 'solana-dev',
                symbol: 'SOL',
                type: 'native',
              },
              walletType: 'SOL',
              chainName: 'Solana',
              chainSymbol: 'SOL',
              tokenSymbol: 'SOL',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/SOL/icon.svg',
              disabledReason: 'Not working on testnet',
            },
            {
              swing: {
                chain: 'bitcoin-testnet',
                symbol: 'BTC',
                type: 'native',
              },
              walletType: 'BTC',
              chainName: 'Bitcoin',
              chainSymbol: 'BTC',
              tokenSymbol: 'BTC',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/BTC/icon.svg',
              disabledReason: 'Not working on testnet',
            },
            {
              swing: {
                chain: 'base-sepolia',
                symbol: 'ETH',
                type: 'native',
              },
              walletType: 'BASE',
              chainName: 'Base',
              chainSymbol: 'BASE',
              tokenSymbol: 'ETH',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/BASE/icon.svg',
              disabledReason: 'Not working on testnet',
            },
          ],
        },
      },
    },
  };
}
