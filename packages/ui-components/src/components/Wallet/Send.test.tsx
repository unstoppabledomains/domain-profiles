import {act, fireEvent, waitFor} from '@testing-library/react';
import React from 'react';

import * as fireBlocksActions from '../../actions/fireBlocksActions';
import * as pav3Actions from '../../actions/pav3Actions';
import * as fireBlocksState from '../../lib/fireBlocks/storage/state';
import type {GetEstimateTransactionResponse} from '../../lib/types/fireBlocks';
import {VALID_ETH_ADDRESS} from '../../tests/common';
import {
  mockAccountAsset,
  mockFireblocksClient,
  mockWallets,
} from '../../tests/mocks/wallet';
import {customRender} from '../../tests/test-utils';
import Send from './Send';

const defaultProps = {
  onCancelClick: jest.fn(),
  getClient: async () => mockFireblocksClient(),
  accessToken: 'dummy_access_token',
  wallets: mockWallets(),
};

describe('<Send />', () => {
  jest.spyOn(fireBlocksActions, 'getTransferGasEstimate').mockResolvedValue({
    networkFee: {amount: '0.0000001'},
  } as GetEstimateTransactionResponse);
  jest
    .spyOn(fireBlocksActions, 'getAccountAssets')
    .mockResolvedValue([mockAccountAsset()]);
  jest.spyOn(fireBlocksState, 'getBootstrapState').mockReturnValue({
    bootstrapToken: 'mockBootstrapToken',
    refreshToken: 'mockRefreshToken',
    deviceId: 'mockDeviceId',
    assets: [mockAccountAsset()],
  });

  beforeAll(() => {
    jest.spyOn(pav3Actions, 'getAllResolverKeys').mockResolvedValue([
      {
        type: 'CRYPTO',
        subType: 'CRYPTO_TOKEN',
        name: 'Ether',
        shortName: 'ETH',
        key: 'token.EVM.ETH.ETH.address',
        mapping: {
          isPreferred: true,
          from: ['crypto.ETH.address'],
          to: 'crypto.ETH.address',
        },
        validation: {
          regexes: [
            {
              name: 'ETH',
              pattern: '^0x[a-fA-F0-9]{40}$',
            },
          ],
        },
      },
    ]);
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

  it('selects asset', async () => {
    const {getByTestId} = customRender(<Send {...defaultProps} />);
    fireEvent.click(getByTestId('token-ETH'));
    await waitFor(() => {
      expect(getByTestId('input-address-input')).toBeInTheDocument();
    });
  });

  it('updates the recipient address', async () => {
    const {getByTestId} = customRender(<Send {...defaultProps} />);
    fireEvent.click(getByTestId('token-ETH'));
    await waitFor(() => {
      expect(getByTestId('input-address-input')).toBeInTheDocument();
    });
    fireEvent.change(getByTestId('input-address-input'), {
      target: {value: VALID_ETH_ADDRESS},
    });
    expect((getByTestId('input-address-input') as HTMLInputElement).value).toBe(
      VALID_ETH_ADDRESS,
    );
    expect((getByTestId('send-button') as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('updates the recipient address and amount', async () => {
    const value = '.0001';
    const {getByTestId} = customRender(<Send {...defaultProps} />);
    act(() => {
      fireEvent.click(getByTestId('token-ETH'));
    });
    await waitFor(() => {
      fireEvent.change(getByTestId('input-address-input'), {
        target: {value: VALID_ETH_ADDRESS},
      });
      fireEvent.change(getByTestId('input-amount'), {
        target: {value},
      });
    });
    expect((getByTestId('input-address-input') as HTMLInputElement).value).toBe(
      VALID_ETH_ADDRESS,
    );
    expect((getByTestId('input-amount') as HTMLInputElement).value).toBe(value);
    expect((getByTestId('send-button') as HTMLButtonElement).disabled).toBe(
      false,
    );
  });

  it('should keep send button disabled for invalid recipient address', async () => {
    const address = '0xinvalid';
    const value = '.0001';
    const {getByTestId} = customRender(<Send {...defaultProps} />);
    act(() => {
      fireEvent.click(getByTestId('token-ETH'));
    });
    await waitFor(() => {
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

  it('should keep send button disabled for invalid amount', async () => {
    const value = '123';
    const {getByTestId, getByText} = customRender(<Send {...defaultProps} />);
    act(() => {
      fireEvent.click(getByTestId('token-ETH'));
    });
    await waitFor(() => {
      fireEvent.change(getByTestId('input-address-input'), {
        target: {value: VALID_ETH_ADDRESS},
      });
      fireEvent.change(getByTestId('input-amount'), {
        target: {value},
      });
    });
    expect((getByTestId('input-address-input') as HTMLInputElement).value).toBe(
      VALID_ETH_ADDRESS,
    );
    expect((getByTestId('input-amount') as HTMLInputElement).value).toBe(value);
    expect((getByTestId('send-button') as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect(getByText('Insufficient balance')).toBeInTheDocument();
  });
  it('should go to send confirmation page', async () => {
    const value = '.00001';
    const {getByTestId, getByText} = customRender(<Send {...defaultProps} />);
    act(() => {
      fireEvent.click(getByTestId('token-ETH'));
    });
    await waitFor(() => {
      fireEvent.change(getByTestId('input-address-input'), {
        target: {value: VALID_ETH_ADDRESS},
      });
      fireEvent.change(getByTestId('input-amount'), {
        target: {value},
      });
    });
    act(() => {
      fireEvent.click(getByTestId('send-button'));
    });

    await waitFor(() => {
      expect(getByText('Summary')).toBeInTheDocument();
    });
  });
  it('should go to submit transaction after send confirmation', async () => {
    const value = '.00001';
    const {getByTestId, getByText} = customRender(<Send {...defaultProps} />);
    act(() => {
      fireEvent.click(getByTestId('token-ETH'));
    });
    await waitFor(() => {
      fireEvent.change(getByTestId('input-address-input'), {
        target: {value: VALID_ETH_ADDRESS},
      });
      fireEvent.change(getByTestId('input-amount'), {
        target: {value},
      });
    });
    act(() => {
      fireEvent.click(getByTestId('send-button'));
    });
    act(() => {
      fireEvent.click(getByTestId('send-confirm-button'));
    });

    await waitFor(() => {
      expect(
        getByText(
          'Checking queued transfers. Leave window open until complete...',
        ),
      ).toBeInTheDocument();
    });
  });
});
