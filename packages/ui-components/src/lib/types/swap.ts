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
