import type {SwapConfig} from '@unstoppabledomains/config/build/src/env/types';

import type {CreateTransaction} from './fireBlocks';

export interface Fee {
  type: string;
  amount: string;
  amountUSD: string;
  chainSlug: string;
  tokenSymbol: string;
  tokenAddress: string;
  decimals: number;
  deductedFromSourceToken: boolean;
}

export interface Quote {
  integration: string;
  type: string;
  bridgeFee: string;
  bridgeFeeInNativeToken: string;
  amount: string;
  decimals: number;
  amountUSD: string;
  bridgeFeeUSD: string;
  bridgeFeeInNativeTokenUSD: string;
  fees: Fee[];
  priceImpact: string;
}

export interface Route {
  bridge: string;
  bridgeTokenAddress: string;
  steps: string[];
  name: string;
  part: number;
}

// internal type used to define a swap pair
export type SwapConfigToken = SwapConfig & {
  balance?: number;
  value?: number;
  walletAddress: string;
};

export type SwapPlannedTransaction = {
  id?: string;
  type: 'approval' | 'execution';
  transaction: CreateTransaction | string;
};

export interface SwapQuote {
  duration: number;
  gas: string;
  quote: Quote;
  route: Route[];
  gasUSD: string;
}

export interface SwapQuoteRequest {
  fromChain: string;
  fromToken: string;
  fromTokenAmountUsd: string;
  toChain: string;
  toToken: string;
  toWalletAddress: string;
}

export type SwapQuoteResponse = SwapQuote[];

export interface SwapToken {
  chain: string;
  symbol: string;
  address: string;
  decimals: number;
  logo: string;
  priceUsd: number;
}

export const isSwapConfigTokenEqual = (
  a?: SwapConfigToken,
  b?: SwapConfigToken,
) => {
  if (!a || !b) {
    return false;
  }
  return (
    a.swing.chain.toLowerCase() === b.swing.chain.toLowerCase() &&
    a.tokenSymbol.toLowerCase() === b.tokenSymbol.toLowerCase()
  );
};
