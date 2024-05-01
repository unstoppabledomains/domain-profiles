import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';

import type {TokenEntry} from '../../components/Wallet/Token';
import type {SerializedWalletBalance} from '../../lib';
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
      },
    },
    accountId: '',
  };
};

export const mockAsset = (): TokenEntry => ({
  type: TokenType.Native,
  symbol: 'ETH',
  name: 'Ethereum',
  ticker: 'ETH',
  value: 10,
  balance: 10,
  walletAddress: '0x123',
  walletBlockChainLink: 'https://etherscan.io/address/0x123',
  walletName: 'Ethereum',
});

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

export const mockWallets = (
  wallets: SerializedWalletBalance[] = [],
): SerializedWalletBalance[] => {
  return [
    ...wallets,
    {
      type: TokenType.Native,
      address: '',
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
