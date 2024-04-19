import {Mutex} from 'async-mutex';

import {notifyEvent} from '../error';
import {sleep} from '../sleep';
import type {signMessageProps} from '../wallet';

const signingMutex = new Mutex();

// ReactSigner implements the Ethers.js signing interface using react components
// to display and collect the required message signature
export class ReactSigner {
  address: string;
  setMessage: (v: string) => void;
  signatures: Record<string, string | undefined> = {};

  // build an object that wraps a Wagmi WalletClient and a given address
  constructor(address: string, setMessage: (v: string) => void) {
    this.address = address;
    this.setMessage = setMessage;
  }

  // getAddress retrieves the address that will be creating the signature
  async getAddress(): Promise<string> {
    return this.address;
  }

  async waitForSignature(message: string): Promise<string> {
    while (!this.signatures[message]) {
      if (UD_COMPLETED_SIGNATURE.length > 0) {
        const signature = UD_COMPLETED_SIGNATURE.pop();
        if (!signature) {
          throw new Error('message not signed');
        }
        this.signatures[message] = signature;
        return signature;
      }
      await sleep(500);
    }
    if (this.signatures[message]) {
      return this.signatures[message]!;
    }
    throw new Error('failed to sign message');
  }

  // signMessage supports a string arg or an account containing the message
  // that needs to be signed
  async signMessage(message: string | signMessageProps): Promise<string> {
    const signingMutexUnlock = await signingMutex.acquire();
    try {
      if (typeof message === 'string') {
        this.setMessage(message);
        return await this.waitForSignature(message);
      } else {
        this.setMessage(message.message);
        return await this.waitForSignature(message.message);
      }
    } catch (e) {
      notifyEvent(e, 'warning', 'Wallet', 'Signature');
      throw e;
    } finally {
      signingMutexUnlock();
    }
  }
}

// UD_COMPLETED_SIGNATURE is a constant to track the signed value of a message
export const UD_COMPLETED_SIGNATURE: (string | undefined)[] = [];
