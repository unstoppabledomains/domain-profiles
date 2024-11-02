import Box from '@mui/material/Box';
import type {Theme} from '@mui/material/styles';
import {stringify} from 'querystring';
import React from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {SerializedWalletBalance} from '../../lib';
import {useTranslationContext} from '../../lib';
import {SelectAsset} from './SelectAsset';
import type {TokenEntry} from './Token';

const useStyles = makeStyles()((theme: Theme) => ({
  flexColCenterAligned: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      width: '346px',
      marginLeft: theme.spacing(-1),
      marginRight: theme.spacing(-1),
    },
    height: '100%',
  },
}));

type Props = {
  isSellEnabled?: boolean;
  onCancelClick: () => void;
  wallets: SerializedWalletBalance[];
};

const Buy: React.FC<Props> = ({isSellEnabled, onCancelClick, wallets}) => {
  const [t] = useTranslationContext();
  const {classes} = useStyles();

  const handleBuyRedirect = async (asset: TokenEntry) => {
    // popup window dimensions
    const popupWidth = 400;
    const popupHeight = 700;

    // build the URL for standalone fiat ramp on e-commerce
    const queryParams = stringify({
      blockchain: asset.name.toLowerCase(),
      address: asset.walletAddress,
      utm_source: 'ud_me',
    });
    const url = `${config.UNSTOPPABLE_WEBSITE_URL}/fiat-ramps/popup?${queryParams}`;

    // open in extension popup if available
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

    // determine location of popup based on parent window
    const popupTop = window.top;
    const popupLeft =
      window.screenLeft && window.top
        ? window.screenLeft + window.innerWidth - popupWidth
        : undefined;

    // fallback to standard popup
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
    );
  };

  return (
    <Box className={classes.flexColCenterAligned}>
      <SelectAsset
        hideBalance
        onSelectAsset={handleBuyRedirect}
        wallets={wallets}
        onCancelClick={onCancelClick}
        label={t(
          isSellEnabled
            ? 'wallet.selectAssetToBuySell'
            : 'wallet.selectAssetToBuy',
        )}
        supportedAssetList={config.WALLETS.CHAINS.BUY}
      />
    </Box>
  );
};

export default Buy;
