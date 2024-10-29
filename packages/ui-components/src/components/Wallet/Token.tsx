import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import numeral from 'numeral';
import React from 'react';
import {Line} from 'react-chartjs-2';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {
  CurrenciesType,
  SerializedPriceHistory,
  WalletPalette,
} from '../../lib';
import {TokenType, WalletPaletteOwner, WalletPalettePublic} from '../../lib';
import {CryptoIcon} from '../Image';
import {getBlockchainDisplaySymbol} from '../Manage/common/verification/types';

type StyleProps = {
  palette: WalletPalette;
};

const useStyles = makeStyles<StyleProps>()((theme: Theme, {palette}) => ({
  chartContainer: {
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
  },
  portfolioContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  txTitle: {
    fontWeight: 'bold',
    color: palette.text.primary,
  },
  txBalance: {
    fontWeight: 'bold',
    color: palette.text.primary,
    whiteSpace: 'nowrap',
  },
  txSubTitle: {
    color: palette.text.secondary,
  },
  txLink: {
    cursor: 'pointer',
  },
  txPctChangeDown: {
    color: palette.chart.down,
  },
  txPctChangeNeutral: {
    color: palette.chart.down,
  },
  txPctChangeUp: {
    color: palette.chart.up,
  },
  nftCollectionIcon: {
    borderRadius: theme.shape.borderRadius,
    width: '40px',
    height: '40px',
  },
  tokenIcon: {
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    backgroundColor: palette.background.main,
  },
  tokenIconDefault: {
    borderRadius: '50%',
    backgroundColor: palette.background.main,
    color: palette.text.primary,
    width: '40px',
    height: '40px',
  },
  chainIcon: {
    color: palette.background.main,
    backgroundColor: palette.background.main,
    border: `1px solid ${palette.background.main}`,
    borderRadius: '50%',
    width: '17px',
    height: '17px',
  },
}));

export type TokenEntry = {
  type: TokenType;
  symbol: string;
  name: string;
  ticker: string;
  value: number;
  tokenConversionUsd: number;
  balance: number;
  pctChange?: number;
  imageUrl?: string;
  history?: SerializedPriceHistory[];
  walletAddress: string;
  walletBlockChainLink: string;
  walletName: string;
  walletType?: string;
};

type Props = {
  token: TokenEntry;
  onClick: () => void;
  isOwner?: boolean;
  showGraph?: boolean;
  hideBalance?: boolean;
};

const Token: React.FC<Props> = ({
  token,
  onClick,
  isOwner,
  showGraph,
  hideBalance,
}) => {
  const {classes, cx} = useStyles({
    palette: isOwner ? WalletPaletteOwner : WalletPalettePublic,
  });
  return (
    <Grid
      container
      item
      xs={12}
      onClick={onClick}
      className={classes.txLink}
      data-testid={`token-${token.symbol}`}
    >
      <Grid item xs={2}>
        <Box display="flex" justifyContent="left" textAlign="left">
          <Badge
            overlap="circular"
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            badgeContent={
              token.type === TokenType.Native ? null : (
                <CryptoIcon
                  currency={token.symbol as CurrenciesType}
                  className={cx(classes.chainIcon)}
                />
              )
            }
          >
            {token.type === TokenType.Native ? (
              <CryptoIcon
                currency={token.symbol as CurrenciesType}
                className={cx(classes.tokenIcon)}
              />
            ) : token.imageUrl ? (
              <img
                src={token.imageUrl}
                className={
                  token.type === TokenType.Nft
                    ? classes.nftCollectionIcon
                    : classes.tokenIcon
                }
              />
            ) : token.type === TokenType.Nft ? (
              <PhotoLibraryOutlinedIcon
                sx={{padding: 0.5}}
                className={classes.tokenIconDefault}
              />
            ) : (
              <MonetizationOnOutlinedIcon
                className={classes.tokenIconDefault}
              />
            )}
          </Badge>
        </Box>
      </Grid>
      <Grid item xs={4}>
        <Box display="flex" flexDirection="column">
          <Typography variant="caption" className={classes.txTitle}>
            {token.name}
          </Typography>
          <Typography variant="caption" className={classes.txSubTitle}>
            {!hideBalance && numeral(token.balance).format('0.[000000]')}{' '}
            {token.type === TokenType.Nft
              ? `NFT${token.balance === 1 ? '' : 's'}`
              : getBlockchainDisplaySymbol(token.ticker)}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={4}>
        {showGraph && token.history && (
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
                        ? WalletPaletteOwner.chart.up
                        : WalletPaletteOwner.chart.down,
                    borderColor:
                      (token.pctChange || 0) > 0
                        ? WalletPaletteOwner.chart.up
                        : WalletPaletteOwner.chart.down,
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
      </Grid>
      <Grid item xs={2}>
        {!hideBalance && (
          <Box
            display="flex"
            flexDirection="column"
            textAlign="right"
            justifyContent="right"
            justifyItems="right"
          >
            <Typography variant="caption" className={classes.txBalance}>
              {token.value.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </Typography>
            <Typography
              variant="caption"
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
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default Token;
