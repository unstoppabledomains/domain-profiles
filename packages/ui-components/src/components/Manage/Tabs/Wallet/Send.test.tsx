import {act, fireEvent, waitFor} from '@testing-library/react';
import React from 'react';

import {SendCryptoStatusMessage} from '../../../../actions/fireBlocksActions';
import useResolverKeys from '../../../../hooks/useResolverKeys';
import {VALID_ETH_ADDRESS} from '../../../../tests/common';
import {
  mockFireblocksClient,
  mockWallets,
} from '../../../../tests/mocks/wallet';
import {customRender} from '../../../../tests/test-utils';
import Send from './Send';

const defaultProps = {
  onCancelClick: jest.fn(),
  getClient: async () => mockFireblocksClient(),
  accessToken: 'dummy_access_token',
  wallets: mockWallets(),
};

jest.mock('../../../../hooks/useResolverKeys', () => jest.fn());

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
    const {getByTestId} = customRender(<Send {...defaultProps} />);
    fireEvent.click(getByTestId('token-ETH'));
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

  it('updates the recipient address and amount', () => {
    const value = '.0001';
    const {getByTestId} = customRender(<Send {...defaultProps} />);
    act(() => {
      fireEvent.click(getByTestId('token-ETH'));
    });
    act(() => {
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
    const value = '123';
    const {getByTestId, getByText} = customRender(<Send {...defaultProps} />);
    act(() => {
      fireEvent.click(getByTestId('token-ETH'));
    });
    act(() => {
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
    act(() => {
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
});
