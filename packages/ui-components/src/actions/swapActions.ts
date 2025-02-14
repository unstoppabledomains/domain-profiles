import qs from 'qs';

import config from '@unstoppabledomains/config';

import {fetchApi, notifyEvent} from '../lib';
import type {
  SwapPlannedTransaction,
  SwapQuote,
  SwapQuoteRequest,
  SwapQuoteResponse,
  SwapToken,
} from '../lib/types/swap';

const MAX_PRICE_IMPACT = 25;

export const getSwapChains = async () => {
  try {
    return await fetchApi<string[]>(`/public/swap/chains`, {
      host: config.PROFILE.HOST_URL,
    });
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Transaction', {
      msg: 'error fetching swap chains',
    });
  }
  return [];
};

export const getSwapQuote = async (address: string, opts: SwapQuoteRequest) => {
  try {
    // request the quote
    const quotes = await fetchApi<SwapQuoteResponse>(
      `/public/${address}/swap?${qs.stringify(opts)}`,
      {
        host: config.PROFILE.HOST_URL,
        headers: {
          Accept: 'application/json',
        },
      },
    );
    const filteredQuotes = quotes.filter(
      q =>
        q.quote.priceImpact &&
        Math.abs(parseFloat(q.quote.priceImpact)) < MAX_PRICE_IMPACT,
    );
    if (filteredQuotes.length > 0) {
      return filteredQuotes;
    }
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Transaction', {
      msg: 'error fetching swap quote',
      meta: opts,
    });
  }
  return undefined;
};

export const getSwapToken = async (chain: string, token: string) => {
  try {
    const swapToken = await fetchApi<SwapToken[]>(
      `/public/swap/tokens?${qs.stringify({chain, token})}`,
      {
        host: config.PROFILE.HOST_URL,
      },
    );
    if (!swapToken || swapToken.length === 0 || !swapToken[0]?.address) {
      throw new Error('token not found');
    }
    return swapToken[0];
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Transaction', {
      msg: 'error fetching swap tokens',
      meta: {chain},
    });
  }
  return undefined;
};

export const getSwapTokens = async () => {
  const chains = await getSwapChains();
  const tokens = await Promise.all(
    chains.map(chain => getSwapTokensForChain(chain)),
  );
  return tokens
    ?.flat()
    .filter(t => t?.symbol && t?.priceUsd && t?.address)
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
};

export const getSwapTokensForChain = async (chain: string) => {
  try {
    return await fetchApi<SwapToken[]>(
      `/public/swap/tokens?${qs.stringify({chain})}`,
      {
        host: config.PROFILE.HOST_URL,
      },
    );
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Transaction', {
      msg: 'error fetching swap tokens',
      meta: {chain},
    });
  }
  return [];
};

export const getSwapTransactionPlan = async (
  address: string,
  opts: SwapQuoteRequest,
  quote: SwapQuote,
) => {
  try {
    // request the quote
    return await fetchApi<SwapPlannedTransaction[]>(
      `/public/${address}/swap?${qs.stringify(opts)}`,
      {
        host: config.PROFILE.HOST_URL,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quote),
      },
    );
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Transaction', {
      msg: 'error fetching swap transaction plan',
      meta: opts,
    });
  }
  return undefined;
};
