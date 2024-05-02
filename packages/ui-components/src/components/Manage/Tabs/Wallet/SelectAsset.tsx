import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {SerializedWalletBalance} from '../../../../lib';
import {TokenType, useTranslationContext} from '../../../../lib';
import type {TokenEntry} from '../../../Wallet/Token';
import Token from '../../../Wallet/Token';
import {TitleWithBackButton} from './TitleWithBackButton';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '250px',
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
    marginBottom: theme.spacing(0.5),
  },
  fundButton: {
    width: '100%',
  },
  icon: {
    fontSize: '60px',
  },
  noTokensContainer: {
    textAlign: 'center',
  },
  noTokensText: {
    marginBottom: theme.spacing(3),
  },
}));

type Props = {
  onCancelClick: () => void;
  wallets: SerializedWalletBalance[];
  label: string;
  onSelectAsset: (asset: TokenEntry) => void;
  showGraph?: boolean;
  hideBalance?: boolean;
  requireBalance?: boolean;
  onClickReceive?: () => void;
  onClickBuy?: () => void;
};

export const SelectAsset: React.FC<Props> = ({
  onCancelClick,
  onSelectAsset,
  wallets,
  label,
  showGraph,
  hideBalance,
  requireBalance,
  onClickReceive,
  onClickBuy,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  const serializeNativeTokens = (wallet: SerializedWalletBalance) => {
    if (
      wallet.value?.history &&
      wallet.value.history.length > 0 &&
      wallet.value.history[wallet.value.history.length - 1].value !==
        wallet.value.marketUsdAmt
    ) {
      wallet.value.history.push({
        timestamp: new Date(),
        value: wallet.value.marketUsdAmt || 0,
      });
    }
    return {
      type: TokenType.Native,
      name: wallet.name,
      value: wallet.value?.walletUsdAmt || 0,
      tokenMarketValueUsd: wallet.value?.marketUsdAmt || 0,
      balance: wallet.balanceAmt || 0,
      pctChange: wallet.value?.marketPctChange24Hr,
      history: wallet.value?.history?.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      ),
      symbol: wallet.symbol,
      ticker: wallet.gasCurrency,
      walletAddress: wallet.address,
      walletBlockChainLink: wallet.blockchainScanUrl,
      walletName: wallet.name,
      imageUrl: wallet.logoUrl,
    };
  };
  const allTokens: TokenEntry[] = wallets.flatMap(serializeNativeTokens);
  const nativeTokens: TokenEntry[] = allTokens
    .filter(token => !requireBalance || token.balance > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <Box className={classes.container} data-testid={'select-asset-container'}>
      <TitleWithBackButton onCancelClick={onCancelClick} label={label} />
      <Box className={classes.assetsContainer} mt={2}>
        {requireBalance &&
          allTokens.length > 0 &&
          nativeTokens.length === 0 && (
            <Box className={classes.noTokensContainer}>
              <Typography variant="body1" className={classes.noTokensText}>
                {t('wallet.noTokensAvailableForSend')}
              </Typography>
              {onClickReceive && onClickBuy && (
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      onClick={onClickReceive}
                      variant="contained"
                      startIcon={<AddOutlinedIcon />}
                      className={classes.fundButton}
                    >
                      {t('common.receive')}
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      onClick={onClickBuy}
                      variant="contained"
                      startIcon={<AttachMoneyIcon />}
                      className={classes.fundButton}
                    >
                      {t('common.buy')}
                    </Button>
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        {nativeTokens.map(token => {
          const handleClick = () => {
            onSelectAsset(token);
          };
          return (
            <div className={classes.asset} id={token.name}>
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
    </Box>
  );
};
