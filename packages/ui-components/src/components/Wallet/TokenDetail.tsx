import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import QrCodeIcon from '@mui/icons-material/QrCode';
import SendIcon from '@mui/icons-material/Send';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Box from '@mui/material/Box';
import type {ButtonProps} from '@mui/material/Button';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {styled, useTheme} from '@mui/material/styles';
import numeral from 'numeral';
import React from 'react';
import {Line} from 'react-chartjs-2';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {TokenEntry} from '../../lib';
import {useTranslationContext} from '../../lib';
import {getBlockchainDisplaySymbol} from '../Manage/common/verification/types';
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
  actionButton: {
    marginRight: theme.spacing(2),
    width: '70px',
    height: '70px',
    cursor: 'pointer',
    [theme.breakpoints.down('sm')]: {
      width: '55px',
      height: '55px',
    },
  },
  actionIcon: {
    width: '25px',
    height: '25px',
    [theme.breakpoints.down('sm')]: {
      width: '15px',
      height: '15px',
    },
  },
  actionContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
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
  onClickBuy: () => void;
  onClickSend: () => void;
  onClickSwap: () => void;
};

const TokenDetail: React.FC<Props> = ({
  token,
  onCancelClick,
  onClickReceive,
  onClickBuy,
  onClickSend,
  onClickSwap,
}) => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();
  const theme = useTheme();

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
            {(token.history && token.history.length > 0
              ? token.history[token.history.length - 1].value
              : token.tokenConversionUsd
            ).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}
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
                  labels: token.history?.map((_h, i) => i) || [],
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
                  events: [],
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
            <StyledButton
              className={classes.actionButton}
              onClick={onClickReceive}
              variant="contained"
              colorPalette={theme.palette.neutralShades}
              shade={theme.palette.mode === 'light' ? 100 : 600}
              size="small"
            >
              <Box className={classes.actionContent}>
                <QrCodeIcon className={classes.actionIcon} />
                {t('common.receive')}
              </Box>
            </StyledButton>
            <StyledButton
              className={classes.actionButton}
              onClick={onClickSend}
              variant="contained"
              colorPalette={theme.palette.neutralShades}
              shade={theme.palette.mode === 'light' ? 100 : 600}
              size="small"
            >
              <Box className={classes.actionContent}>
                <SendIcon className={classes.actionIcon} />
                {t('common.send')}
              </Box>
            </StyledButton>
            <StyledButton
              className={classes.actionButton}
              onClick={onClickSwap}
              variant="contained"
              colorPalette={theme.palette.neutralShades}
              shade={theme.palette.mode === 'light' ? 100 : 600}
              size="small"
            >
              <Box className={classes.actionContent}>
                <SwapHorizIcon className={classes.actionIcon} />
                {t('swap.title')}
              </Box>
            </StyledButton>
            <StyledButton
              className={classes.actionButton}
              onClick={onClickBuy}
              variant="contained"
              colorPalette={theme.palette.neutralShades}
              shade={theme.palette.mode === 'light' ? 100 : 600}
              size="small"
            >
              <Box className={classes.actionContent}>
                <AttachMoneyIcon className={classes.actionIcon} />
                {t('common.buySell')}
              </Box>
            </StyledButton>
          </Box>
        </Box>
        <Box className={classes.footerContainer}>
          <Box className={classes.headerText}>
            <Typography variant="h6">{t('swap.balance')}</Typography>
          </Box>
          <Box className={classes.tokenContainer}>
            <Token token={token} isOwner={true} showGraph={false} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

type StyledButtonProps = ButtonProps & {
  colorPalette: Record<number, string>;
  shade: number;
};

const StyledButton = styled(Button)<StyledButtonProps>(
  ({theme, shade, colorPalette}) => ({
    color: theme.palette.getContrastText(colorPalette[shade]),
    backgroundColor: colorPalette[shade],
    '&:hover': {
      backgroundColor: colorPalette[shade + 100],
    },
  }),
);

export default TokenDetail;
