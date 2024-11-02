import type {CreateTransaction} from '../../types';
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
