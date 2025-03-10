import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import numeral from 'numeral';
import React from 'react';
import {Line} from 'react-chartjs-2';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {TokenEntry} from '../../lib';
import {useTranslationContext} from '../../lib';
import {
  isBuySellEnabled,
  openBuySellPopup,
} from '../../lib/wallet/buySellCrypto';
import {getBlockchainDisplaySymbol} from '../Manage/common/verification/types';
import ActionButton from './ActionButton';
import {TitleWithBackButton} from './TitleWithBackButton';
import Token from './Token';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    width: '100%',
  },
  footerContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: theme.spacing(1),
  },
  flexColCenterAligned: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    overflowY: 'scroll',
  },
  actionContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '250px',
    width: '100%',
    height: '100%',
  },
  chartContainer: {
    height: '175px',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  tokenContainer: {
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
    width: '100%',
  },
  headerText: {
    display: 'flex',
    justifyContent: 'left',
    textAlign: 'left',
    width: '100%',
    marginBottom: theme.spacing(1),
  },
  txPctChangeDown: {
    color: theme.palette.wallet.chart.down,
  },
  txPctChangeNeutral: {
    color: theme.palette.wallet.chart.down,
  },
  txPctChangeUp: {
    color: theme.palette.wallet.chart.up,
  },
}));

type Props = {
  accessToken: string;
  token: TokenEntry;
  onCancelClick: () => void;
  onClickReceive: () => void;
  onClickSend: () => void;
  onClickSwap: () => void;
};

const TokenDetail: React.FC<Props> = ({
  token,
  onCancelClick,
  onClickReceive,
  onClickSend,
  onClickSwap,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const theme = useTheme();

  // calculate latest spot price
  const spotPrice =
    token.history && token.history.length > 0
      ? token.history[token.history.length - 1].value
      : token.tokenConversionUsd;

  const handleBuyClicked = async () => {
    await openBuySellPopup(token);
  };

  const handleTokenClicked = () => {
    window.open(token.walletBlockChainLink, '_blank');
  };

  return (
    <Box className={classes.container}>
      <Box className={classes.flexColCenterAligned}>
        <TitleWithBackButton
          onCancelClick={onCancelClick}
          label={t('wallet.actionOnBlockchainTitle', {
            action: '',
            symbol: getBlockchainDisplaySymbol(token.ticker),
            blockchain: token.walletName,
          })}
        />
        <Box className={classes.contentContainer}>
          <Typography variant="h3" mt={3}>
            {isNaN(spotPrice) || spotPrice < 0.000001
              ? '$0.00'
              : spotPrice > 1
              ? spotPrice.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })
              : `$${numeral(spotPrice).format('0.[0000000]')}`}
          </Typography>
          <Typography
            variant="body2"
            className={
              !token.pctChange
                ? classes.txPctChangeNeutral
                : token.pctChange < 0
                ? classes.txPctChangeDown
                : classes.txPctChangeUp
            }
          >
            {token.pctChange
              ? `${token.pctChange > 0 ? '+' : ''}${numeral(
                  token.pctChange,
                ).format('0.[00]')}%`
              : `---`}
          </Typography>
          {token.history && (
            <Box className={classes.chartContainer}>
              <Line
                data={{
                  labels:
                    token.history?.map(h =>
                      new Date(h.timestamp).toLocaleString(),
                    ) || [],
                  datasets: [
                    {
                      label: token.name,
                      data: token.history?.map(h => h.value) || [],
                      pointBackgroundColor: 'rgba(0, 0, 0, 0)',
                      pointBorderColor: 'rgba(0, 0, 0, 0)',
                      backgroundColor:
                        (token.pctChange || 0) > 0
                          ? theme.palette.wallet.chart.up
                          : theme.palette.wallet.chart.down,
                      borderColor:
                        (token.pctChange || 0) > 0
                          ? theme.palette.wallet.chart.up
                          : theme.palette.wallet.chart.down,
                      fill: false,
                    },
                  ],
                }}
                options={{
                  events: ['mousemove'],
                  scales: {
                    x: {
                      display: false,
                    },
                    y: {
                      display: false,
                    },
                  },
                  plugins: {
                    title: {
                      display: false,
                    },
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </Box>
          )}
          <Box className={classes.actionContainer}>
            <Grid container spacing={2}>
              <Grid item>
                <ActionButton
                  onClick={onClickReceive}
                  size="small"
                  variant="receive"
                />
              </Grid>
              <Grid item>
                <ActionButton
                  onClick={onClickSend}
                  size="small"
                  variant="send"
                  disabled={token.balance === 0}
                />
              </Grid>
              <Grid item>
                <ActionButton
                  onClick={onClickSwap}
                  size="small"
                  variant="swap"
                  disabled={token.balance === 0}
                />
              </Grid>
              {isBuySellEnabled(token) && (
                <Grid item>
                  <ActionButton
                    onClick={handleBuyClicked}
                    size="small"
                    variant="buySell"
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </Box>
        <Box className={classes.footerContainer}>
          <Box className={classes.headerText}>
            <Typography variant="h6">{t('swap.balance')}</Typography>
          </Box>
          <Box className={classes.tokenContainer}>
            <Token
              token={token}
              isOwner={true}
              showGraph={false}
              onClick={handleTokenClicked}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TokenDetail;
