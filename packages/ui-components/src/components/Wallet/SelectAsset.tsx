import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import type {ImmutableArray} from '@unstoppabledomains/config/build/src/env/types';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {SerializedWalletBalance, TokenEntry} from '../../lib';
import {TokenType, useTranslationContext} from '../../lib';
import {getAllTokens} from '../../lib/wallet/evm/token';
import {filterWallets} from '../../lib/wallet/filter';
import FundWalletModal from './FundWalletModal';
import {TitleWithBackButton} from './TitleWithBackButton';
import Token from './Token';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '250px',
    width: '100%',
    height: '100%',
  },
  assetsContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    alignItems: 'center',
    overflowY: 'scroll',
  },
  loadingContainer: {
    color: theme.palette.wallet.text.secondary,
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: theme.spacing(2),
  },
  loadingSpinner: {
    color: theme.palette.wallet.text.secondary,
    marginRight: theme.spacing(1),
  },
  asset: {
    backgroundImage: `linear-gradient(${theme.palette.wallet.background.gradient.start}, ${theme.palette.wallet.background.gradient.end})`,
    borderRadius: 9,
    padding: 12,
    width: '100%',
    marginBottom: theme.spacing(0.5),
  },
  icon: {
    fontSize: '60px',
  },
  noTokensContainer: {
    textAlign: 'center',
    height: '100%',
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
  supportedAssetList: ImmutableArray<string>;
  supportErc20?: boolean;
  supportSpl?: boolean;
};

export const SelectAsset: React.FC<Props> = ({
  onCancelClick,
  onSelectAsset,
  wallets: initialWallets,
  label,
  showGraph,
  hideBalance,
  requireBalance,
  onClickReceive,
  onClickBuy,
  supportedAssetList,
  supportErc20,
  supportSpl,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  const wallets = filterWallets(initialWallets, supportedAssetList);
  const missingWallets = supportedAssetList.filter(
    expectedWallet =>
      !wallets
        .map(w => `${w.symbol.toUpperCase()}/${w.gasCurrency.toUpperCase()}`)
        .find(w => w === expectedWallet),
  );
  const allTokens = getAllTokens(wallets);
  const filteredTokens: TokenEntry[] = allTokens
    .filter(token => !requireBalance || token.balance > 0)
    .filter(
      token =>
        (token.type === TokenType.Erc20 && supportErc20) ||
        (token.type === TokenType.Spl && supportSpl) ||
        supportedAssetList.includes(
          `${token.symbol.toUpperCase()}/${token.ticker.toUpperCase()}`,
        ),
    )
    .sort((a, b) =>
      hideBalance
        ? // sort by name
          a.name.localeCompare(b.name)
        : // sort by balance
          b.value - a.value || b.balance - a.balance,
    );

  return (
    <Box className={classes.container} data-testid={'select-asset-container'}>
      <TitleWithBackButton onCancelClick={onCancelClick} label={label} />
      <Box className={classes.assetsContainer} mt={2}>
        {requireBalance &&
          allTokens.length > 0 &&
          filteredTokens.length === 0 &&
          onClickBuy &&
          onClickReceive && (
            <Box className={classes.noTokensContainer}>
              <FundWalletModal
                onBuyClicked={onClickBuy}
                onReceiveClicked={onClickReceive}
              />
            </Box>
          )}
        {filteredTokens.map(token => {
          const handleClick = () => {
            onSelectAsset(token);
          };
          return (
            <div
              className={classes.asset}
              id={token.name}
              key={`${token.type}/${token.symbol}/${token.ticker}/${token.walletAddress}`}
            >
              <Token
                isOwner
                token={token}
                onClick={handleClick}
                hideBalance={hideBalance}
                showGraph={showGraph}
              />
            </div>
          );
        })}
        {missingWallets && missingWallets.length > 0 && (
          <Box className={classes.loadingContainer}>
            <CircularProgress size={20} className={classes.loadingSpinner} />
            <Typography variant="body2">
              {t('wallet.creatingWallets')}
            </Typography>
          </Box>
        )}
        {missingWallets?.map(missingWallet => (
          <Skeleton
            key={`missingWallet-${missingWallet}`}
            className={classes.asset}
            variant="rectangular"
            height="65px"
          />
        ))}
      </Box>
    </Box>
  );
};
