import {fireEvent, waitFor} from '@testing-library/react';
import React from 'react';

import * as fireBlocksActions from '../../actions/fireBlocksActions';
import {CustodyState, DomainProfileKeys, TokenType} from '../../lib';
import * as fireBlocksState from '../../lib/wallet/storage/state';
import {mockAccountAsset, mockWallets} from '../../tests/mocks/wallet';
import {customRender} from '../../tests/test-utils';
import {localStorageWrapper} from '../Chat/storage';
import Swap from './Swap';

// Create mock functions
const mockGetSwapTokens = jest.fn().mockResolvedValue([
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    chain: 'ethereum',
    decimals: 18,
    logo: 'https://example.com/eth.png',
    priceUsd: 3000,
    type: 'native',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    address: '11111111111111111111111111111111',
    chain: 'solana',
    decimals: 18,
    logo: 'https://example.com/sol.png',
    priceUsd: 2000,
    type: 'native',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    chain: 'ethereum',
    decimals: 6,
    logo: 'https://example.com/usdc.png',
    priceUsd: 1,
    type: 'erc20',
  },
]);

const mockGetSwapQuote = jest.fn().mockResolvedValue([
  {
    quote: {
      id: 'quote-123',
      type: 'swap',
      integration: 'uniswap',
      amount: '0.9995',
      amountUsd: '0.9995',
      decimals: 9,
      fee: '0.0005',
      feeUsd: '0.0005',
      fromAmount: '0.0003',
      fromAmountUsd: '1.00',
      gas: '0.0001',
      gasUsd: '0.30',
      duration: 2,
      fees: [
        {
          type: 'gas',
          amount: '0.0001',
          amountUsd: '0.30',
          decimals: 18,
          chainSlug: 'ethereum',
          tokenSymbol: 'ETH',
          tokenAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          deductedFromSourceToken: true,
        },
      ],
    },
    route: [
      {
        bridge: 'uniswap',
        fromChain: 'ethereum',
        toChain: 'ethereum',
      },
    ],
  },
]);

const mockGetSwapTransactionPlan = jest.fn().mockResolvedValue([
  {
    type: 'execution',
    transaction: {
      chainId: 1,
      to: '0x1234567890123456789012345678901234567890',
      data: '0xabcdef',
      value: '0',
      gasLimit: '100000',
    },
  },
]);

const defaultProps = {
  onCancelClick: jest.fn(),
  accessToken: 'dummy_access_token',
  wallets: mockWallets([
    {
      type: TokenType.Native,
      address: '11111111111111111111111111111111',
      symbol: 'SOL',
      gasCurrency: 'SOL',
      name: 'Solana',
      balance: '9',
      balanceAmt: 9,
      value: {
        marketUsd: '9',
        marketUsdAmt: 9,
        walletUsd: '9',
        walletUsdAmt: 9,
      },
      firstTx: new Date(0),
      lastTx: new Date(),
      nfts: [],
      tokens: [],
      blockchainScanUrl: 'https://etherscan.io/address/0x123',
      totalValueUsd: '9',
      totalValueUsdAmt: 9,
    },
    {
      type: TokenType.Native,
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      symbol: 'ETH',
      gasCurrency: 'ETH',
      name: 'Ethereum',
      balance: '10',
      balanceAmt: 10,
      value: {
        marketUsd: '10',
        marketUsdAmt: 10,
        walletUsd: '10',
        walletUsdAmt: 10,
      },
      firstTx: new Date(0),
      lastTx: new Date(),
      nfts: [],
      tokens: [],
      blockchainScanUrl: 'https://etherscan.io/address/0x123',
      totalValueUsd: '10',
      totalValueUsdAmt: 10,
    },
  ]),
};

// Mock the necessary functions for the Swap component
jest.mock('../../actions/swapActions', () => {
  return {
    getSwapTokens: (...args: unknown[]) => mockGetSwapTokens(...args),
    getSwapQuote: (...args: unknown[]) => mockGetSwapQuote(...args),
    getSwapTransactionPlan: (...args: unknown[]) =>
      mockGetSwapTransactionPlan(...args),
  };
});

describe('<Swap />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSwapQuote.mockResolvedValue([
      {
        quote: {
          id: 'quote-123',
          type: 'swap',
          integration: 'uniswap',
          amount: '0.9995',
          amountUsd: '0.9995',
          fee: '0.0005',
          feeUsd: '0.0005',
          fromAmount: '0.0003',
          fromAmountUsd: '1.00',
          gas: '0.0001',
          gasUsd: '0.30',
          duration: 2,
        },
        route: [
          {
            bridge: 'uniswap',
            fromChain: 'ethereum',
            toChain: 'ethereum',
          },
        ],
      },
    ]);
    jest.spyOn(fireBlocksState, 'getBootstrapState').mockReturnValue({
      bootstrapToken: 'mockBootstrapToken',
      refreshToken: 'mockRefreshToken',
      assets: [mockAccountAsset()],
      custodyState: {
        state: CustodyState.SELF_CUSTODY,
        status: 'COMPLETED',
      },
    });
    jest
      .spyOn(localStorageWrapper, 'getItem')
      .mockImplementation(async (key: string) => {
        if (key === DomainProfileKeys.WalletSwapMode) {
          return 'usd';
        } else if (key === DomainProfileKeys.BannerSwapIntro) {
          return String(Date.now());
        }
        return Promise.resolve(null);
      });
    jest
      .spyOn(fireBlocksActions, 'getAccountAssets')
      .mockResolvedValue([mockAccountAsset()]);
  });

  it('renders the component with intro banner', async () => {
    // assume the banner flag is not set
    jest.spyOn(localStorageWrapper, 'getItem').mockResolvedValue(null);

    // render with intro banner
    const {getByText} = customRender(<Swap {...defaultProps} />);

    // wait for banner to be visible
    await waitFor(() => {
      expect(getByText('Convert tokens')).toBeInTheDocument();
      expect(getByText("Let's go")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(mockGetSwapTokens).toHaveBeenCalled();
    });

    // click on let's go
    fireEvent.click(getByText("Let's go"));

    // wait for banner to be hidden
    await waitFor(() => {
      expect(() => getByText('Convert tokens')).toThrow();
      expect(getByText('Swap your crypto')).toBeInTheDocument();
    });
  });

  it('handles the back button correctly', () => {
    const {getByTestId} = customRender(<Swap {...defaultProps} />);
    fireEvent.click(getByTestId('back-button'));
    expect(defaultProps.onCancelClick).toHaveBeenCalled();
  });

  it('allows selecting source token', async () => {
    const {getByTestId} = customRender(<Swap {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetSwapTokens).toHaveBeenCalled();
      expect(getByTestId('source-token-ETH')).toBeInTheDocument();
      expect(getByTestId('destination-token-USDC')).toBeInTheDocument();
    });

    // Click on the source token selector
    fireEvent.click(getByTestId('source-token-ETH'));

    await waitFor(() => {
      expect(getByTestId('swap-token-modal')).toBeInTheDocument();
      expect(getByTestId('menu-item-token-SOL')).toBeInTheDocument();
    });

    // Select SOL as the new source token
    fireEvent.click(getByTestId('menu-item-token-SOL'));

    await waitFor(() => {
      expect(() => getByTestId('swap-token-modal')).toThrow();
    });

    // make sure SOL is set to the new source token
    await waitFor(() => {
      expect(getByTestId('source-token-SOL')).toBeInTheDocument();
      expect(getByTestId('destination-token-USDC')).toBeInTheDocument();
    });
  });

  it('allows selecting destination token', async () => {
    const {getByTestId} = customRender(<Swap {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetSwapTokens).toHaveBeenCalled();
      expect(getByTestId('source-token-ETH')).toBeInTheDocument();
      expect(getByTestId('destination-token-USDC')).toBeInTheDocument();
    });

    // Click on the source token selector
    fireEvent.click(getByTestId('destination-token-USDC'));

    await waitFor(() => {
      expect(getByTestId('swap-token-modal')).toBeInTheDocument();
      expect(getByTestId('show-all-chains-button')).toBeInTheDocument();
      expect(getByTestId('menu-item-token-USDC')).toBeInTheDocument();
      expect(() => getByTestId('menu-item-token-SOL')).toThrow();
    });

    // Click the show all chains button
    fireEvent.click(getByTestId('show-all-chains-button'));

    // make sure the Solana token is visible
    await waitFor(() => {
      expect(getByTestId('menu-item-token-SOL')).toBeInTheDocument();
    });

    // Select SOL as the new source token
    fireEvent.click(getByTestId('menu-item-token-SOL'));

    await waitFor(() => {
      expect(() => getByTestId('swap-token-modal')).toThrow();
    });

    // make sure SOL is set to the new source token
    await waitFor(() => {
      expect(getByTestId('source-token-ETH')).toBeInTheDocument();
      expect(getByTestId('destination-token-SOL')).toBeInTheDocument();
    });
  });

  it('updates the source amount and can execute a quote in basic mode', async () => {
    const {getByTestId} = customRender(<Swap {...defaultProps} />);

    // ensure the source and destination tokens are set
    await waitFor(() => {
      expect(mockGetSwapTokens).toHaveBeenCalled();
      expect(getByTestId('source-token-ETH')).toBeInTheDocument();
      expect(getByTestId('destination-token-USDC')).toBeInTheDocument();
      expect(getByTestId('input-source-token-amount')).toBeInTheDocument();
    });

    // ensure quote API not yet called
    expect(mockGetSwapQuote).not.toHaveBeenCalled();
    expect(mockGetSwapTransactionPlan).not.toHaveBeenCalled();

    // Enter a source amount
    fireEvent.change(getByTestId('input-source-token-amount'), {
      target: {value: '1.00'},
    });

    // Wait for debounced quote request
    await waitFor(
      () => {
        expect(mockGetSwapQuote).toHaveBeenCalled();
      },
      {timeout: 2000},
    );

    expect(() => getByTestId('fee-summary-table')).toThrow();

    // ensure the execute button is visible
    await waitFor(() => {
      expect(getByTestId('execute-swap-button')).toBeInTheDocument();
    });

    // click on the execute button
    fireEvent.click(getByTestId('execute-swap-button'));

    // ensure the transaction plan API has been called
    await waitFor(() => {
      expect(mockGetSwapTransactionPlan).toHaveBeenCalled();
    });
  });

  it('can toggle mode and can execute a quote in advanced mode', async () => {
    const {getByTestId} = customRender(<Swap {...defaultProps} />);

    // ensure the source and destination tokens are set
    await waitFor(() => {
      expect(mockGetSwapTokens).toHaveBeenCalled();
      expect(getByTestId('source-token-ETH')).toBeInTheDocument();
      expect(getByTestId('destination-token-USDC')).toBeInTheDocument();
      expect(getByTestId('input-source-token-amount')).toBeInTheDocument();
      expect(getByTestId('switch-mode-button')).toBeInTheDocument();
    });

    // ensure quote API not yet called
    expect(mockGetSwapQuote).not.toHaveBeenCalled();
    expect(mockGetSwapTransactionPlan).not.toHaveBeenCalled();

    // click on the switch mode button
    fireEvent.click(getByTestId('switch-mode-button'));

    // Enter a source amount
    fireEvent.change(getByTestId('input-source-token-amount'), {
      target: {value: '1.00'},
    });

    // Wait for debounced quote request
    await waitFor(
      () => {
        expect(mockGetSwapQuote).toHaveBeenCalled();
      },
      {timeout: 2000},
    );

    expect(getByTestId('fee-summary-table')).toBeInTheDocument();
    expect(() => getByTestId('error-message')).toThrow();

    // ensure the execute button is visible
    await waitFor(() => {
      expect(getByTestId('execute-swap-button')).toBeInTheDocument();
    });

    // click on the execute button
    fireEvent.click(getByTestId('execute-swap-button'));

    // ensure the transaction plan API has been called
    await waitFor(() => {
      expect(mockGetSwapTransactionPlan).toHaveBeenCalled();
    });
  });

  it('shows error message when quote retrieval fails', async () => {
    // mock an empty quote
    mockGetSwapQuote.mockResolvedValue(undefined);

    // render the component
    const {getByTestId} = customRender(<Swap {...defaultProps} />);

    // ensure the source and destination tokens are set
    await waitFor(() => {
      expect(mockGetSwapTokens).toHaveBeenCalled();
      expect(getByTestId('source-token-ETH')).toBeInTheDocument();
      expect(getByTestId('destination-token-USDC')).toBeInTheDocument();
      expect(getByTestId('input-source-token-amount')).toBeInTheDocument();
    });

    // ensure quote API not yet called
    expect(mockGetSwapQuote).not.toHaveBeenCalled();
    expect(mockGetSwapTransactionPlan).not.toHaveBeenCalled();

    // Enter a source amount
    fireEvent.change(getByTestId('input-source-token-amount'), {
      target: {value: '1.00'},
    });

    // Wait for debounced quote request
    await waitFor(
      () => {
        expect(mockGetSwapQuote).toHaveBeenCalled();
      },
      {timeout: 2000},
    );

    expect(() => getByTestId('execute-swap-button')).toThrow();
    expect(getByTestId('error-message')).toBeInTheDocument();
  });
});
