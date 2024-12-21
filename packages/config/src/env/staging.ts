import type {ConfigOverride} from './types';

export default function getStagingConfig(): ConfigOverride {
  return {
    APP_ENV: 'staging',
    LOGIN_WITH_UNSTOPPABLE: {
      CLIENT_ID: '65637020-9d14-4d7d-880b-6a5c497d9540',
      REDIRECT_URI: 'https://staging.ud.me',
    },
    WALLETS: {
      LAUNCH_API_KEY:
        'oViIlylot+38CNS8tJ35JZLA6pVnkBncPxkXOlE79WYrSEBKrE4ASL7oDu0QN0Nv',
      SWAP: {
        SUPPORTED_TOKENS: {
          SOURCE: [
            {
              swing: {
                chain: 'sepolia',
                chainId: 11155111,
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
                chainId: 80002,
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
                chainId: 80002,
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
                chainId: 11155111,
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
                chainId: 421614,
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
                chainId: 84532,
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
