import {erc20Abi} from 'abitype/abis';
import {erc721ABI} from 'wagmi';
import {Web3} from 'web3';
import {HttpProvider} from 'web3-providers-http';

import config from '@unstoppabledomains/config';

interface Web3Auth {
  chainSymbol: string;
  ownerAddress: string;
  accessToken: string;
}

export const getContractDecimals = async (
  address: string,
  auth: Web3Auth,
): Promise<number> => {
  const erc20Contract = getErc20Contract(address, auth);
  const decimals = await erc20Contract.methods.decimals.call([]).call();
  return Number(decimals);
};

export const getErc20Contract = (
  address: string,
  auth: Web3Auth,
  fromAddress?: string,
) => {
  // ERC-20 contract instance for sending a specific token
  const web3 = getWeb3(auth);
  return new web3.eth.Contract(erc20Abi, address, {
    from: fromAddress,
  });
};

export const getErc721Contract = (
  address: string,
  auth: Web3Auth,
  fromAddress?: string,
) => {
  const web3 = getWeb3(auth);
  return new web3.eth.Contract(erc721ABI, address, {
    from: fromAddress,
  });
};

export const getWeb3 = (auth: Web3Auth): Web3 => {
  // validate the auth parameters
  if (!auth.accessToken || !auth.chainSymbol || !auth.ownerAddress) {
    throw new Error('invalid web3 RPC credentials');
  }

  // build a web3 provider to the RPC proxy, including the wallet specific
  // auth data to validate the request
  return new Web3(
    new HttpProvider(
      `${config.PROFILE.HOST_URL}/user/${auth.ownerAddress}/wallet/rpc?symbol=${auth.chainSymbol}`,
      {
        providerOptions: {
          headers: {['Authorization']: `Bearer ${auth.accessToken}`},
        },
      },
    ),
  );
};
