import {
  TokenAccountNotFoundError,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import {
  Connection,
  ParsedAccountData,
  PublicKey,
  Signer,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';
import {utils} from 'ethers';

import {FireblocksMessageSigner} from '../../../hooks/useFireblocksMessageSigner';
import {notifyEvent} from '../../error';
import {FB_MAX_RETRY, FB_WAIT_TIME_MS} from '../../fireBlocks/client';
import {sleep} from '../../sleep';
import {getSolanaProvider} from './provider';

export const createSplTransferTx = async (
  fromAddress: string,
  toAddress: string,
  tokenAddress: string,
  amount: number,
  signWithMpc: FireblocksMessageSigner,
) => {
  // retrieve a connection
  const rpcProvider = getSolanaProvider();

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
  );

  // get the token account of the to address, if it does not exist, create it
  const toTokenAccount = await getOrCreateAssociatedTokenAccountWithMPC(
    rpcProvider,
    fromWalletSigner,
    tokenMint,
    toWallet,
    signWithMpc,
  );

  // Add token transfer instructions to transaction. The lastBlockHash is important
  // to ensure the tx is valid, and can only be used for about 60–90 seconds before
  // it's considered expired. This means if it takes too long to generate a signature
  // the transaction will fail.
  const [latestBlockhash, tokenDecimals] = await Promise.all([
    rpcProvider.getLatestBlockhash(),
    getTokenDecimals(rpcProvider, tokenMint),
  ]);
  const transaction = new Transaction({
    feePayer: fromWalletSigner.publicKey,
    ...latestBlockhash,
  }).add(
    createTransferInstruction(
      fromTokenAccount.address,
      toTokenAccount.address,
      fromWalletSigner.publicKey,
      amount * Math.pow(10, tokenDecimals),
    ),
  );
  return transaction;
};

export const getOrCreateAssociatedTokenAccountWithMPC = async (
  connection: Connection,
  payer: Signer,
  mint: PublicKey,
  owner: PublicKey,
  signWithMpc: FireblocksMessageSigner,
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
      const latestBlockhash = await connection.getLatestBlockhash();
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
      const associatedTokenTx = new Transaction({
        feePayer: payer.publicKey,
        ...latestBlockhash,
      }).add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          associatedToken,
          owner,
          mint,
        ),
      );

      // sign the transaction to create token account
      await signTransaction(
        associatedTokenTx,
        payer.publicKey.toBase58(),
        signWithMpc,
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

export const signTransaction = async (
  tx: Transaction | VersionedTransaction,
  signerAddress: string,
  signWithMpc: FireblocksMessageSigner,
  broadcast?: boolean,
): Promise<Transaction | VersionedTransaction> => {
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
    const txHash = await broadcastTx(tx);
    await waitForTx(txHash);
  }

  // return the signed transaction
  return tx;
};

export const broadcastTx = async (tx: Transaction | VersionedTransaction) => {
  // broadcast the raw transaction
  const rpcConnection = getSolanaProvider();
  notifyEvent('broadcast tx start', 'info', 'Wallet', 'Signature', {
    meta: {tx},
  });
  const txHash = await rpcConnection.sendRawTransaction(tx.serialize());
  notifyEvent('broadcast tx complete', 'info', 'Wallet', 'Signature', {
    meta: {txHash},
  });

  return txHash;
};

export const waitForTx = async (txHash: string) => {
  // wait for confirmation
  const rpcConnection = getSolanaProvider();
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
        break;
      }
    } catch (e) {
      notifyEvent(e, 'warning', 'Wallet', 'Transaction', {meta: {txHash}});
    }
    await sleep(FB_WAIT_TIME_MS);
  }

  notifyEvent('confirm tx complete', 'info', 'Wallet', 'Signature', {
    meta: {txHash},
  });
};

export const isVersionedTransaction = (
  transaction: Transaction | VersionedTransaction,
): transaction is VersionedTransaction => {
  return 'version' in transaction;
};
