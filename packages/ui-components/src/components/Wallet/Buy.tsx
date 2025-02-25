import Box from '@mui/material/Box';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {SerializedWalletBalance, TokenEntry} from '../../lib';
import {useTranslationContext} from '../../lib';
import {openBuySellPopup} from '../../lib/wallet/buySellCrypto';
import {SelectAsset} from './SelectAsset';

const useStyles = makeStyles()((theme: Theme) => ({
  flexColCenterAligned: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    width: '100%',
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
    await openBuySellPopup(asset);
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
        bannerType="buy"
      />
    </Box>
  );
};

export default Buy;
