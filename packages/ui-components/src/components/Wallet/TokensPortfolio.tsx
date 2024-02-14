import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import {CategoryScale} from 'chart.js';
import Chart from 'chart.js/auto';
import numeral from 'numeral';
import React, {useState} from 'react';
import {Line} from 'react-chartjs-2';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {CurrenciesType} from '../../lib';
import {WALLET_CARD_HEIGHT, useTranslationContext} from '../../lib';
import type {
  SerializedPriceHistory,
  SerializedWalletBalance,
} from '../../lib/types/domain';
import {CryptoIcon} from '../Image';

Chart.register(CategoryScale);

const bgNeutralShade = 800;

const useStyles = makeStyles()((theme: Theme) => ({
  portfolioContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  walletListContainer: {
    display: 'flex',
    overflowX: 'auto',
  },
  walletContainer: {
    color: theme.palette.neutralShades[bgNeutralShade - 600],
    cursor: 'pointer',
    display: 'flex',
    background: `repeating-linear-gradient(
      -45deg,
      ${theme.palette.neutralShades[bgNeutralShade]},
      ${theme.palette.neutralShades[bgNeutralShade]} 5px,
      ${theme.palette.neutralShades[bgNeutralShade - 100]} 5px,
      ${theme.palette.neutralShades[bgNeutralShade - 100]} 6px
    )`,
    alignItems: 'center',
    border: `2px solid ${theme.palette.neutralShades[bgNeutralShade]}`,
    borderRadius: theme.shape.borderRadius,
    paddingRight: theme.spacing(0.5),
    marginRight: theme.spacing(1),
    height: '100%',
  },
  walletContainerSelected: {
    background: theme.palette.white,
    border: `2px solid ${theme.palette.white}`,
    color: theme.palette.neutralShades[bgNeutralShade],
  },
  chartContainer: {
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
  },
  walletIcon: {
    marginRight: theme.spacing(0.5),
    color: theme.palette.common.black,
    backgroundColor: theme.palette.neutralShades[bgNeutralShade],
    borderRadius: '50%',
    width: '25px',
    height: '25px',
  },
  walletAddress: {
    color: 'inherit',
    whiteSpace: 'nowrap',
  },
  portfolioPlaceholder: {
    height: `${WALLET_CARD_HEIGHT}px`,
    width: '100%',
    borderRadius: theme.shape.borderRadius,
  },
  sectionHeaderContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: theme.spacing(6, 0, 0),
    minHeight: '42px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.h5.fontSize,
    lineHeight: 1.4,
  },
  totalValue: {
    color: theme.palette.neutralShades[600],
    marginLeft: theme.spacing(1),
  },
  headerIcon: {
    color: theme.palette.neutralShades[600],
    marginRight: theme.spacing(1),
  },
  scrollableContainer: {
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
    height: `${WALLET_CARD_HEIGHT + 2}px`,
    width: '100%',
    backgroundImage: `linear-gradient(${
      theme.palette.neutralShades[bgNeutralShade - 200]
    }, ${theme.palette.neutralShades[bgNeutralShade]})`,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.neutralShades[bgNeutralShade - 600]}`,
    padding: theme.spacing(2),
    scrollbarWidth: 'thin',
  },
  noActivity: {
    color: theme.palette.neutralShades[bgNeutralShade - 600],
  },
  txTitle: {
    fontWeight: 'bold',
    color: theme.palette.white,
  },
  txSubTitle: {
    color: theme.palette.neutralShades[bgNeutralShade - 600],
  },
  txLink: {
    cursor: 'pointer',
  },
  txPctChangeDown: {
    color: theme.palette.neutralShades[bgNeutralShade - 400],
  },
  txPctChangeNeutral: {
    color: theme.palette.neutralShades[bgNeutralShade - 400],
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
    backgroundColor: theme.palette.neutralShades[bgNeutralShade],
    border: `1px solid black`,
    borderRadius: '50%',
    width: '17px',
    height: '17px',
  },
}));

export const TokensPortfolio: React.FC<TokensPortfolioProps> = ({
  domain,
  wallets,
}) => {
  const theme = useTheme();
  const {classes, cx} = useStyles();
  const [filterAddress, setFilterAddress] = useState<SerializedWalletBalance>();
  const [t] = useTranslationContext();

  // list of all monetized tokens, sorted by most valuable
  const allTokens: tokenEntry[] = [
    ...(wallets || []).flatMap(wallet => {
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
        type: 'Native' as never,
        name: wallet.name,
        value: wallet.value?.walletUsdAmt || 0,
        balance: wallet.balanceAmt || 0,
        pctChange: wallet.value?.marketPctChange24Hr,
        history: wallet.value?.history?.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        ),
        symbol: wallet.symbol,
        ticker: wallet.symbol,
        walletAddress: wallet.address,
        walletBlockChainLink: wallet.blockchainScanUrl,
        walletName: wallet.name,
        imageUrl: wallet.logoUrl,
      };
    }),
    ...(wallets || []).flatMap(wallet =>
      (wallet?.nfts || []).map(walletNft => {
        const fpEntry =
          walletNft.floorPrice?.filter(
            fp => fp.marketPctChange24Hr !== undefined,
          ) || [];
        const pctChangeValue =
          fpEntry.length > 0 ? fpEntry[0].marketPctChange24Hr : undefined;
        if (
          fpEntry.length > 0 &&
          fpEntry[0].history &&
          fpEntry[0].history.length > 0 &&
          fpEntry[0].history[fpEntry[0].history.length - 1].value !==
            fpEntry[0].value
        ) {
          fpEntry[0].history.push({
            timestamp: new Date(),
            value: fpEntry[0].value || 0,
          });
        }
        return {
          type: 'NFT' as never,
          name: walletNft.name,
          value: walletNft.totalValueUsdAmt || 0,
          balance: walletNft.ownedCount,
          pctChange: pctChangeValue,
          history:
            fpEntry.length > 0
              ? fpEntry[0].history?.sort(
                  (a, b) =>
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime(),
                )
              : undefined,
          symbol: wallet.symbol,
          ticker: wallet.symbol,
          walletAddress: wallet.address,
          walletBlockChainLink: wallet.blockchainScanUrl,
          walletName: wallet.name,
          imageUrl: walletNft.collectionImageUrl,
        };
      }),
    ),
    ...(wallets || []).flatMap(wallet =>
      (wallet?.tokens || []).map(walletToken => {
        return {
          type: 'Token' as never,
          name: walletToken.name,
          value: walletToken.value?.walletUsdAmt || 0,
          balance: walletToken.balanceAmt || 0,
          pctChange: walletToken.value?.marketPctChange24Hr,
          ticker: walletToken.symbol,
          symbol: wallet.symbol,
          walletAddress: wallet.address,
          walletBlockChainLink: wallet.blockchainScanUrl,
          walletName: wallet.name,
          imageUrl: walletToken.logoUrl,
        };
      }),
    ),
  ]
    .filter(item => item?.value > 0.01)
    .sort((a, b) => b.value - a.value)
    .filter(
      item =>
        !filterAddress ||
        (filterAddress.address.toLowerCase() ===
          item.walletAddress.toLowerCase() &&
          filterAddress.symbol.toLowerCase() === item.symbol.toLowerCase()),
    );

  // total value of the portfolio
  const totalValue = allTokens
    .map(item => item.value)
    .reduce((p, c) => p + c, 0);

  const handleClick = (link: string) => {
    window.open(link, '_blank');
  };

  const formatWalletAddress = (address: string) => {
    if (address.length > 10) {
      return `${address.slice(0, 6)}...${address.slice(address.length - 4)}`;
    }
    return address;
  };

  const renderWallet = (wallet?: SerializedWalletBalance) => {
    return (
      <Box
        className={cx(classes.walletContainer, {
          [classes.walletContainerSelected]: filterAddress === wallet,
        })}
        onClick={() => setFilterAddress(wallet)}
      >
        {wallet ? (
          <>
            <CryptoIcon
              className={classes.walletIcon}
              currency={wallet.symbol as CurrenciesType}
            />
            <Typography className={classes.walletAddress} variant="caption">
              {formatWalletAddress(wallet.address)}
            </Typography>
          </>
        ) : (
          <Box>
            <Typography
              pl={0.5}
              ml={0.5}
              mr={0.5}
              className={classes.walletAddress}
              variant="caption"
            >
              {t('tokensPortfolio.all')}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderToken = (index: number, token: tokenEntry) => {
    return (
      <Grid
        container
        item
        xs={12}
        key={`token-${index}`}
        onClick={() => handleClick(token.walletBlockChainLink)}
        className={classes.txLink}
      >
        <Grid item xs={2}>
          <Box display="flex" justifyContent="left" textAlign="left">
            <Badge
              overlap="circular"
              anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
              badgeContent={
                token.type === 'Native' ? null : (
                  <CryptoIcon
                    currency={token.symbol as CurrenciesType}
                    className={cx(classes.chainIcon)}
                  />
                )
              }
            >
              {token.type === 'Native' ? (
                <CryptoIcon
                  currency={token.symbol as CurrenciesType}
                  className={cx(classes.tokenIcon)}
                />
              ) : token.imageUrl ? (
                <img
                  src={token.imageUrl}
                  className={
                    token.type === 'NFT'
                      ? classes.nftCollectionIcon
                      : classes.tokenIcon
                  }
                />
              ) : token.type === 'NFT' ? (
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
              {numeral(token.balance).format('0.[000000]')}{' '}
              {token.type === 'NFT'
                ? `NFT${token.balance === 1 ? '' : 's'}`
                : token.ticker}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
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
          <Box
            display="flex"
            flexDirection="column"
            textAlign="right"
            justifyContent="right"
            justifyItems="right"
          >
            <Typography variant="caption" className={classes.txTitle}>
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
      </Grid>
    );
  };

  // render the wallet list
  return (
    <Box className={classes.portfolioContainer}>
      <Box className={classes.sectionHeaderContainer}>
        <Box className={classes.sectionHeader}>
          <Tooltip title={t('verifiedWallets.verifiedOnly', {domain})}>
            <MonetizationOnOutlinedIcon className={classes.headerIcon} />
          </Tooltip>
          <Typography variant="h6">{t('tokensPortfolio.title')}</Typography>
          {totalValue > 0 && (
            <Typography variant="body2" className={classes.totalValue}>
              (
              {totalValue.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
              )
            </Typography>
          )}
        </Box>
      </Box>
      {wallets ? (
        <Box
          mt={'15px'}
          mb={2}
          id={`scrollablePortfolioDiv`}
          className={classes.scrollableContainer}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box className={classes.walletListContainer}>
                {wallets.length > 1 && renderWallet()}
                {wallets.map(wallet => renderWallet(wallet))}
              </Box>
            </Grid>
            {allTokens.length > 0 ? (
              allTokens.map((token, i) => renderToken(i, token))
            ) : (
              <Grid item xs={12}>
                <Typography className={classes.noActivity}>
                  {t('tokensPortfolio.noTokens')}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      ) : (
        <Grid mt="0px" mb={1.5} container spacing={2}>
          <Grid item xs={12}>
            <Skeleton
              variant="rectangular"
              className={classes.portfolioPlaceholder}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

type tokenEntry = {
  type: 'Native' | 'NFT' | 'Token';
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

export type TokensPortfolioProps = {
  domain: string;
  isOwner?: boolean;
  wallets?: SerializedWalletBalance[];
  minCount?: number;
  maxCount?: number;
};
