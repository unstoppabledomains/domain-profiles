import {erc20Abi} from 'abitype/abis';
import {Web3} from 'web3';

export const getContract = (
  providerUrl: string,
  tokenAddress: string,
  fromAddress?: string,
) => {
  // ERC-20 contract instance for sending a specific token
  const web3 = getWeb3(providerUrl);
  return new web3.eth.Contract(erc20Abi, tokenAddress, {
    from: fromAddress,
  });
};

export const getContractDecimals = async (
  providerUrl: string,
  address: string,
): Promise<number> => {
  const erc20Contract = getContract(providerUrl, address);
  const decimals = await erc20Contract.methods.decimals.call([]).call();
  return Number(decimals);
};

export const getWeb3 = (providerUrl: string): Web3 => {
  return new Web3(providerUrl);
};
