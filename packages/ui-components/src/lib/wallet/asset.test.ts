import {TokenType} from '../types';
import type {AccountAsset} from '../types/fireBlocks';
import {getAsset} from './asset';

describe('selecting asset', () => {
  const mockAssets: AccountAsset[] = [
    {
      '@type': 'unstoppabledomains.com/wallets.v1.WalletAccountAssetMinimal',
      id: 'wa-aa-92498f05-ecdb-4932-99a8-69dde0c67219',
      address: '0x8ee1E1d88EBE2B44eAD162777DE787Ef6A2dC2F2',
      blockchainAsset: {
        '@type': 'unstoppabledomains.com/wallets.v1.BlockchainAsset',
        id: 'wa-ba-8eed75ac-0d7b-4768-b78a-b861661a248a',
        name: 'USD Coin',
        symbol: 'USDC',
        blockchain: {
          id: 'POLYGON',
          name: 'Polygon',
          networkId: 80002,
        },
      },
      accountId: 'wa-ac-4458235d-cac9-4695-bed9-5458adb093d3',
    },
    {
      '@type': 'unstoppabledomains.com/wallets.v1.WalletAccountAssetMinimal',
      id: 'wa-aa-ddf1787f-6e20-4da1-84ec-1bfa61f8b5df',
      address: 'tb1qapcrvnxj40wk260p24fr9gplzxadmejynlm3xv',
      blockchainAsset: {
        '@type': 'unstoppabledomains.com/wallets.v1.BlockchainAsset',
        id: 'wa-ba-252af324-623b-4ea1-84ad-bae3a40104b4',
        name: 'Bitcoin',
        symbol: 'BTC',
        blockchain: {
          id: 'BITCOIN',
          name: 'Bitcoin',
        },
      },
      accountId: 'wa-ac-4458235d-cac9-4695-bed9-5458adb093d3',
    },
    {
      '@type': 'unstoppabledomains.com/wallets.v1.WalletAccountAssetMinimal',
      id: 'wa-aa-b00f70bb-185d-44e0-9bd8-fcb528e53f02',
      address: '0x8ee1E1d88EBE2B44eAD162777DE787Ef6A2dC2F2',
      blockchainAsset: {
        '@type': 'unstoppabledomains.com/wallets.v1.BlockchainAsset',
        id: 'wa-ba-41070c4d-a337-4ee1-ae37-5ad01671eef8',
        name: 'Polygon',
        symbol: 'MATIC',
        blockchain: {
          id: 'POLYGON',
          name: 'Polygon',
          networkId: 80002,
        },
      },
      accountId: 'wa-ac-4458235d-cac9-4695-bed9-5458adb093d3',
    },
    {
      '@type': 'unstoppabledomains.com/wallets.v1.WalletAccountAssetMinimal',
      id: 'wa-aa-505e90ce-ad8e-440d-85b5-8f3cf878328d',
      address: '7Na9VWPbS25mmkHh6jRfVVRP2kvRPQCxq8uDk6bGwc6',
      blockchainAsset: {
        '@type': 'unstoppabledomains.com/wallets.v1.BlockchainAsset',
        id: 'wa-ba-dbc22cc5-fb58-4309-80eb-fe3a0b0f76d0',
        name: 'Solana',
        symbol: 'SOL',
        blockchain: {
          id: 'SOLANA',
          name: 'Solana',
        },
      },
      accountId: 'wa-ac-4458235d-cac9-4695-bed9-5458adb093d3',
    },
    {
      '@type': 'unstoppabledomains.com/wallets.v1.WalletAccountAssetMinimal',
      id: 'wa-aa-223f2f3d-879b-4317-8320-697d660ea251',
      address: '0x8ee1E1d88EBE2B44eAD162777DE787Ef6A2dC2F2',
      blockchainAsset: {
        '@type': 'unstoppabledomains.com/wallets.v1.BlockchainAsset',
        id: 'wa-ba-55384a58-ea4f-415c-8b12-5d9dccb5e1de',
        name: 'Ethereum',
        symbol: 'ETH',
        blockchain: {
          id: 'BASE',
          name: 'Base',
          networkId: 84532,
        },
      },
      accountId: 'wa-ac-4458235d-cac9-4695-bed9-5458adb093d3',
    },
    {
      '@type': 'unstoppabledomains.com/wallets.v1.WalletAccountAssetMinimal',
      id: 'wa-aa-6c2a38cd-c12f-4bb1-97fb-da2cf5398ec5',
      address: '0x8ee1E1d88EBE2B44eAD162777DE787Ef6A2dC2F2',
      blockchainAsset: {
        '@type': 'unstoppabledomains.com/wallets.v1.BlockchainAsset',
        id: 'wa-ba-a8d05b8b-9201-41b8-8401-069dc3909a48',
        name: 'Ethereum',
        symbol: 'ETH',
        blockchain: {
          id: 'ETHEREUM',
          name: 'Ethereum',
          networkId: 11155111,
        },
      },
      accountId: 'wa-ac-4458235d-cac9-4695-bed9-5458adb093d3',
    },
  ];

  it('should select default Ethereum asset by address', () => {
    const asset = getAsset(mockAssets, {
      address: '0x8ee1E1d88EBE2B44eAD162777DE787Ef6A2dC2F2',
    });
    expect(asset).toBeDefined();
    expect(asset?.blockchainAsset.blockchain.id).toBe('ETHEREUM');
  });

  it('should select Ethereum asset by chain ID', () => {
    const asset = getAsset(mockAssets, {
      chainId: 11155111,
      address: '0x8ee1E1d88EBE2B44eAD162777DE787Ef6A2dC2F2',
    });
    expect(asset).toBeDefined();
    expect(asset?.blockchainAsset.blockchain.id).toBe('ETHEREUM');
  });

  it('should select Base asset by chain ID', () => {
    const asset = getAsset(mockAssets, {
      chainId: 84532,
      address: '0x8ee1E1d88EBE2B44eAD162777DE787Ef6A2dC2F2',
    });
    expect(asset).toBeDefined();
    expect(asset?.blockchainAsset.blockchain.id).toBe('BASE');
  });

  it('should select Polygon asset by chain ID', () => {
    const asset = getAsset(mockAssets, {
      chainId: 80002,
      address: '0x8ee1E1d88EBE2B44eAD162777DE787Ef6A2dC2F2',
    });
    expect(asset).toBeDefined();
    expect(asset?.blockchainAsset.blockchain.id).toBe('POLYGON');
  });

  it('should ignore an invalid chain ID', () => {
    const asset = getAsset(mockAssets, {
      chainId: 9999999999,
      address: '0x8ee1E1d88EBE2B44eAD162777DE787Ef6A2dC2F2',
    });
    expect(asset).toBeDefined();
    expect(asset?.blockchainAsset.blockchain.id).toBe('ETHEREUM');
  });

  it('should select Solana asset by address', () => {
    const asset = getAsset(mockAssets, {
      address: '7Na9VWPbS25mmkHh6jRfVVRP2kvRPQCxq8uDk6bGwc6',
    });
    expect(asset).toBeDefined();
    expect(asset?.blockchainAsset.blockchain.id).toBe('SOLANA');
  });

  it('should select Solana asset by token', () => {
    const asset = getAsset(mockAssets, {
      token: {
        address: 'mockTokenAddress',
        type: TokenType.Spl,
        symbol: 'SOL',
        name: 'Mock token',
        ticker: 'MOCK',
        value: 1,
        tokenConversionUsd: 1,
        balance: 1,
        walletAddress: '7Na9VWPbS25mmkHh6jRfVVRP2kvRPQCxq8uDk6bGwc6',
        walletBlockChainLink: 'mockBlockchainLink',
        walletName: 'Solana',
        walletType: 'mpc',
      },
    });
    expect(asset).toBeDefined();
    expect(asset).toBeDefined();
    expect(asset?.blockchainAsset.blockchain.id).toBe('SOLANA');
  });

  it('should select Polygon asset by token', () => {
    const asset = getAsset(mockAssets, {
      token: {
        address: 'mockTokenAddress',
        type: TokenType.Erc20,
        symbol: 'MATIC',
        name: 'Mock token',
        ticker: 'MOCK',
        value: 1,
        tokenConversionUsd: 1,
        balance: 1,
        walletAddress: '0x8ee1E1d88EBE2B44eAD162777DE787Ef6A2dC2F2',
        walletBlockChainLink: 'mockBlockchainLink',
        walletName: 'Polygon',
        walletType: 'mpc',
      },
    });
    expect(asset).toBeDefined();
    expect(asset).toBeDefined();
    expect(asset?.blockchainAsset.blockchain.id).toBe('POLYGON');
  });

  it('should select Base asset by token', () => {
    const asset = getAsset(mockAssets, {
      token: {
        address: 'mockTokenAddress',
        type: TokenType.Erc20,
        symbol: 'BASE',
        name: 'Mock token',
        ticker: 'MOCK',
        value: 1,
        tokenConversionUsd: 1,
        balance: 1,
        walletAddress: '0x8ee1E1d88EBE2B44eAD162777DE787Ef6A2dC2F2',
        walletBlockChainLink: 'mockBlockchainLink',
        walletName: 'Base',
        walletType: 'mpc',
      },
    });
    expect(asset).toBeDefined();
    expect(asset).toBeDefined();
    expect(asset?.blockchainAsset.blockchain.id).toBe('BASE');
  });

  it('should select the first element if no parameters provided', () => {
    const asset = getAsset(mockAssets);
    expect(asset?.blockchainAsset.blockchain.id).toBe('POLYGON');
    expect(asset?.blockchainAsset.name).toBe('USD Coin');
  });

  it('should not select an asset if address is not found', () => {
    const asset = getAsset(mockAssets, {
      address: 'notfound',
    });
    expect(asset).not.toBeDefined();
  });
});
