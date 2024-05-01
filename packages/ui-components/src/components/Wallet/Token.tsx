import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import numeral from 'numeral';
import React from 'react';
import {Line} from 'react-chartjs-2';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {CurrenciesType, SerializedPriceHistory} from '../../lib';
import {TokenType} from '../../lib';
import {CryptoIcon} from '../Image';

type StyleProps = {
  palletteShade: Record<number, string>;
};

const useStyles = makeStyles<StyleProps>()((theme: Theme, {palletteShade}) => ({
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
    color: theme.palette.white,
  },
  txBalance: {
    fontWeight: 'bold',
    color: theme.palette.white,
    whiteSpace: 'nowrap',
  },
  txSubTitle: {
    color: palletteShade[bgNeutralShade - 600],
  },
  txLink: {
    cursor: 'pointer',
  },
  txPctChangeDown: {
    color: palletteShade[bgNeutralShade - 400],
  },
  txPctChangeNeutral: {
    color: palletteShade[bgNeutralShade - 400],
  },
  txPctChangeUp: {
    color: theme.palette.success.main,
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
  },
  tokenIconDefault: {
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.white,
    width: '40px',
    height: '40px',
  },
  chainIcon: {
    color: theme.palette.common.black,
    backgroundColor: palletteShade[bgNeutralShade],
    border: `1px solid black`,
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
  balance: number;
  pctChange?: number;
  imageUrl?: string;
  history?: SerializedPriceHistory[];
  walletAddress: string;
  walletBlockChainLink: string;
  walletName: string;
};

type Props = {
  token: TokenEntry;
  onClick: () => void;
  primaryShade: boolean;
  showGraph?: boolean;
  hideBalance?: boolean;
};

const bgNeutralShade = 800;

const Token: React.FC<Props> = ({
  token,
  onClick,
  primaryShade,
  showGraph,
  hideBalance,
}) => {
  const theme = useTheme();

  const {classes, cx} = useStyles({
    palletteShade: primaryShade
      ? theme.palette.primaryShades
      : theme.palette.neutralShades,
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
              : token.ticker}
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
                        ? theme.palette.success.main
                        : theme.palette.neutralShades[bgNeutralShade - 400],
                    borderColor:
                      (token.pctChange || 0) > 0
                        ? theme.palette.success.main
                        : theme.palette.neutralShades[bgNeutralShade - 400],
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
