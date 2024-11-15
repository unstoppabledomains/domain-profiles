import qs from 'qs';

import config from '@unstoppabledomains/config';

import {notifyEvent} from '../lib';
import {fetchApi} from '../lib/fetchApi';
import type {
  SwingV2AllowanceRequest,
  SwingV2QuoteRequest,
  SwingV2QuoteResponse,
  SwingV2SendRequest,
  SwingV2SendResponse,
  SwingV2SwapStatus,
  SwingV2Token,
  SwingV2TokenAllowance,
  SwingV2TokenApproval,
} from '../lib/types/swingXyzV2';

export const getSwapQuoteV2 = async (opts: SwingV2QuoteRequest) => {
  try {
    // inject project ID and fee from config
    opts.projectId = config.WALLETS.SWAP.PROJECT_ID;
    opts.fee = config.WALLETS.SWAP.FEE_BPS;

    // request the quote
    const quoteResponse = await fetchApi<SwingV2QuoteResponse>(
      `/quote?${qs.stringify(opts)}`,
      {
        mode: 'cors',
        host: config.WALLETS.SWAP.PLATFORM_HOST_URL,
        headers: {
          Accept: 'application/json',
          'x-swing-environment': config.WALLETS.SWAP.ENVIRONMENT,
        },
      },
    );

    // normalize the quote data before returning
    if (quoteResponse?.routes) {
      quoteResponse.routes = quoteResponse.routes.filter(
        r =>
          // integration is not on the disabled list
          !config.WALLETS.SWAP.DISABLED_INTEGRATIONS.includes(
            r.quote.integration.toLowerCase(),
          ) &&
          // integration specifies some amount of gas
          r.gas &&
          r.gas !== '0',
      );
    }
    return quoteResponse;
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Transaction', {
      msg: 'error fetching swap quote',
      meta: opts,
    });
  }
  return undefined;
};

export const getSwapStatusV2 = async (id: number, txHash: string) => {
  try {
    // request the status
    return await fetchApi<SwingV2SwapStatus>(
      `/transactions/${id}?txHash=${txHash}`,
      {
        mode: 'cors',
        host: config.WALLETS.SWAP.PLATFORM_HOST_URL,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-swing-environment': config.WALLETS.SWAP.ENVIRONMENT,
        },
      },
    );
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Transaction', {
      msg: 'error fetching swap status',
      meta: {id, txHash},
    });
  }
  return undefined;
};

export const getSwapTokenAllowance = async (opts: SwingV2AllowanceRequest) => {
  try {
    // request the status
    const tokenAllowance = await fetchApi<SwingV2TokenAllowance>(
      `/transfer/allowance?${qs.stringify(opts)}`,
      {
        mode: 'cors',
        host: config.WALLETS.SWAP.EXCHANGE_HOST_URL,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-swing-environment': config.WALLETS.SWAP.ENVIRONMENT,
        },
      },
    );
    if (tokenAllowance?.allowance) {
      // the allowance return format is in long decimal form
      return parseFloat(tokenAllowance.allowance);
    }
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Transaction', {
      msg: 'error fetching token allowance',
      meta: {opts},
    });
  }
  return 0;
};

export const getSwapTokenV2 = async (chain: string, token: string) => {
  try {
    // request the tokens
    const tokens = await fetchApi<SwingV2Token[]>(`/tokens?chain=${chain}`, {
      mode: 'cors',
      host: config.WALLETS.SWAP.PLATFORM_HOST_URL,
      headers: {
        Accept: 'application/json',
        'x-swing-environment': config.WALLETS.SWAP.ENVIRONMENT,
      },
    });
    // find the specified token
    return tokens.find(
      t => t.chain === chain && (t.symbol === token || t.address === token),
    );
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Transaction', {
      msg: 'error fetching tokens',
      meta: {chain, token},
    });
  }
  return undefined;
};

export const getSwapTransactionV2 = async (opts: SwingV2SendRequest) => {
  try {
    // inject project ID and fee from config
    opts.projectId = config.WALLETS.SWAP.PROJECT_ID;
    opts.fee = config.WALLETS.SWAP.FEE_BPS;

    // request the transaction
    return await fetchApi<SwingV2SendResponse>(`/send`, {
      method: 'POST',
      mode: 'cors',
      acceptStatusCodes: [200, 201, 400],
      host: config.WALLETS.SWAP.PLATFORM_HOST_URL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-swing-environment': config.WALLETS.SWAP.ENVIRONMENT,
      },
      body: JSON.stringify(opts),
    });
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Transaction', {
      msg: 'error fetching swap transaction',
      meta: opts,
    });
  }
  return undefined;
};

export const setSwapTokenAllowance = async (opts: SwingV2AllowanceRequest) => {
  try {
    // request the status
    const approveResponse = await fetchApi<SwingV2TokenApproval>(
      `/transfer/approve?${qs.stringify(opts)}`,
      {
        mode: 'cors',
        host: config.WALLETS.SWAP.EXCHANGE_HOST_URL,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-swing-environment': config.WALLETS.SWAP.ENVIRONMENT,
        },
      },
    );
    if (approveResponse?.tx) {
      return approveResponse.tx;
    }
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Transaction', {
      msg: 'error fetching token approval transaction',
      meta: {opts},
    });
  }
  return undefined;
};
