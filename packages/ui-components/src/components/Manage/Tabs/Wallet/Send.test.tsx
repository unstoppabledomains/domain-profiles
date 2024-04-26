import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import {fireEvent, render} from '@testing-library/react';
import React from 'react';

import type {SerializedWalletBalance} from '../../../../lib';
import {TokenType} from '../../../../lib';
import Send from './Send';

jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('@mui/material/styles'),
  useTheme: () => ({
    palette: {
      primaryShades: {200: '#043893'},
      neutralShades: {200: '#043893'},
      success: {main: '#043893'},
      primary: {main: '#043893'},
      common: {black: '#000000'},
    },
    shape: {
      borderRadius: 9,
    },
  }),
}));

const mockClient = {
  sendTransaction: jest.fn(),
};

const mockWallets = (
  wallets: SerializedWalletBalance[] = [],
): SerializedWalletBalance[] => {
  return [
    ...wallets,
    {
      type: TokenType.Native,
      address: '',
      symbol: 'ETH',
      gasCurrency: '',
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

const defaultProps = {
  onCancelClick: jest.fn(),
  client: {
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
  } as IFireblocksNCW,
  accessToken: 'dummy_access_token',
  wallets: mockWallets(),
};

describe('<Send />', () => {
  it('renders the SelectAsset if no asset is selected', () => {
    const {getByTestId} = render(<Send {...defaultProps} />);
    expect(getByTestId('select-asset-container')).toBeInTheDocument();
  });

  it('handles the back button correctly', () => {
    const {getByTestId} = render(<Send {...defaultProps} />);
    fireEvent.click(getByTestId('back-button'));
    expect(defaultProps.onCancelClick).toHaveBeenCalled();
  });

  //   it('updates the recipient address', () => {
  //     const {getByLabelText} = render(<Send {...defaultProps} />);
  //     fireEvent.change(getByLabelText('Recipient'), {target: {value: '0x456'}});
  //     expect(getByLabelText('Recipient')).toBe('0x456');
  //   });

  //   it('submits the transaction when all inputs are valid', async () => {
  //   it('does not submit the transaction if the amount is invalid', () => {
});
