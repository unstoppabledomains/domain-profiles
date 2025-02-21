import type {SerializedWalletBalance, TokenEntry} from '../types';
import {TokenType} from '../types';

export const getSortedTokens = (
  wallets: SerializedWalletBalance[],
  filterAddress?: SerializedWalletBalance,
): TokenEntry[] => {
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
          address: walletToken.address,
          type: wallet.symbol === 'SOL' ? TokenType.Spl : TokenType.Erc20,
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

  // return aggregated list
  return tokens;
};
