import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import {act, fireEvent, waitFor} from '@testing-library/react';
import React from 'react';

import {SendCryptoStatusMessage} from '../../../../actions/fireBlocksActions';
import useResolverKeys from '../../../../hooks/useResolverKeys';
import type {SerializedWalletBalance} from '../../../../lib';
import {TokenType} from '../../../../lib';
import {customRender} from '../../../../tests/test-utils';
import Send from './Send';

const mockWallets = (
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

jest.mock('../../../../hooks/useResolverKeys', () => jest.fn());

const VALID_ETH_ADDRESS = '0x58cA45E932a88b2E7D0130712B3AA9fB7c5781e2';

describe('<Send />', () => {
  beforeAll(() => {
    (useResolverKeys as jest.Mock).mockReturnValue({
      unsResolverKeys: {
        ResolverKey: {
          'crypto.ETH.address': {
            validationRegex: '^0x[a-fA-F0-9]{40}$',
          },
        },
      },
    });
  });
  it('renders the SelectAsset if no asset is selected', () => {
    const {getByTestId} = customRender(<Send {...defaultProps} />);
    expect(getByTestId('select-asset-container')).toBeInTheDocument();
  });

  it('handles the back button correctly', () => {
    const {getByTestId} = customRender(<Send {...defaultProps} />);
    fireEvent.click(getByTestId('back-button'));
    expect(defaultProps.onCancelClick).toHaveBeenCalled();
  });

  it('selects asset', () => {
    const {getByTestId} = customRender(<Send {...defaultProps} />);
    fireEvent.click(getByTestId('token-ETH'));
    expect(getByTestId('input-address-input')).toBeInTheDocument();
  });

  it('updates the recipient address', () => {
    const address = VALID_ETH_ADDRESS;
    const {getByTestId} = customRender(<Send {...defaultProps} />);
    fireEvent.click(getByTestId('token-ETH'));
    fireEvent.change(getByTestId('input-address-input'), {
      target: {value: address},
    });
    expect((getByTestId('input-address-input') as HTMLInputElement).value).toBe(
      address,
    );
    expect((getByTestId('send-button') as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('updates the recipient address and amount', () => {
    const address = VALID_ETH_ADDRESS;
    const value = '.0001';
    const {getByTestId} = customRender(<Send {...defaultProps} />);
    act(() => {
      fireEvent.click(getByTestId('token-ETH'));
    });
    act(() => {
      fireEvent.change(getByTestId('input-address-input'), {
        target: {value: address},
      });
      fireEvent.change(getByTestId('input-amount'), {
        target: {value},
      });
    });
    expect((getByTestId('input-address-input') as HTMLInputElement).value).toBe(
      address,
    );
    expect((getByTestId('input-amount') as HTMLInputElement).value).toBe(value);
    expect((getByTestId('send-button') as HTMLButtonElement).disabled).toBe(
      false,
    );
  });

  it('should keep send button disabled for invalid recipient address', () => {
    const address = '0xinvalid';
    const value = '.0001';
    const {getByTestId} = customRender(<Send {...defaultProps} />);
    act(() => {
      fireEvent.click(getByTestId('token-ETH'));
    });
    act(() => {
      fireEvent.change(getByTestId('input-address-input'), {
        target: {value: address},
      });
      fireEvent.change(getByTestId('input-amount'), {
        target: {value},
      });
    });
    expect((getByTestId('input-address-input') as HTMLInputElement).value).toBe(
      address,
    );
    expect((getByTestId('input-amount') as HTMLInputElement).value).toBe(value);
    expect((getByTestId('send-button') as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('should keep send button disabled for invalid amount', () => {
    const address = VALID_ETH_ADDRESS;
    const value = '123';
    const {getByTestId, getByText} = customRender(<Send {...defaultProps} />);
    act(() => {
      fireEvent.click(getByTestId('token-ETH'));
    });
    act(() => {
      fireEvent.change(getByTestId('input-address-input'), {
        target: {value: address},
      });
      fireEvent.change(getByTestId('input-amount'), {
        target: {value},
      });
    });
    expect((getByTestId('input-address-input') as HTMLInputElement).value).toBe(
      address,
    );
    expect((getByTestId('input-amount') as HTMLInputElement).value).toBe(value);
    expect((getByTestId('send-button') as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect(getByText('Insufficient balance')).toBeInTheDocument();
  });
  it('should submit transaction', async () => {
    const address = VALID_ETH_ADDRESS;
    const value = '.00001';
    const {getByTestId, getByText} = customRender(<Send {...defaultProps} />);
    act(() => {
      fireEvent.click(getByTestId('token-ETH'));
    });
    act(() => {
      fireEvent.change(getByTestId('input-address-input'), {
        target: {value: address},
      });
      fireEvent.change(getByTestId('input-amount'), {
        target: {value},
      });
    });
    act(() => {
      fireEvent.click(getByTestId('send-button'));
    });

    await waitFor(() => {
      expect(
        getByText(SendCryptoStatusMessage.RETRIEVING_ACCOUNT),
      ).toBeInTheDocument();
    });
  });
});
