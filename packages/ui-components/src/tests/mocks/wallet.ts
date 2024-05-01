import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';

import type {SerializedWalletBalance} from '../../lib';
import {TokenType} from '../../lib';

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
