import type {VersionedTransaction} from '@solana/web3.js';
import {Connection, Keypair, PublicKey} from '@solana/web3.js';
import {utils} from 'ethers';
import nacl from 'tweetnacl';

import type {FireblocksMessageSigner} from '../../../hooks/useFireblocksMessageSigner';
import * as provider from './provider';
import {
  createSplTransferTx,
  deserializeTxHex,
  getOrCreateAssociatedTokenAccountWithMPC,
} from './transaction';

const mockAddress = 'mock-address';
const mockAccessToken = 'mock-access-token';

describe('solana transactions', () => {
  beforeEach(() => {
    jest
      .spyOn(provider, 'getSolanaProvider')
      .mockReturnValue(
        new Connection(
          'https://solana-mainnet.g.alchemy.com/v2/NHnzEesdDuX90lFZRMOa4ZSE0wIR-BAo',
          'confirmed',
        ),
      );
  });

  it('should create a transaction if destination token account exists', async () => {
    const mockSigner = jest.fn();

    const tx = await createSplTransferTx(
      '8DyNeQYMWY6NLpPN7S1nTcDy2WXLnm5rzrtdWA2H2t6Y',
      'HLAkHNm1qqGDZxyhoKGWPVwgXAaPSHA2fH5WKLouUJZT',
      'dog1viwbb2vWDpER5FrJ4YFG6gq6XuyFohUe9TXN65u',
      1,
      mockSigner,
      mockAccessToken,
    );
    expect(tx).toBeDefined();
    expect(mockSigner).not.toHaveBeenCalled();
  });

  it('should create a transaction if destination token is missing', async () => {
    const mockSigner = jest.fn().mockImplementation((message: string) => {
      return message;
    });

    await expect(
      createSplTransferTx(
        '8DyNeQYMWY6NLpPN7S1nTcDy2WXLnm5rzrtdWA2H2t6Y',
        'HLAkHNm1qqGDZxyhoKGWPVwgXAaPSHA2fH5WKLouUJZT',
        'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
        1,
        mockSigner,
        mockAccessToken,
      ),
    ).rejects.toThrow('Assertion failed');
    expect(mockSigner).toHaveBeenCalledTimes(1);
  });

  it('should create a token account transaction', async () => {
    const payer = Keypair.generate();
    const rpcConnection = provider.getSolanaProvider(
      mockAddress,
      mockAccessToken,
    );

    const mockSigner: FireblocksMessageSigner = async (message: string) => {
      const messageBytes = Buffer.from(message.replace('0x', ''), 'hex');
      const signature = nacl.sign.detached(messageBytes, payer.secretKey);
      return utils.hexlify(signature);
    };

    await expect(
      getOrCreateAssociatedTokenAccountWithMPC(
        rpcConnection,
        payer,
        new PublicKey('EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm'),
        payer.publicKey,
        mockSigner,
        mockAccessToken,
        false,
      ),
    ).rejects.toThrow(/token account .+ tx was not broadcasted/);
  });

  it('should broadcast a token account transaction', async () => {
    const payer = Keypair.generate();
    const rpcConnection = provider.getSolanaProvider(
      mockAccessToken,
      mockAccessToken,
    );

    const signer: FireblocksMessageSigner = async (message: string) => {
      const messageBytes = Buffer.from(message.replace('0x', ''), 'hex');
      const signature = nacl.sign.detached(messageBytes, payer.secretKey);
      return utils.hexlify(signature);
    };
    const mockSigner = jest.fn(signer);

    await expect(
      getOrCreateAssociatedTokenAccountWithMPC(
        rpcConnection,
        payer,
        new PublicKey('EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm'),
        payer.publicKey,
        mockSigner,
        mockAccessToken,
        true,
      ),
    ).rejects.toThrow(/failed to send transaction:/);
    expect(mockSigner).toHaveBeenCalledTimes(1);
  });

  it('should deserialize a tx from hex', () => {
    const txEncoded =
      '0100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800100070fb14716817e77beab87edc02f390162b90e35d4cc8752dcb15b4f6de8d99e1988d528e56cc0879d8292977fe2e9e83a32691329e90ea8ebc1eb61d58799a5936f9c33a152f4fe1aaa766bf63fd18e8df4d60be838002f58795f4f9dd771af3e0efc798b9db81f07b3f86878593281a41441cdde24d4a62909ae1561227ee905cb834a2c784310d6ddb374e40e7cfc3fa5a8759b86b96349a776d55f538000ea93254f8e27de9f7f3fcfcc7b63da67fc59b700b3b6e86b91822bad012ce8d8ec9eabee5a3c3c7c1d95f0f8dca0df9ed12286c81edc7e82ce89929d76e5f3a886e04fd92bf98d46d724426d08dba38b08124c145ffe4041ca61c0793d440e2bac540306466fe5211732ffecadba72c39be7bc8ce5bbc5f7126b2c439b3a400000008c97258f4e2489f1bb3d1029148e0d830b5a1399daff1084048e7bd8dbe9f859000000000000000000000000000000000000000000000000000000000000000006ddf6e1d765a193d9cbe146ceeb79ac1cb485ed5f5b37913a8cf5857eff00a90479d55bf231c06eee74c56ece681507fdb1b2dea3f48e5102b1cda256bc138fb43ffa27f5d7f64a74c09b1f295879de4b09ab36dfc9dd514b321aa7b38ce5e80d0720fe448de59d8811e24d6df917dc8d0d98b392ddf4dd2b622a747a60fded2a7a7f67c4c495fd30d641c124fd81dc9b8ddebea2c4eb50fa002a0d2be45aeb0808000502c027090008000903098b0200000000000906000100150a0b01010a0200010c0200000025cd9c01000000000b010101110c1d0b0001020c160c0d0c170f171011010215161217000b0b18170304130c23e517cb977ae3ad2a010000002664000125cd9c01000000004de84c00000000002100000b0301000001090e0c001916051a020607140a0b09a702828362be28ce443255a74c00000000000000000000000000000000000000000000000000000000000000000000002105140000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000401e6211e3e9b1400000053bb05138a2d88d21622a4fae14c7384b8adc2b200b14716817e77beab87edc02f390162b90e35d4cc8752dcb15b4f6de8d99e1988001400000053bb05138a2d88d21622a4fae14c7384b8adc2b20114000000555ce236c0220695b68341bc48c68d52210cc35b0001c11200007486ed4c9401000042000000010100000010f07100000000000000000000000000000000009b3e1e21e601040000000000000000000000000000000000000000000000000000000000000000000002708de64f8352a7bcf3f09396ba0d47e63d291c29739a743308e0a7d27871993b059f9e9deff004a0f1f3a109d3554dd996a97f9178f2d9e2e3e7abdd5a67d17a9f6ffc24554b34b4c0c15d0103020210';
    const tx = deserializeTxHex(txEncoded) as VersionedTransaction;
    expect(tx).toBeDefined();
    expect(
      tx.message.staticAccountKeys
        .find(
          k => k.toBase58() === 'Cw22v4aCvUqckaMSJ8FF5saYA99SX59v6WQ2NkuRMbQj',
        )
        ?.toBase58(),
    ).toBe('Cw22v4aCvUqckaMSJ8FF5saYA99SX59v6WQ2NkuRMbQj');
  });
});
