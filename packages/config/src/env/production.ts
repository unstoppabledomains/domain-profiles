import type {ConfigOverride} from './types';

export default function getProductionConfig(): ConfigOverride {
  return {
    APP_ENV: 'production',
    UD_ME_BASE_URL: 'https://ud.me',
    UNSTOPPABLE_API_URL: 'https://api.unstoppabledomains.com',
    UNSTOPPABLE_WEBSITE_URL: 'https://unstoppabledomains.com',
    UNSTOPPABLE_METADATA_ENDPOINT:
      'https://api.unstoppabledomains.com/metadata',
    BLOCKCHAINS: {
      ZIL: {
        CHAIN_ID: 1,
        NETWORK_NAME: 'mainnet',
        JSON_RPC_API_URL: 'https://api.zilliqa.com/',
        ZILLIQA_VERSION: 65537,
        ZNS_REGISTRY_ADDRESS: 'zil1jcgu2wlx6xejqk9jw3aaankw6lsjzeunx2j0jz',
      },
      ETH: {
        CHAIN_ID: 1,
        NETWORK_NAME: 'mainnet',
        JSON_RPC_API_URL:
          'https://mainnet.infura.io/v3/467fd78247874d7e87d34c04fdd09bbb',
        BLOCK_EXPLORER_BASE_URL: 'https://etherscan.io',
        BLOCK_EXPLORER_TX_URL: 'https://www.oklink.com/eth/tx/',
        PROXY_READER_ADDRESS: '0xc3C2BAB5e3e52DBF311b2aAcEf2e40344f19494E',
        OPEN_SEA_BASE_URL: 'https://opensea.io/assets/',
        ENS_CONTRACT_ADDRESS: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
      },
      MATIC: {
        CHAIN_ID: 137,
        NETWORK_NAME: 'polygon-mainnet',
        JSON_RPC_API_URL:
          'https://polygon-mainnet.infura.io/v3/467fd78247874d7e87d34c04fdd09bbb',
        BLOCK_EXPLORER_BASE_URL: 'https://polygonscan.com',
        BLOCK_EXPLORER_TX_URL: 'https://www.oklink.com/polygon/tx/',
        PROXY_READER_ADDRESS: '0xA3f32c8cd786dc089Bd1fC175F2707223aeE5d00',
        OPEN_SEA_BASE_URL: 'https://opensea.io/assets/matic/',
      },
    },
    LOGIN_WITH_UNSTOPPABLE: {
      CLIENT_ID: 'c3af833f-3fd5-46fd-ac3e-bfc136624d1b',
      REDIRECT_URI: 'https://ud.me',
    },
    MESSAGING: {
      EMAIL_DOMAIN: 'ud.me',
      HOST_URL: 'https://api.unstoppabledomains.com/messaging',
    },
    IDENTITY: {
      HOST_URL: 'https://api.unstoppabledomains.com/identity',
    },
    PROFILE: {
      HOST_URL: 'https://api.unstoppabledomains.com/profile',
    },
    PUSH: {
      CHANNELS: ['eip155:1:0xdbBc2Ac8cb8D02B26F165b4BC120fd4b14DA6cDA'],
      APP_URL: 'https://app.push.org',
    },
    WALLETS: {
      HOST_URL: 'https://api.unstoppabledomains.com/wallet/v1',
      GET_WALLET_URL:
        'https://unstoppabledomains.com/cart?product=unstoppable-wallet',
      SWAP: {
        PLATFORM_HOST_URL:
          'https://platform.swing.xyz/api/v1/projects/unstoppable-domains',
        API_KEY: 'swing-37b05c4c-0b6d-43a8-ad54-7bd7168af0ee',
        ENVIRONMENT: 'production',
        PROJECT_ID: 'unstoppable-domains',
        SUPPORTED_TOKENS: {
          SOURCE: [
            {
              swing: {
                chain: 'ethereum',
                chainId: 1,
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
                chain: 'polygon',
                chainId: 137,
                symbol: 'POL',
                type: 'native',
              },
              walletType: 'MATIC',
              chainName: 'Polygon',
              chainSymbol: 'MATIC',
              tokenSymbol: 'MATIC',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/MATIC/icon.svg',
            },
            {
              swing: {
                chain: 'base',
                chainId: 8453,
                symbol: 'ETH',
                type: 'native',
              },
              walletType: 'BASE',
              chainName: 'Base',
              chainSymbol: 'BASE',
              tokenSymbol: 'ETH',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/BASE/icon.svg',
            },
            {
              swing: {
                chain: 'solana',
                symbol: 'SOL',
                type: 'native',
              },
              walletType: 'SOL',
              chainName: 'Solana',
              chainSymbol: 'SOL',
              tokenSymbol: 'SOL',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/SOL/icon.svg',
              // show in the list but do not allow interaction
              disabledReason: 'Solana swaps coming soon',
            },
            {
              swing: {
                chain: 'bitcoin',
                symbol: 'BTC',
                type: 'native',
              },
              walletType: 'BTC',
              chainName: 'Bitcoin',
              chainSymbol: 'BTC',
              tokenSymbol: 'BTC',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/BTC/icon.svg',
              // show in the list but do not allow interaction
              disabledReason: 'Bitcoin swaps coming soon',
            },
            {
              swing: {
                chain: 'base',
                chainId: 8453,
                symbol: 'USDC',
                type: 'erc20',
              },
              walletType: 'BASE',
              chainName: 'Base',
              chainSymbol: 'BASE',
              tokenSymbol: 'USDC',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/USDC/icon.svg',
            },
            {
              swing: {
                chain: 'polygon',
                chainId: 137,
                symbol: 'USDC',
                type: 'erc20',
              },
              walletType: 'MATIC',
              chainName: 'Polygon',
              chainSymbol: 'MATIC',
              tokenSymbol: 'USDC',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/USDC/icon.svg',
            },
            {
              swing: {
                chain: 'ethereum',
                chainId: 1,
                symbol: 'USDC',
                type: 'erc20',
              },
              walletType: 'ETH',
              chainName: 'Ethereum',
              chainSymbol: 'ETH',
              tokenSymbol: 'USDC',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/USDC/icon.svg',
            },
          ],
          DESTINATION: [
            {
              swing: {
                chain: 'ethereum',
                chainId: 1,
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
                chain: 'solana',
                symbol: 'SOL',
                type: 'native',
              },
              walletType: 'SOL',
              chainName: 'Solana',
              chainSymbol: 'SOL',
              tokenSymbol: 'SOL',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/SOL/icon.svg',
            },
            {
              swing: {
                chain: 'bitcoin',
                symbol: 'BTC',
                type: 'native',
              },
              walletType: 'BTC',
              chainName: 'Bitcoin',
              chainSymbol: 'BTC',
              tokenSymbol: 'BTC',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/BTC/icon.svg',
            },
            {
              swing: {
                chain: 'polygon',
                chainId: 137,
                symbol: 'POL',
                type: 'native',
              },
              walletType: 'MATIC',
              chainName: 'Polygon',
              chainSymbol: 'MATIC',
              tokenSymbol: 'MATIC',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/MATIC/icon.svg',
            },
            {
              swing: {
                chain: 'base',
                chainId: 8453,
                symbol: 'ETH',
                type: 'native',
              },
              walletType: 'BASE',
              chainName: 'Base',
              chainSymbol: 'BASE',
              tokenSymbol: 'ETH',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/BASE/icon.svg',
            },
            {
              swing: {
                chain: 'base',
                chainId: 8453,
                symbol: 'USDC',
                type: 'erc20',
              },
              walletType: 'BASE',
              chainName: 'Base',
              chainSymbol: 'BASE',
              tokenSymbol: 'USDC',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/USDC/icon.svg',
            },
            {
              swing: {
                chain: 'polygon',
                chainId: 137,
                symbol: 'USDC',
                type: 'erc20',
              },
              walletType: 'MATIC',
              chainName: 'Polygon',
              chainSymbol: 'MATIC',
              tokenSymbol: 'USDC',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/USDC/icon.svg',
            },
            {
              swing: {
                chain: 'ethereum',
                chainId: 1,
                symbol: 'USDC',
                type: 'erc20',
              },
              walletType: 'ETH',
              chainName: 'Ethereum',
              chainSymbol: 'ETH',
              tokenSymbol: 'USDC',
              imageUrl:
                'https://images.unstoppabledomains.com/images/icons/USDC/icon.svg',
            },
          ],
        },
      },
    },
    XMTP: {
      ENVIRONMENT: 'production',
      SUPPORT_WALLET_ADDRESS: '0x9B4Ed628640A73154895e369AE39a93732535924',
      SUPPORT_DOMAIN_NAME: 'support.unstoppable.x',
      CONVERSATION_ALLOW_LIST: [
        '0x9B4Ed628640A73154895e369AE39a93732535924',
        '0x66cB02a8C85De1cdEABF8D88B4045F59720b8Ede',
      ],
    },
  };
}
