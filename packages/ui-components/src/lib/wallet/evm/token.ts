import type {SerializedWalletBalance} from '../../types/domain';
import {TokenType} from '../../types/domain';
import type {CreateTransaction} from '../../types/fireBlocks';
import type {TokenEntry} from '../../types/wallet';
import {getContract, getContractDecimals} from './web3';

export const createErc20TransferTx = async (opts: {
  chainId: number;
  providerUrl: string;
  tokenAddress: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
}): Promise<CreateTransaction> => {
  // ERC-20 contract instance for sending a specific token
  const erc20Contract = getContract(
    opts.providerUrl,
    opts.tokenAddress,
    opts.fromAddress,
  );

  // retrieve the contract decimals to represent the amount
  const decimals = await getContractDecimals(
    opts.providerUrl,
    opts.tokenAddress,
  );
  const normalizedAmt = Math.floor(opts.amount * Math.pow(10, decimals));

  // create the transaction that should be signed to execute ERC-20 transfer
  return {
    chainId: opts.chainId,
    to: opts.tokenAddress,
    data: erc20Contract.methods
      .transfer(opts.toAddress, normalizedAmt)
      .encodeABI(),
    value: '0',
  };
};

export const getAllTokens = (wallets: SerializedWalletBalance[]) => {
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
  return allTokens;
};

export const serializeNativeTokens = (wallet: SerializedWalletBalance) => {
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
