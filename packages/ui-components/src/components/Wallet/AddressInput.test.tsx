import {fireEvent, waitFor} from '@testing-library/react';
import React from 'react';

import * as domainProfileActions from '../../actions/domainProfileActions';
import * as pav3Actions from '../../actions/pav3Actions';
import {VALID_ETH_ADDRESS} from '../../tests/common';
import {mockProfileData, mockTokenEntry} from '../../tests/mocks/wallet';
import {customRender} from '../../tests/test-utils';
import AddressInput from './AddressInput';

const defaultProps = {
  onAddressChange: jest.fn(),
  onResolvedDomainChange: jest.fn(),
  placeholder: 'Enter address',
  initialResolvedDomainValue: '',
  initialAddressValue: '',
  label: '',
  asset: mockTokenEntry(),
};

const mkProfileData = mockProfileData({ethAddress: VALID_ETH_ADDRESS});

jest
  .spyOn(domainProfileActions, 'getProfileData')
  .mockResolvedValue(mkProfileData);

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

describe('<AddressInput />', () => {
  it('calls onAddressChange with valid eth address', async () => {
    const {getByTestId} = customRender(<AddressInput {...defaultProps} />);

    // wait for textbox to be rendered
    await waitFor(() => {
      expect(getByTestId('input-address-input')).toBeDefined();
    });

    // add text
    fireEvent.change(getByTestId('input-address-input'), {
      target: {value: VALID_ETH_ADDRESS},
    });
    expect(defaultProps.onAddressChange).toHaveBeenCalledWith(
      VALID_ETH_ADDRESS,
    );
  });

  it('does not call onAddressChange with invalid eth address', async () => {
    // wait for textbox to be rendered
    const invalidAddress = '0xinvalid';
    const {getByTestId} = customRender(<AddressInput {...defaultProps} />);
    await waitFor(() => {
      expect(getByTestId('input-address-input')).toBeDefined();
    });

    // add text
    fireEvent.change(getByTestId('input-address-input'), {
      target: {value: invalidAddress},
    });
    expect(defaultProps.onAddressChange).toBeCalledWith('');
  });

  it('should resolve domain', async () => {
    // wait for textbox to be rendered
    const {getByTestId, getByText} = customRender(
      <AddressInput {...defaultProps} />,
    );
    await waitFor(() => {
      expect(getByTestId('input-address-input')).toBeDefined();
    });

    // add text
    fireEvent.change(getByTestId('input-address-input'), {
      target: {value: mkProfileData!.metadata!.domain},
    });

    await waitFor(() => {
      expect(defaultProps.onAddressChange).toBeCalledWith(
        mkProfileData!.records!['crypto.ETH.address'],
      );
      expect(
        (getByTestId('input-address-input') as HTMLInputElement).value,
      ).toBe(mkProfileData!.records!['crypto.ETH.address']);
      expect(
        getByText(`Wallet found for ${mkProfileData!.metadata!.domain}`),
      ).toBeInTheDocument();
    });
  });

  it('should display loader when resolving domain', async () => {
    // wait for textbox to be rendered
    const {getByTestId} = customRender(<AddressInput {...defaultProps} />);
    await waitFor(() => {
      expect(getByTestId('input-address-input')).toBeDefined();
    });

    // add text
    fireEvent.change(getByTestId('input-address-input'), {
      target: {value: mkProfileData!.metadata!.domain},
    });

    await waitFor(() => {
      expect(getByTestId('loader')).toBeInTheDocument();
    });
  });

  it('should fail to resolve domain', async () => {
    // wait for textbox to be rendered
    jest.spyOn(domainProfileActions, 'getProfileData').mockResolvedValue({});
    const invalidDomain = 'invalid.x';
    const {getByTestId, getByText} = customRender(
      <AddressInput {...defaultProps} />,
    );
    await waitFor(() => {
      expect(getByTestId('input-address-input')).toBeDefined();
    });

    // add text
    fireEvent.change(getByTestId('input-address-input'), {
      target: {value: invalidDomain},
    });
    await waitFor(() => {
      expect(
        getByText(`Could not find recipient wallet address`),
      ).toBeInTheDocument();
    });
  });
});
