import {fireEvent, waitFor} from '@testing-library/react';
import React from 'react';

import * as domainProfileActions from '../../actions/domainProfileActions';
import useResolverKeys from '../../hooks/useResolverKeys';
import {VALID_ETH_ADDRESS} from '../../tests/common';
import {mockProfileData} from '../../tests/mocks/wallet';
import {customRender} from '../../tests/test-utils';
import AddressInput from './AddressInput';

const defaultProps = {
  onAddressChange: jest.fn(),
  onResolvedDomainChange: jest.fn(),
  placeholder: 'Enter address',
  initialResolvedDomainValue: '',
  initialAddressValue: '',
  label: '',
  assetSymbol: 'ETH',
};

const mkProfileData = mockProfileData({ethAddress: VALID_ETH_ADDRESS});

jest
  .spyOn(domainProfileActions, 'getProfileData')
  .mockResolvedValue(mkProfileData);

jest.mock('../../../../hooks/useResolverKeys', () => jest.fn());

(useResolverKeys as jest.Mock).mockReturnValue({
  unsResolverKeys: {
    ResolverKey: {
      'crypto.ETH.address': {
        validationRegex: '^0x[a-fA-F0-9]{40}$',
      },
    },
  },
});

describe('<AddressInput />', () => {
  it('calls onAddressChange with valid eth address', () => {
    const {getByTestId} = customRender(<AddressInput {...defaultProps} />);
    fireEvent.change(getByTestId('input-address-input'), {
      target: {value: VALID_ETH_ADDRESS},
    });
    expect(defaultProps.onAddressChange).toHaveBeenCalledWith(
      VALID_ETH_ADDRESS,
    );
  });
  it('does not call onAddressChange with invalid eth address', () => {
    const invalidAddress = '0xinvalid';
    const {getByTestId} = customRender(<AddressInput {...defaultProps} />);
    fireEvent.change(getByTestId('input-address-input'), {
      target: {value: invalidAddress},
    });
    expect(defaultProps.onAddressChange).toBeCalledWith('');
  });
  it('should resolve domain', async () => {
    const {getByTestId, getByText} = customRender(
      <AddressInput {...defaultProps} />,
    );
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
        getByText(`Successfully resolved ${mkProfileData!.metadata!.domain}`),
      ).toBeInTheDocument();
    });
  });
  it('should display loader when resolving domain', async () => {
    const {getByTestId} = customRender(<AddressInput {...defaultProps} />);
    fireEvent.change(getByTestId('input-address-input'), {
      target: {value: mkProfileData!.metadata!.domain},
    });

    await waitFor(() => {
      expect(getByTestId('loader')).toBeInTheDocument();
    });
  });
  it('should fail to resolve domain', async () => {
    jest.spyOn(domainProfileActions, 'getProfileData').mockResolvedValue({});
    const invalidDomain = 'invalid.x';
    const {getByTestId, getByText} = customRender(
      <AddressInput {...defaultProps} />,
    );
    fireEvent.change(getByTestId('input-address-input'), {
      target: {value: invalidDomain},
    });
    await waitFor(() => {
      expect(
        getByText(`Could not resolve ${invalidDomain} to a valid ETH address`),
      ).toBeInTheDocument();
    });
  });
});
