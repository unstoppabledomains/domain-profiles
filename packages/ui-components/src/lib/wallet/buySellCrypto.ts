import {stringify} from 'querystring';

import config from '@unstoppabledomains/config';

import {getBlockchainDisplaySymbol} from '../../components/Manage/common/verification/types';
import {notifyEvent} from '../error';
import type {TokenEntry} from '../types';

export const isBuySellEnabled = (asset: TokenEntry) => {
  return config.WALLETS.CHAINS.BUY.includes(
    `${asset.symbol.toUpperCase()}/${asset.ticker.toUpperCase()}`,
  );
};

export const openBuySellPopup = async (asset: TokenEntry) => {
  // popup window dimensions
  const popupWidth = 400;
  const popupHeight = 700;

  // build the URL for standalone fiat ramp on e-commerce
  const queryParams = stringify({
    blockchain: asset.name.toLowerCase(),
    address: asset.walletAddress,
    token: getBlockchainDisplaySymbol(asset.ticker),
    utm_source: 'ud_me',
  });
  const url = `${config.UNSTOPPABLE_WEBSITE_URL}/fiat-ramps/popup?${queryParams}`;

  // open in extension popup if available
  try {
    if (chrome?.windows) {
      // lookup the parent window dimensions
      const parentWindow = await chrome.windows.getCurrent();

      // determine location of popup based on parent window
      const popupTop = parentWindow?.top;
      const popupLeft =
        parentWindow?.left && parentWindow?.top
          ? parentWindow.left + (parentWindow.width || 0) - popupWidth
          : undefined;

      // open the popup
      await chrome.windows.create({
        url,
        type: 'popup',
        focused: true,
        left: popupLeft,
        top: popupTop,
        width: popupWidth,
        height: popupHeight,
      });

      // close the extension window
      window.close();
      return;
    }
  } catch (e) {
    notifyEvent(e, 'warning', 'Wallet', 'Configuration');
  }

  // determine location of popup based on parent window
  const popupTop = window.top;
  const popupLeft =
    window.screenLeft && window.top
      ? window.screenLeft + window.innerWidth - popupWidth
      : undefined;

  // fallback to standard popup
  setTimeout(
    () =>
      window.open(
        url,
        '_blank',
        `toolbar=no,
       location=no,
       status=no,
       menubar=no,
       scrollbars=yes,
       resizable=no,
       width=${popupWidth},
       height=${popupHeight}
       left=${popupLeft}
       top=${popupTop}`,
      ),
    0,
  );
};
