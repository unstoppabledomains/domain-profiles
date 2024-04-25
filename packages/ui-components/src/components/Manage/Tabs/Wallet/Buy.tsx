import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {stringify} from 'querystring';
import React from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {SerializedWalletBalance} from '../../../../lib';
import {TokenType, useTranslationContext} from '../../../../lib';
import type {TokenEntry} from '../../../Wallet/Token';
import Token from '../../../Wallet/Token';

const useStyles = makeStyles()((theme: Theme) => ({
  fullWidth: {
    width: '100%',
  },
  selectAssetContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '250px',
    justifyContent: 'space-between',
  },
  assetsContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    alignItems: 'center',
  },
  asset: {
    backgroundImage: 'linear-gradient(#0655DD, #043893)',
    borderRadius: 9,
    padding: 12,
    maxWidth: '350px',
    width: '100%',
  },
}));

type Props = {
  onCancelClick: () => void;
  wallets: SerializedWalletBalance[];
};

export const Buy: React.FC<Props> = ({onCancelClick, wallets}) => {
  const [t] = useTranslationContext();
  const {classes} = useStyles();

  const handleBuyRedirect = (tokenName: string, address: string) => {
    const queryParams = stringify({
      blockchain: tokenName,
      address,
      utm_source: 'ud_me',
    });
    const url = `${config.UNSTOPPABLE_WEBSITE_URL}/fiat-ramps?${queryParams}`;
    window.open(url, '_blank');
  };

  // serialize native tokens
  const nativeTokens: TokenEntry[] = [
    ...(wallets || []).flatMap(wallet => ({
      type: TokenType.Native,
      name: wallet.name,
      value: wallet.value?.walletUsdAmt || 0,
      balance: wallet.balanceAmt || 0,
      pctChange: wallet.value?.marketPctChange24Hr,
      history: [],
      symbol: wallet.symbol,
      ticker: wallet.gasCurrency,
      walletAddress: wallet.address,
      walletBlockChainLink: wallet.blockchainScanUrl,
      walletName: wallet.name,
      imageUrl: wallet.logoUrl,
    })),
  ].sort((a, b) => b.value - a.value);
  return (
    <Box className={classes.selectAssetContainer}>
      <Box className={classes.fullWidth}>
        <Typography variant="h5">{t('wallet.selectAssetToBuy')}</Typography>
      </Box>
      <Box className={classes.assetsContainer} mt={2}>
        {nativeTokens.map(token => {
          const onClick = () => {
            handleBuyRedirect(token.name, token.walletAddress);
          };
          return (
            <div className={classes.asset}>
              <Token primaryShade token={token} onClick={onClick} />
            </div>
          );
        })}
      </Box>
      <Box className={classes.fullWidth} mt={2}>
        <Button fullWidth onClick={onCancelClick} variant="outlined">
          {t('common.cancel')}
        </Button>
      </Box>
    </Box>
  );
};
