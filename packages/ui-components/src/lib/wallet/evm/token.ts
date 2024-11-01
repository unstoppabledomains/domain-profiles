import {erc20Abi} from 'abitype/abis';

import type {CreateTransaction} from '../../types';
import {getWeb3} from './web3';

export const createErc20TransferTx = async (
  chainId: number,
  tokenAddress: string,
  fromAddress: string,
  toAddress: string,
  amount: number,
): Promise<CreateTransaction> => {
  // retrieve a web3 provider for requested chain ID
  const web3 = getWeb3(chainId);
  if (!web3) {
    throw new Error(`Chain ID not supported: ${chainId}`);
  }

  // ERC-20 contract instance for sending a specific token
  const erc20Contract = new web3.eth.Contract(erc20Abi, tokenAddress, {
    from: fromAddress,
  });

  // retrieve the contract decimals to represent the amount
  const decimals = await erc20Contract.methods.decimals.call([]).call();
  const normalizedAmt = Math.floor(amount * Math.pow(10, Number(decimals)));

  // create the transaction that should be signed to execute ERC-20 transfer
  return {
    chainId,
    to: tokenAddress,
    data: erc20Contract.methods.transfer(toAddress, normalizedAmt).encodeABI(),
    value: '0',
  };
};
