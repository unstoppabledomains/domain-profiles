import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';

import type {TokenEntry} from '../../components/Wallet/Token';
import type {
  SerializedPublicDomainProfileData,
  SerializedWalletBalance,
} from '../../lib/types/domain';
import {TokenType} from '../../lib/types/domain';
import type {AccountAsset} from '../../lib/types/fireBlocks';
import {VALID_ETH_ADDRESS} from '../common';

export const mockAccountAsset = (): AccountAsset => {
  return {
    '@type': '',
    id: 'account',
    address: VALID_ETH_ADDRESS,
    blockchainAsset: {
      '@type': '',
      id: 'ETH',
      name: 'Ethereum',
      symbol: 'ETH',
      blockchain: {
        id: 'ETH',
        name: 'Ethereum',
        networkId: 1,
      },
    },
    accountId: '',
  };
};

export const mockFireblocksClient = (): IFireblocksNCW => {
  return {
    dispose: jest.fn(),
    clearAllStorage: jest.fn(),
    generateMPCKeys: jest.fn(),
    stopMpcDeviceSetup: jest.fn(),
    signTransaction: jest.fn(),
    stopInProgressSignTransaction: jest.fn(),
    getInProgressSigningTxId: jest.fn(),
    backupKeys: jest.fn(),
    recoverKeys: jest.fn(),
    requestJoinExistingWallet: jest.fn(),
    approveJoinWalletRequest: jest.fn(),
    stopJoinWallet: jest.fn(),
    takeover: jest.fn(),
    exportFullKeys: jest.fn(),
    deriveAssetKey: jest.fn(),
    getKeysStatus: jest.fn(),
    getPhysicalDeviceId: jest.fn(),
  };
};

export const mockProfileData = ({
  ethAddress,
}: {
  ethAddress?: string;
}): SerializedPublicDomainProfileData => {
  return {
    profile: {
      domainPurchased: true,
    },
    metadata: {
      domain: 'aaron.x',
      tokenId:
        '52938592461848142257935407832363920406606817503334321993253523691403232488025',
      namehash:
        '0x750a2e77aea5e5e193b5821a8e12611e829a21d01c46572f6483611ac70d2a59',
      blockchain: 'MATIC',
      networkId: '80002',
      owner: '0xcd0dadab45baf9a06ce1279d1342ecc3f44845af',
      resolver: '0xab005176d74900a9c25fda144e2f9f329a409166',
      registry: '0xab005176d74900a9c25fda144e2f9f329a409166',
      reverse: true,
      type: 'Uns',
      pending: false,
    },
    records: {
      'crypto.BTC.address':
        'bc1pg2umaj84da0h97mkv5v4zecmzcryalms8ecxu6scfy3zapwnedksg4kmyn',
      'crypto.ETH.address':
        ethAddress || '0xCD0DAdAb45bAF9a06ce1279D1342EcC3F44845af',
      'crypto.SOL.address': '8DyNeQYMWY6NLpPN7S1nTcDy2WXLnm5rzrtdWA2H2t6Y',
      'crypto.MATIC.version.ERC20.address':
        ethAddress || '0xCD0DAdAb45bAF9a06ce1279D1342EcC3F44845af',
      'ipfs.html.value': 'QmcYziSwETZ5v9yKG3Nvx7qx58sPT3PDhfnqTrPJiitx8a',
      'crypto.MATIC.version.MATIC.address':
        '0xcd0dadab45baf9a06ce1279d1342ecc3f44845af',
      'crypto.HBAR.address': '0.0.1345041',
    },
    social: {
      followingCount: 0,
      followerCount: 0,
    },
  };
};

export const mockTokenEntry = (): TokenEntry => ({
  type: TokenType.Native,
  symbol: 'ETH',
  name: 'Ethereum',
  ticker: 'ETH',
  value: 100,
  balance: 10,
  tokenConversionUsd: 3.8512,
  walletAddress: '0x123',
  walletBlockChainLink: 'https://etherscan.io/address/0x123',
  walletName: 'Ethereum',
});

export const mockWallets = (
  wallets: SerializedWalletBalance[] = [],
): SerializedWalletBalance[] => {
  return [
    ...wallets,
    {
      type: TokenType.Native,
      address: VALID_ETH_ADDRESS,
      symbol: 'ETH',
      gasCurrency: 'ETH',
      name: 'Ethereum',
      balance: '10',
      balanceAmt: 10,
      firstTx: new Date(0),
      lastTx: new Date(),
      nfts: [],
      tokens: [],
      blockchainScanUrl: 'https://etherscan.io/address/0x123',
      totalValueUsd: '10',
    },
  ];
};
