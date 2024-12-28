import {Web3} from 'web3';

import {createErc20TransferTx} from './token';
import * as web3 from './web3';

describe('token transactions', () => {
  it('should create an erc20 transfer tx', async () => {
    // mock the contract decimals
    jest.spyOn(web3, 'getContractDecimals').mockResolvedValue(6);
    jest
      .spyOn(web3, 'getWeb3')
      .mockReturnValue(
        new Web3(
          'https://polygon-amoy.infura.io/v3/467fd78247874d7e87d34c04fdd09bbb',
        ),
      );

    // create the transaction
    const tx = await createErc20TransferTx({
      chainId: 80002,
      accessToken: 'mock-access-token',
      tokenAddress: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582',
      fromAddress: '0xCD0DAdAb45bAF9a06ce1279D1342EcC3F44845af',
      toAddress: '0x8ee1E1d88EBE2B44eAD162777DE787Ef6A2dC2F2',
      amount: 0.000001,
    });
    expect(tx).toMatchObject({
      chainId: 80002,
      to: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582',
      // expected data generated directly from Polygon scan using MetaMask:
      // https://amoy.polygonscan.com/token/0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582?a=0x8ee1e1d88ebe2b44ead162777de787ef6a2dc2f2#writeProxyContract
      data: '0xa9059cbb0000000000000000000000008ee1e1d88ebe2b44ead162777de787ef6a2dc2f20000000000000000000000000000000000000000000000000000000000000001',
      value: '0',
    });
  });
});
