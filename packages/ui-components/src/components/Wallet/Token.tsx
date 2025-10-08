import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import numeral from 'numeral';
import React, {useState} from 'react';
import {Line} from 'react-chartjs-2';
import VisibilitySensor from 'react-visibility-sensor';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {CurrenciesType, TokenEntry} from '../../lib';
import {TokenType} from '../../lib';
import type {SwapMode} from '../../lib/types/swap';
import {CryptoIcon} from '../Image';
import {getBlockchainDisplaySymbol} from '../Manage/common/verification/types';

const useStyles = makeStyles()((theme: Theme) => ({
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
    color: theme.palette.wallet.text.primary,
  },
  txBalance: {
    fontWeight: 'bold',
    color: theme.palette.wallet.text.primary,
    whiteSpace: 'nowrap',
  },
  txSubTitle: {
    color: theme.palette.wallet.text.secondary,
  },
  txLink: {
    cursor: 'pointer',
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
  tokenIcon: {
    width: '40px',
    height: '40px',
    backgroundColor: theme.palette.wallet.background.main,
  },
  tokenIconDefault: {
    borderRadius: '50%',
    backgroundColor: theme.palette.wallet.background.main,
    color: theme.palette.wallet.text.primary,
    width: '40px',
    height: '40px',
  },
  chainIcon: {
    color: theme.palette.wallet.background.main,
    backgroundColor: theme.palette.wallet.background.main,
    border: `1px solid ${theme.palette.wallet.background.main}`,
    borderRadius: '50%',
    width: '17px',
    height: '17px',
  },
}));

type Props = {
  id?: string;
  token?: TokenEntry;
  onClick?: () => void;
  isOwner?: boolean;
  showGraph?: boolean;
  hideBalance?: boolean;
  iconWidth?: number;
  graphWidth?: number;
  balanceWidth?: number;
  descriptionWidth?: number;
  compact?: boolean;
  useVisibilitySensor?: boolean;
  mode?: SwapMode;
};

const Token: React.FC<Props> = ({
  id,
  token,
  onClick,
  showGraph,
  hideBalance,
  iconWidth,
  descriptionWidth,
  graphWidth,
  balanceWidth,
  compact,
  useVisibilitySensor = false,
  mode = 'usd',
}) => {
  const {classes, cx} = useStyles();
  const theme = useTheme();

  const [isVisible, setIsVisible] = useState(false);

  if (!token) {
    return null;
  }

  return (
    <VisibilitySensor onChange={(isVis: boolean) => setIsVisible(isVis)}>
      {isVisible || !useVisibilitySensor ? (
        <Grid
          container
          item
          xs={12}
          onClick={onClick}
          className={classes.txLink}
          data-testid={`${id ? `${id}-` : ''}token-${token.ticker}`}
        >
          <Grid item xs={iconWidth || 2}>
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
                  <Avatar
                    src={token.imageUrl}
                    className={classes.tokenIcon}
                    variant={
                      token.type === TokenType.Nft ? 'rounded' : 'circular'
                    }
                    alt={token.name}
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
          <Grid item xs={descriptionWidth || 4}>
            <Box display="flex" flexDirection="column">
              <Typography variant="caption" className={classes.txTitle}>
                {compact
                  ? token.type === TokenType.Nft
                    ? `NFT${token.balance === 1 ? '' : 's'}`
                    : getBlockchainDisplaySymbol(token.ticker)
                  : token.name}
              </Typography>
              <Typography variant="caption" className={classes.txSubTitle}>
                {compact &&
                  mode === 'usd' &&
                  numeral(token.value).format('($0.00a)')}
                {(!hideBalance || mode === 'native') &&
                  numeral(token.balance).format('0.[000000]')}{' '}
                {compact
                  ? ''
                  : token.type === TokenType.Nft
                  ? `NFT${token.balance === 1 ? '' : 's'}`
                  : getBlockchainDisplaySymbol(token.ticker)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={graphWidth === 0 ? 0 : graphWidth || 4}>
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
          </Grid>
          {!hideBalance && (
            <Grid item xs={balanceWidth || 2}>
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
            </Grid>
          )}
        </Grid>
      ) : (
        <Skeleton variant="rectangular" height={40} width="100%" />
      )}
    </VisibilitySensor>
  );
};

export default Token;
