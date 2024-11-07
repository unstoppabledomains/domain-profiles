import qs from 'qs';

import config from '@unstoppabledomains/config';

import {notifyEvent} from '../lib';
import {fetchApi} from '../lib/fetchApi';
import type {
  RouteQuote,
  SwingQuoteRequest,
  SwingQuoteResponse,
  SwingToken,
  SwingTransactionResponse,
} from '../lib/types/swingXyz';

export const getSwapQuote = async (opts: SwingQuoteRequest) => {
  try {
    // inject project ID and fee from config
    opts.projectId = config.WALLETS.SWAP.PROJECT_ID;
    opts.fee = config.WALLETS.SWAP.FEE_BPS;

    // request the quote
    return await fetchApi<SwingQuoteResponse>(
      `/transfer/quote?${qs.stringify(opts)}`,
      {
        mode: 'cors',
        host: config.WALLETS.SWAP.EXCHANGE_HOST_URL,
        headers: {
          Accept: 'application/json',
        },
      },
    );
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Transaction', {
      msg: 'error fetching swap quote',
    });
  }
  return undefined;
};

export const getSwapToken = async (chain: string, token: string) => {
  try {
    const tokens = await fetchApi<SwingToken[]>(`/tokens?chain=${chain}`, {
      mode: 'cors',
      host: config.WALLETS.SWAP.PLATFORM_HOST_URL,
      headers: {
        Accept: 'application/json',
        'x-swing-environment': config.WALLETS.SWAP.ENVIRONMENT,
      },
    });
    return tokens.find(
      t => t.chain === chain && (t.symbol === token || t.address === token),
    );
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Transaction', {
      msg: 'error fetching tokens',
    });
  }
  return undefined;
};

export const getSwapTransaction = async (
  opts: SwingQuoteRequest,
  quote: RouteQuote,
) => {
  try {
    // inject project ID and fee from config
    opts.projectId = config.WALLETS.SWAP.PROJECT_ID;
    opts.fee = config.WALLETS.SWAP.FEE_BPS;

    // request the quote
    return await fetchApi<SwingTransactionResponse>(`/transfer/send`, {
      method: 'POST',
      mode: 'cors',
      acceptStatusCodes: [200, 201, 400],
      host: config.WALLETS.SWAP.EXCHANGE_HOST_URL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...opts,
        route: quote.route,
      }),
    });
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Transaction', {
      msg: 'error fetching swap transaction',
    });
  }
  return undefined;
};
