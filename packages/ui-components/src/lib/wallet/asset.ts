import config from '@unstoppabledomains/config';

import {notifyEvent} from '../error';
import {TokenType} from '../types';
import type {AccountAsset} from '../types/fireBlocks';
import type {TokenEntry} from '../types/wallet';
import {SUPPORTED_SIGNING_SYMBOLS} from '../types/wallet';

export const getAsset = (
  assets: AccountAsset[],
  opts?: {
    address?: string;
    chainId?: number;
    token?: TokenEntry;
  },
): AccountAsset | undefined => {
  // determine if any asset options are specified
  const isOptSpecified = opts
    ? Object.keys(opts).find(k => opts[k] !== undefined) !== undefined
    : false;

  // find the requested asset
  const asset = assets.find(a => {
    // use chain ID if provided
    if (opts?.chainId) {
      return (
        SUPPORTED_SIGNING_SYMBOLS.includes(
          a.blockchainAsset.symbol.toUpperCase(),
        ) && a.blockchainAsset.blockchain.networkId === opts.chainId
      );
    }

    // use token if provided
    if (opts?.token) {
      const isToken =
        opts.token.type === TokenType.Erc20 ||
        opts.token.type === TokenType.Spl;
      const tokenAsset =
        opts.token.walletName.toLowerCase() ===
          a.blockchainAsset.blockchain.name.toLowerCase() &&
        [
          a.blockchainAsset.symbol.toLowerCase(),
          a.blockchainAsset.blockchain.id.toLowerCase(),
        ].includes(
          isToken
            ? opts.token.symbol.toLowerCase()
            : opts.token.ticker.toLowerCase(),
        ) &&
        a.address.toLowerCase() === opts.token.walletAddress.toLowerCase();
      if (tokenAsset) {
        return tokenAsset;
      }
    }

    // find by address on default signing assets
    const SIGNATURE_SYMBOLS = config.WALLETS.SIGNATURE_SYMBOL.split(',');
    for (const SIGNATURE_SYMBOL of SIGNATURE_SYMBOLS) {
      const defaultAsset =
        a.blockchainAsset.blockchain.id.toLowerCase() ===
          SIGNATURE_SYMBOL.split('/')[0].toLowerCase() &&
        a.blockchainAsset.symbol.toLowerCase() ===
          SIGNATURE_SYMBOL.split('/')[1].toLowerCase() &&
        a.address.toLowerCase() === opts?.address?.toLowerCase();
      if (defaultAsset) {
        return defaultAsset;
      }
    }

    // asset not found
    return false;
  });

  // fallback to first element if asset is not found, and no options have
  // been specified
  if (!asset && assets.length > 0 && !isOptSpecified) {
    return assets[0];
  }

  // log warning if asset not found
  if (!asset) {
    notifyEvent('asset not found', 'warning', 'Wallet', 'Fireblocks', {
      meta: {assets, opts},
    });
  }
  return asset;
};
