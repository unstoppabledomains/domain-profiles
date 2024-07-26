/* eslint-disable @typescript-eslint/no-explicit-any */
import {utils} from 'ethers';
import * as viemChains from 'viem/chains';
import type {WalletClient} from 'wagmi';

import type {CreateTransaction} from '../types';

const {...chains} = viemChains;

// WalletClientSigner extends the Wagmi WalletClient to include the required
// interface methods to be an Ethers signer
export class WalletClientSigner {
  address: string;
  wallet: WalletClient;

  // build an object that wraps a Wagmi WalletClient and a given address
  constructor(address: string, wallet: WalletClient) {
    this.address = address;
    this.wallet = wallet;
  }

  // getAddress retrieves the address that will be creating the signature
  async getAddress(): Promise<string> {
    return this.address;
  }

  getChain(chainId: number) {
    for (const chain of Object.values(chains)) {
      if (chain.id === chainId) {
        return chain;
      }
    }

    throw new Error(`Chain with id ${chainId} not found`);
  }

  // signMessage supports a string arg or an account containing the message
  // that needs to be signed
  async signMessage(message: string | signMessageProps): Promise<string> {
    if (typeof message === 'string') {
      if (utils.isHexString(message)) {
        return await this.wallet.signMessage({
          account: this.address as any,
          message: {
            raw: message as any,
          },
        });
      }
      return await this.wallet.signMessage({
        account: this.address as any,
        message,
      });
    }
    return this.wallet.signMessage(message as any);
  }

  // signTransaction wraps the transaction signer for the wagmi client
  async signTransaction(tx: CreateTransaction): Promise<string> {
    // ensure wallet is targeting correct chain
    const currentChainId = await this.wallet.getChainId();
    if (currentChainId !== tx.chainId) {
      await this.wallet.switchChain({
        id: this.getChain(tx.chainId).id,
      });
    }

    // sign and broadcast the transaction
    return await this.wallet.sendTransaction({
      to: tx.to as any,
      data: tx.data as any,
      value: tx.value as any,
      chain: this.getChain(tx.chainId),
    });
  }
}

export interface signMessageProps {
  account: string;
  message: string;
}
