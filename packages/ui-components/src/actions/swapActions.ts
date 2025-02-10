import qs from 'qs';

import config from '@unstoppabledomains/config';

import {fetchApi, notifyEvent} from '../lib';
import type {
  SwapPlannedTransaction,
  SwapQuote,
  SwapQuoteRequest,
  SwapQuoteResponse,
} from '../lib/types/swap';

export const getSwapQuote = async (address: string, opts: SwapQuoteRequest) => {
  try {
    // request the quote
    return await fetchApi<SwapQuoteResponse>(
      `/public/${address}/swap?${qs.stringify(opts)}`,
      {
        host: config.PROFILE.HOST_URL,
        headers: {
          Accept: 'application/json',
        },
      },
    );
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Transaction', {
      msg: 'error fetching swap quote',
      meta: opts,
    });
  }
  return undefined;
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
