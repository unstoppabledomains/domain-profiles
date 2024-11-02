import Box from '@mui/material/Box';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import type {ImmutableArray} from '@unstoppabledomains/config/build/src/env/types';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {SerializedWalletBalance} from '../../lib';
import {TokenType, WalletPaletteOwner} from '../../lib';
import {filterWallets} from '../../lib/wallet/filter';
import FundWalletModal from './FundWalletModal';
import {TitleWithBackButton} from './TitleWithBackButton';
import type {TokenEntry} from './Token';
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
  },
  asset: {
    backgroundImage: `linear-gradient(${WalletPaletteOwner.background.gradient.start}, ${WalletPaletteOwner.background.gradient.end})`,
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
}) => {
  const {classes} = useStyles();
  const wallets = filterWallets(initialWallets, supportedAssetList);

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
      imageUrl: wallet.logoUrl,
    };
  };
  const allTokens: TokenEntry[] = [
    ...wallets.flatMap(serializeNativeTokens),
    ...(wallets || []).flatMap(wallet =>
      (wallet?.tokens || []).map(walletToken => {
        return {
          address: walletToken.address,
          type: walletToken.type,
          name: walletToken.name,
          value: walletToken.value?.walletUsdAmt || 0,
          balance: walletToken.balanceAmt || 0,
          pctChange: walletToken.value?.marketPctChange24Hr,
          tokenConversionUsd: walletToken.value?.marketUsdAmt || 0,
          history: walletToken.value?.history?.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
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
  ];
  const filteredTokens: TokenEntry[] = allTokens
    .filter(token => !requireBalance || token.balance > 0)
    .filter(
      token =>
        (token.type === TokenType.Erc20 && supportErc20) ||
        supportedAssetList.includes(
          `${token.symbol.toUpperCase()}/${token.ticker.toUpperCase()}`,
        ),
    )
    .sort((a, b) => b.value - a.value || b.balance - a.balance);

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
      </Box>
    </Box>
  );
};
