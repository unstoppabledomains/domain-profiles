import config from '@unstoppabledomains/config';

import {notifyEvent} from '../lib';
import {fetchApi} from '../lib/fetchApi';
import {
  SwingQuoteRequest,
  SwingQuoteResponse,
  SwingToken,
} from '../lib/types/swingXyz';

export const getSwapToken = async (chain: string, token: string) => {
  try {
    const tokens = await fetchApi<SwingToken[]>(`/tokens?chain=${chain}`, {
      mode: 'cors',
      host: config.WALLETS.SWAP.HOST_URL,
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

export const getSwapQuote = async (opts: SwingQuoteRequest) => {
  try {
    return await fetchApi<SwingQuoteResponse>(`/quote`, {
      method: 'POST',
      mode: 'cors',
      host: config.WALLETS.SWAP.HOST_URL,
      body: JSON.stringify(opts),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-swing-environment': config.WALLETS.SWAP.ENVIRONMENT,
      },
    });
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Transaction', {
      msg: 'error fetching quote',
    });
  }
  return undefined;
};
