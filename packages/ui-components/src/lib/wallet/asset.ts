import config from '@unstoppabledomains/config';

import {TokenEntry} from '../../components/Wallet/Token';
import {notifyEvent} from '../error';
import {SUPPORTED_SIGNING_SYMBOLS} from '../types';
import {AccountAsset} from '../types/fireBlocks';

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
      return (
        a.blockchainAsset.blockchain.name.toLowerCase() ===
          opts.token.walletName.toLowerCase() &&
        a.blockchainAsset.symbol.toLowerCase() ===
          opts.token.ticker.toLowerCase() &&
        a.address.toLowerCase() === opts.token.walletAddress.toLowerCase()
      );
    }

    // use default blockchain symbol
    return (
      a.blockchainAsset.blockchain.id.toLowerCase() ===
        config.WALLETS.SIGNATURE_SYMBOL.split('/')[0].toLowerCase() &&
      a.blockchainAsset.symbol.toLowerCase() ===
        config.WALLETS.SIGNATURE_SYMBOL.split('/')[1].toLowerCase() &&
      a.address.toLowerCase() === opts?.address?.toLowerCase()
    );
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
