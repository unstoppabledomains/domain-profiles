import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {SerializedWalletBalance} from '../../../../lib';
import {TokenType, useTranslationContext} from '../../../../lib';
import type {TokenEntry} from '../../../Wallet/Token';
import Token from '../../../Wallet/Token';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '250px',
    width: '400px',
  },
  fullWidth: {
    width: '100%',
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
    width: '100%',
  },
  icon: {
    fontSize: '60px',
  },
}));

type Props = {
  onCancelClick: () => void;
  wallets: SerializedWalletBalance[];
  label: string;
  onSelectAsset: (asset: TokenEntry) => void;
  showGraph?: boolean;
  hideBalance?: boolean;
};

export const SelectAsset: React.FC<Props> = ({
  onCancelClick,
  onSelectAsset,
  wallets,
  label,
  showGraph,
  hideBalance,
}) => {
  const [t] = useTranslationContext();
  const {classes} = useStyles();

  const serializeNativeTokens = (wallet: SerializedWalletBalance) => ({
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
  });

  const nativeTokens: TokenEntry[] = wallets
    .flatMap(serializeNativeTokens)
    .sort((a, b) => b.value - a.value);

  return (
    <Box className={classes.container} data-testid={'select-asset-container'}>
      <Box className={classes.fullWidth}>
        <Typography variant="h5">{label}</Typography>
      </Box>
      <Box className={classes.assetsContainer} mt={2}>
        {nativeTokens.map(token => {
          const handleClick = () => {
            onSelectAsset(token);
          };
          return (
            <div className={classes.asset}>
              <Token
                primaryShade
                token={token}
                onClick={handleClick}
                hideBalance={hideBalance}
                showGraph={showGraph}
              />
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
