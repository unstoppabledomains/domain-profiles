import {
  TokenAccountNotFoundError,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import type {Connection, ParsedAccountData, Signer} from '@solana/web3.js';
import {
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import {utils} from 'ethers';

import type {FireblocksMessageSigner} from '../../../hooks/useFireblocksMessageSigner';
import {notifyEvent} from '../../error';
import {FB_MAX_RETRY, FB_WAIT_TIME_MS} from '../../fireBlocks/client';
import {sleep} from '../../sleep';
import {getSolanaProvider} from './provider';

export const broadcastTx = async (
  tx: Transaction | VersionedTransaction,
  ownerAddress: string,
  accessToken: string,
) => {
  // broadcast the raw transaction
  const rpcConnection = getSolanaProvider(ownerAddress, accessToken);
  notifyEvent('broadcast tx start', 'info', 'Wallet', 'Signature', {
    meta: {tx},
  });
  const txHash = await rpcConnection.sendRawTransaction(tx.serialize());
  notifyEvent('broadcast tx complete', 'info', 'Wallet', 'Signature', {
    meta: {txHash},
  });
  return txHash;
};

export const createNativeTransferTx = async (
  fromAddress: string,
  toAddress: string,
  amount: number,
  accessToken: string,
) => {
  // create public keys for associated accounts
  const fromWalletSigner: Signer = {
    publicKey: new PublicKey(fromAddress),
    secretKey: new Uint8Array(),
  };
  const toPubkey = new PublicKey(toAddress);

  // Add token transfer instructions to transaction. The lastBlockHash is important
  // to ensure the tx is valid, and can only be used for about 60–90 seconds before
  // it's considered expired. This means if it takes too long to generate a signature
  // the transaction will fail.
  const latestBlockhash = await getLatestBlockhash(fromAddress, accessToken);

  const transaction = await simulateAndBudgetTx(
    new Transaction({
      feePayer: fromWalletSigner.publicKey,
      ...latestBlockhash,
    }).add(
      SystemProgram.transfer({
        fromPubkey: fromWalletSigner.publicKey,
        toPubkey,
        lamports: amount * LAMPORTS_PER_SOL,
      }),
    ),
    fromAddress,
    accessToken,
  );
  return transaction;
};

export const createSplTransferTx = async (
  fromAddress: string,
  toAddress: string,
  tokenAddress: string,
  amount: number,
  signWithMpc: FireblocksMessageSigner,
  accessToken: string,
) => {
  // retrieve a connection
  const rpcProvider = getSolanaProvider(fromAddress, accessToken);

  // create public keys for associated accounts
  const fromWalletSigner: Signer = {
    publicKey: new PublicKey(fromAddress),
    secretKey: new Uint8Array(),
  };
  const toWallet = new PublicKey(toAddress);
  const tokenMint = new PublicKey(tokenAddress);

  // get the token account of the from address, if it does not exist, create it
  const fromTokenAccount = await getOrCreateAssociatedTokenAccountWithMPC(
    rpcProvider,
    fromWalletSigner,
    tokenMint,
    fromWalletSigner.publicKey,
    signWithMpc,
    accessToken,
  );

  // get the token account of the to address, if it does not exist, create it
  const toTokenAccount = await getOrCreateAssociatedTokenAccountWithMPC(
    rpcProvider,
    fromWalletSigner,
    tokenMint,
    toWallet,
    signWithMpc,
    accessToken,
  );

  // Add token transfer instructions to transaction. The lastBlockHash is important
  // to ensure the tx is valid, and can only be used for about 60–90 seconds before
  // it's considered expired. This means if it takes too long to generate a signature
  // the transaction will fail.
  const [latestBlockhash, tokenDecimals] = await Promise.all([
    getLatestBlockhash(fromAddress, accessToken),
    getTokenDecimals(rpcProvider, tokenMint),
  ]);
  const transaction = await simulateAndBudgetTx(
    new Transaction({
      feePayer: fromWalletSigner.publicKey,
      ...latestBlockhash,
    }).add(
      createTransferInstruction(
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWalletSigner.publicKey,
        amount * Math.pow(10, tokenDecimals),
      ),
    ),
    fromAddress,
    accessToken,
  );
  return transaction;
};

export const deserializeTxB58 = (
  b58SerializedTx: string,
): Transaction | VersionedTransaction => {
  try {
    return VersionedTransaction.deserialize(bs58.decode(b58SerializedTx));
  } catch (e) {
    return Transaction.from(bs58.decode(b58SerializedTx));
  }
};

export const deserializeTxHex = (
  hexSerializedTx: string,
): Transaction | VersionedTransaction => {
  try {
    return VersionedTransaction.deserialize(
      Buffer.from(hexSerializedTx, 'hex'),
    );
  } catch (e) {
    return Transaction.from(Buffer.from(hexSerializedTx, 'hex'));
  }
};

export const getLatestBlockhash = async (
  ownerAddress: string,
  accessToken: string,
) => {
  const rpcConnection = getSolanaProvider(ownerAddress, accessToken);
  return await rpcConnection.getLatestBlockhash('confirmed');
};

export const getOrCreateAssociatedTokenAccountWithMPC = async (
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  owner: PublicKey,
  signWithMpc: FireblocksMessageSigner,
  accessToken: string,
  broadcast: boolean = true,
) => {
  try {
    notifyEvent('retrieving token account', 'info', 'Wallet', 'Transaction', {
      meta: {
        payer: payer.publicKey,
        owner: owner.toBase58(),
        token: mint.toBase58(),
        broadcast,
      },
    });
    return await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      owner,
    );
  } catch (e) {
    if (e instanceof TokenAccountNotFoundError) {
      // create a transaction to create the token account if it is missing
      const associatedToken = getAssociatedTokenAddressSync(mint, owner);
      const latestBlockhash = await getLatestBlockhash(
        payer.publicKey.toBase58(),
        accessToken,
      );
      notifyEvent('creating token account', 'info', 'Wallet', 'Transaction', {
        meta: {
          payer: payer.publicKey,
          owner: owner.toBase58(),
          token: mint.toBase58(),
          associatedToken,
          latestBlockhash,
          broadcast,
        },
      });
      const associatedTokenTx = await simulateAndBudgetTx(
        new Transaction({
          feePayer: payer.publicKey,
          ...latestBlockhash,
        }).add(
          createAssociatedTokenAccountInstruction(
            payer.publicKey,
            associatedToken,
            owner,
            mint,
          ),
        ),
        payer.publicKey.toBase58(),
        accessToken,
      );

      // sign the transaction to create token account
      await signTransaction(
        associatedTokenTx,
        payer.publicKey.toBase58(),
        signWithMpc,
        accessToken,
        broadcast,
      );

      // retrieve the newly created associated account
      if (broadcast) {
        return await getOrCreateAssociatedTokenAccount(
          connection,
          payer,
          mint,
          owner,
        );
      }
      throw new Error(
        `token account ${associatedToken.toBase58()} tx was not broadcasted`,
      );
    }
    throw e;
  }
};

export const getTokenDecimals = async (
  rpcConnection: Connection,
  tokenMint: PublicKey,
): Promise<number> => {
  const info = await rpcConnection.getParsedAccountInfo(tokenMint);
  const result = (info.value?.data as ParsedAccountData).parsed.info
    .decimals as number;
  return result;
};

export const isVersionedTransaction = (
  transaction: Transaction | VersionedTransaction,
): transaction is VersionedTransaction => {
  return 'version' in transaction;
};

export const signTransaction = async (
  tx: Transaction | VersionedTransaction,
  signerAddress: string,
  signWithMpc: FireblocksMessageSigner,
  accessToken: string,
  broadcast?: boolean,
): Promise<Transaction | VersionedTransaction> => {
  // update the latest blockhash to increase chance of landing onchain
  const latestBlockhash = await getLatestBlockhash(signerAddress, accessToken);
  if (isVersionedTransaction(tx)) {
    if (latestBlockhash.blockhash !== tx.message.recentBlockhash) {
      notifyEvent('updating tx', 'info', 'Wallet', 'Transaction');
      tx.message.recentBlockhash = latestBlockhash.blockhash;
    }
  } else {
    if (latestBlockhash.blockhash !== tx.recentBlockhash) {
      notifyEvent('updating legacy tx', 'info', 'Wallet', 'Transaction');
      tx.recentBlockhash = latestBlockhash.blockhash;
    }
  }

  // retrieve the tx message that must be signed depending on the format
  const txMessageBuffer = isVersionedTransaction(tx)
    ? tx.message.serialize()
    : tx.serializeMessage();
  const txMessage = utils.hexlify(txMessageBuffer);

  // sign the message
  notifyEvent('sign tx start', 'info', 'Wallet', 'Signature', {
    meta: {txMessage, tx},
  });
  const signature = await signWithMpc(txMessage, signerAddress);

  // append the signature to the transaction
  notifyEvent('sign tx complete', 'info', 'Wallet', 'Signature', {
    meta: {signature},
  });
  tx.addSignature(
    new PublicKey(signerAddress),
    Buffer.from(signature.replace('0x', ''), 'hex'),
  );

  // broadcast the tx if requested
  if (broadcast) {
    const txHash = await broadcastTx(tx, signerAddress, accessToken);
    await waitForTx(txHash, signerAddress, accessToken);
  }

  // return the signed transaction
  return tx;
};

/**
 * Improve the odds the Tx will land onchain, from https://docs.helius.dev/guides/sending-transactions-on-solana
 */
export const simulateAndBudgetTx = async (
  tx: Transaction,
  ownerAddress: string,
  accessToken: string,
) => {
  try {
    // generate a test transaction which includes the actual instructions plus
    // an additional compute budget instruction
    const testInstructions = [
      ComputeBudgetProgram.setComputeUnitLimit({units: 1_400_000}),
      ...tx.instructions,
    ];
    const testTransaction = new VersionedTransaction(
      new TransactionMessage({
        instructions: testInstructions,
        payerKey: tx.feePayer!,
        recentBlockhash: (await getLatestBlockhash(ownerAddress, accessToken))
          .blockhash,
      }).compileToV0Message(),
    );

    // simulate the test transaction
    const rpcConnection = getSolanaProvider(ownerAddress, accessToken);
    const simulationResult = await rpcConnection.simulateTransaction(
      testTransaction,
      {
        replaceRecentBlockhash: true,
        sigVerify: false,
      },
    );
    notifyEvent('simulation results', 'info', 'Wallet', 'Transaction', {
      meta: simulationResult,
    });

    // validate that a simulation result has compute units
    if (!simulationResult.value.unitsConsumed) {
      throw new Error('no compute units available');
    }

    // calculate the recommended compute units to motivate validators to
    // include the transaction in a block
    const unitsConsumed = simulationResult.value.unitsConsumed;
    const cuBuffer = Math.ceil(unitsConsumed * 1.1);

    // augment the original transaction compute units
    notifyEvent('adding tx compute units', 'info', 'Wallet', 'Transaction', {
      meta: {cuBuffer},
    });
    const computeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: cuBuffer,
    });
    tx.add(computeUnitIx);
  } catch (e) {
    notifyEvent(e, 'error', 'Wallet', 'Transaction', {
      msg: 'error simulating test transaction',
    });
  }
  return tx;
};

export const waitForTx = async (
  txHash: string,
  ownerAddress: string,
  accessToken: string,
) => {
  // wait for confirmation
  const rpcConnection = getSolanaProvider(ownerAddress, accessToken);
  notifyEvent('confirm tx start', 'info', 'Wallet', 'Signature', {
    meta: {txHash},
  });
  for (let i = 0; i < FB_MAX_RETRY; i++) {
    try {
      const info = await rpcConnection.getTransaction(txHash, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });
      notifyEvent('retrieved tx info', 'info', 'Wallet', 'Transaction', {
        meta: {txHash, info},
      });
      if (info) {
        notifyEvent('confirm tx complete', 'info', 'Wallet', 'Signature', {
          meta: {txHash},
        });
        return true;
      }
    } catch (e) {
      notifyEvent(e, 'warning', 'Wallet', 'Transaction', {meta: {txHash}});
    }
    await sleep(FB_WAIT_TIME_MS);
  }
  notifyEvent('transaction not confirmed', 'warning', 'Wallet', 'Signature', {
    meta: {txHash},
  });
  throw new Error('transaction not confirmed');
};
