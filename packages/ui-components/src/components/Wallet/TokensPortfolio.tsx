import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import {CategoryScale} from 'chart.js';
import Chart from 'chart.js/auto';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {CurrenciesType} from '../../lib';
import {TokenType, WALLET_CARD_HEIGHT, useTranslationContext} from '../../lib';
import type {SerializedWalletBalance} from '../../lib/types/domain';
import {CryptoIcon} from '../Image';
import type {TokenEntry} from './Token';
import Token from './Token';

Chart.register(CategoryScale);

const bgNeutralShade = 800;

type StyleProps = {
  palletteShade: Record<number, string>;
};
const useStyles = makeStyles<StyleProps>()((theme: Theme, {palletteShade}) => ({
  portfolioContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  walletListContainer: {
    display: 'flex',
    overflowX: 'auto',
    ['::-webkit-scrollbar']: {
      display: 'none',
    },
  },
  walletContainer: {
    color: palletteShade[bgNeutralShade - 600],
    cursor: 'pointer',
    display: 'flex',
    background: `repeating-linear-gradient(
      -45deg,
      ${palletteShade[bgNeutralShade]},
      ${palletteShade[bgNeutralShade]} 5px,
      ${palletteShade[bgNeutralShade - 100]} 5px,
      ${palletteShade[bgNeutralShade - 100]} 6px
    )`,
    alignItems: 'center',
    border: `2px solid ${palletteShade[bgNeutralShade]}`,
    borderRadius: theme.shape.borderRadius,
    paddingRight: theme.spacing(0.5),
    marginRight: theme.spacing(1),
    height: '100%',
  },
  walletContainerSelected: {
    background: theme.palette.white,
    border: `2px solid ${theme.palette.white}`,
    color: palletteShade[bgNeutralShade],
  },
  walletIcon: {
    marginRight: theme.spacing(0.5),
    color: theme.palette.common.black,
    backgroundColor: palletteShade[bgNeutralShade],
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
    color: palletteShade[600],
    marginLeft: theme.spacing(1),
  },
  headerIcon: {
    color: palletteShade[600],
    marginRight: theme.spacing(1),
  },
  scrollableContainer: {
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
    height: `${WALLET_CARD_HEIGHT + 2}px`,
    width: '100%',
    backgroundImage: `linear-gradient(${palletteShade[bgNeutralShade - 200]}, ${
      palletteShade[bgNeutralShade]
    })`,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${palletteShade[bgNeutralShade - 600]}`,
    padding: theme.spacing(2),
    ['::-webkit-scrollbar']: {
      display: 'none',
    },
  },
  noActivity: {
    color: palletteShade[bgNeutralShade - 600],
  },
  tokenContainer: {
    display: 'flex',
    width: '100%',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: 'transparent',
    padding: theme.spacing(0.5),
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  },
}));

export const TokensPortfolio: React.FC<TokensPortfolioProps> = ({
  domain,
  wallets,
  isError,
  isOwner,
  verified,
}) => {
  const theme = useTheme();
  const {classes, cx} = useStyles({
    palletteShade: isOwner
      ? theme.palette.primaryShades
      : theme.palette.neutralShades,
  });
  const [filterAddress, setFilterAddress] = useState<SerializedWalletBalance>();
  const [groupedTokens, setGroupedTokens] = useState<TokenEntry[]>([]);
  const [t] = useTranslationContext();

  useEffect(() => {
    // return early if no wallets available
    if (!wallets || wallets.length === 0) {
      return;
    }

    // list of all monetized tokens, sorted by most valuable
    const allTokens: TokenEntry[] = [
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
          type: TokenType.Native,
          name: wallet.name,
          value: wallet.value?.walletUsdAmt || 0,
          tokenConversionUsd: wallet.value?.marketUsdAmt || 0,
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
          walletType: wallet.walletType,
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
            type: TokenType.Nft,
            name: walletNft.name,
            value: walletNft.totalValueUsdAmt || 0,
            balance: walletNft.ownedCount,
            tokenConversionUsd:
              walletNft.totalValueUsdAmt && walletNft.ownedCount
                ? walletNft.totalValueUsdAmt / walletNft.ownedCount
                : 0,
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
            walletType: wallet.walletType,
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
            tokenConversionUsd: walletToken.value?.marketUsdAmt || 0,
            history: walletToken.value?.history?.sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime(),
            ),
            ticker: walletToken.symbol,
            symbol: wallet.symbol,
            walletAddress: wallet.address,
            walletBlockChainLink: wallet.blockchainScanUrl,
            walletName: wallet.name,
            walletType: wallet.walletType,
            imageUrl: walletToken.logoUrl,
          };
        }),
      ),
    ]
      .filter(item => item?.value > 0.01 || item?.walletType === 'mpc')
      .sort((a, b) => b.value - a.value || b.balance - a.balance)
      .filter(
        item =>
          !filterAddress ||
          (filterAddress.address.toLowerCase() ===
            item.walletAddress.toLowerCase() &&
            filterAddress.symbol.toLowerCase() === item.symbol.toLowerCase()),
      );

    // aggregate like tokens entries from different wallets
    const tokens: TokenEntry[] = [];
    allTokens.map(currentToken => {
      // skip if this token has already been added to the list
      const existingTokens = tokens.filter(
        existingToken =>
          existingToken.symbol === currentToken.symbol &&
          existingToken.type === currentToken.type &&
          existingToken.name === currentToken.name,
      );
      if (existingTokens.length > 0) {
        return;
      }

      // aggregate balances from all matching tokens
      const matchingTokens = allTokens.filter(
        matchingToken =>
          matchingToken.symbol === currentToken.symbol &&
          matchingToken.type === currentToken.type &&
          matchingToken.name === currentToken.name,
      );
      const token = {
        ...currentToken,
        balance: matchingTokens
          .map(matchingToken => matchingToken.balance)
          .reduce((p, c) => p + c, 0),
        value: matchingTokens
          .map(matchingToken => matchingToken.value)
          .reduce((p, c) => p + c, 0),
      };
      tokens.push(token);
    });
    setGroupedTokens(tokens);
  }, [wallets, filterAddress]);

  // total value of the portfolio
  const totalValue = groupedTokens
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
        key={`wallet-${wallet?.symbol}-${wallet?.address}`}
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

  // render the wallet list
  return (
    <Box className={classes.portfolioContainer}>
      {!isOwner && (
        <Box className={classes.sectionHeaderContainer}>
          <Box className={classes.sectionHeader}>
            {domain && (
              <Tooltip
                title={t(
                  verified
                    ? 'verifiedWallets.verifiedOnly'
                    : 'verifiedWallets.notVerified',
                  {domain},
                )}
              >
                <MonetizationOnOutlinedIcon className={classes.headerIcon} />
              </Tooltip>
            )}
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
      )}
      {wallets || isError ? (
        <Box
          mt={'15px'}
          mb={2}
          id={`scrollablePortfolioDiv`}
          className={cx(classes.scrollableContainer)}
        >
          <Grid container spacing={1}>
            <Grid item xs={12}>
              {wallets && (
                <Box className={cx(classes.walletListContainer)}>
                  {wallets.length > 1 && renderWallet()}
                  {wallets.map(wallet => renderWallet(wallet))}
                </Box>
              )}
            </Grid>
            {!isError && groupedTokens.length > 0 ? (
              groupedTokens.map(token => (
                <Grid
                  item
                  xs={12}
                  key={`${token.type}/${token.symbol}/${token.ticker}/${token.walletAddress}`}
                >
                  <Box className={classes.tokenContainer}>
                    <Token
                      primaryShade={!!isOwner}
                      token={token}
                      onClick={() => handleClick(token.walletBlockChainLink)}
                      showGraph
                    />
                  </Box>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography className={classes.noActivity} textAlign="center">
                  {isError
                    ? t('tokensPortfolio.retrieveError')
                    : t('tokensPortfolio.noTokens')}
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

export type TokensPortfolioProps = {
  domain?: string;
  wallets?: SerializedWalletBalance[];
  minCount?: number;
  maxCount?: number;
  isError?: boolean;
  isOwner?: boolean;
  verified: boolean;
};
