import {Keypair, PublicKey} from '@solana/web3.js';
import {utils} from 'ethers';
import nacl from 'tweetnacl';

import {FireblocksMessageSigner} from '../../../hooks/useFireblocksMessageSigner';
import {getSolanaProvider} from './provider';
import {
  createSplTransferTx,
  getOrCreateAssociatedTokenAccountWithMPC,
} from './transaction';

describe('solana transactions', () => {
  it('should create a transaction if destination token account exists', async () => {
    const mockSigner = jest.fn();

    const tx = await createSplTransferTx(
      '8DyNeQYMWY6NLpPN7S1nTcDy2WXLnm5rzrtdWA2H2t6Y',
      'HLAkHNm1qqGDZxyhoKGWPVwgXAaPSHA2fH5WKLouUJZT',
      '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
      1,
      mockSigner,
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
      ),
    ).rejects.toThrow('Assertion failed');
    expect(mockSigner).toHaveBeenCalledTimes(1);
  });

  it('should create a token account transaction', async () => {
    const payer = Keypair.generate();
    const rpcConnection = getSolanaProvider();

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
        false,
      ),
    ).rejects.toThrow(/token account .+ tx was not broadcasted/);
  });

  it('should broadcast a token account transaction', async () => {
    const payer = Keypair.generate();
    const rpcConnection = getSolanaProvider();

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
        true,
      ),
    ).rejects.toThrow(
      'failed to send transaction: Transaction simulation failed: Attempt to debit an account but found no record of a prior credit.',
    );
  });
});
