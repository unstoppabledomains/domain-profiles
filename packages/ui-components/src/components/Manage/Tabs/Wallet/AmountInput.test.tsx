import {fireEvent} from '@testing-library/react';
import React from 'react';

import {mockAsset} from '../../../../tests/mocks/wallet';
import {customRender} from '../../../../tests/test-utils';
import AmountInput from './AmountInput';

const defaultProps = {
  initialAmount: '0',
  amountInputRef: {current: null},
  asset: mockAsset(),
  onTokenAmountChange: jest.fn(),
};

describe('<AmountInput />', () => {
  it('renders the amount conversion', () => {
    const {getByText} = customRender(<AmountInput {...defaultProps} />);
    expect(getByText('~$0.00')).toBeInTheDocument();
  });

  it('should return correct amount', () => {
    const value = '0.0001';
    const {getByTestId} = customRender(<AmountInput {...defaultProps} />);
    fireEvent.change(getByTestId('input-amount'), {
      target: {value},
    });
    expect((getByTestId('input-amount') as HTMLInputElement).value).toBe(value);
    expect(defaultProps.onTokenAmountChange).toHaveBeenCalledWith(value);
  });
  it('should render the converted fiat amount', () => {
    const value = '0.0001';
    const {getByTestId, getByText} = customRender(
      <AmountInput {...defaultProps} />,
    );
    fireEvent.change(getByTestId('input-amount'), {
      target: {value},
    });
    expect(
      getByText(
        `~$${(
          parseFloat(value) * defaultProps.asset.tokenConversionUsd
        ).toFixed(2)}`,
      ),
    ).toBeInTheDocument();
  });
  it('should render insufficient balance', () => {
    const value = '100';
    const {getByTestId, getByText} = customRender(
      <AmountInput {...defaultProps} />,
    );
    fireEvent.change(getByTestId('input-amount'), {
      target: {value},
    });
    expect(getByText('Insufficient balance')).toBeInTheDocument();
  });
  it('should render the converted fiat amount', () => {
    const value = '1';
    const {getByTestId, getByText} = customRender(
      <AmountInput {...defaultProps} />,
    );
    fireEvent.change(getByTestId('input-amount'), {
      target: {value},
    });
    expect(
      getByText(
        `~$${(
          parseFloat(value) * defaultProps.asset.tokenConversionUsd
        ).toFixed(2)}`,
      ),
    ).toBeInTheDocument();
  });
  it('should swap amount value to fiat', () => {
    const value = '1';
    const {getByTestId} = customRender(<AmountInput {...defaultProps} />);
    fireEvent.change(getByTestId('input-amount'), {
      target: {value},
    });
    fireEvent.click(getByTestId('swap-currency-button'));
    expect((getByTestId('input-amount') as HTMLInputElement).value).toBe(
      (parseFloat(value) * defaultProps.asset.tokenConversionUsd).toFixed(2),
    );
  });
  it('should display max amount', () => {
    const {getByTestId} = customRender(<AmountInput {...defaultProps} />);
    fireEvent.click(getByTestId('max-amount-button'));
    expect((getByTestId('input-amount') as HTMLInputElement).value).toBe(
      defaultProps.asset.balance.toString(),
    );
  });
  it('should display max amount after swap to fiat', () => {
    const {getByTestId} = customRender(<AmountInput {...defaultProps} />);
    fireEvent.click(getByTestId('max-amount-button'));
    fireEvent.click(getByTestId('swap-currency-button'));
    expect((getByTestId('input-amount') as HTMLInputElement).value).toBe(
      (
        defaultProps.asset.balance * defaultProps.asset.tokenConversionUsd
      ).toFixed(2),
    );
  });
});
