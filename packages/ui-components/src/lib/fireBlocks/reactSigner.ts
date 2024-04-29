import {Mutex} from 'async-mutex';

import {notifyEvent} from '../error';
import {sleep} from '../sleep';
import type {signMessageProps} from '../wallet';

const signingMutex = new Mutex();

// ReactSigner implements the Ethers.js signing interface using react components
// to display and collect the required message signature
export class ReactSigner {
  address: string;
  signWithFireblocks?: (message: string, address?: string) => Promise<string>;
  setMessage?: (v: string) => void;
  signatures: Record<string, string | undefined> = {};

  // build an object that wraps a Wagmi WalletClient and a given address
  constructor(
    address: string,
    opts: {
      signWithFireblocks?: (
        message: string,
        address?: string,
      ) => Promise<string>;
      setMessage?: (v: string) => void;
    },
  ) {
    this.address = address;
    this.signWithFireblocks = opts?.signWithFireblocks;
    this.setMessage = opts?.setMessage;
  }

  // getAddress retrieves the address that will be creating the signature
  async getAddress(): Promise<string> {
    return this.address;
  }

  // signMessage supports a string arg or an account containing the message
  // that needs to be signed
  async signMessage(message: string | signMessageProps): Promise<string> {
    const signingMutexUnlock = await signingMutex.acquire();
    try {
      // clear any unhandled signatures
      UD_COMPLETED_SIGNATURE.length = 0;

      // extract the message that should be sign
      const messageToSign =
        typeof message === 'string' ? message : message.message;

      // use the requested signing approach
      return this.setMessage
        ? await this.promptAndWaitForSignature(messageToSign)
        : await this.submitForSignature(messageToSign);
    } catch (e) {
      notifyEvent(e, 'warning', 'Wallet', 'Signature');
      throw e;
    } finally {
      if (this.setMessage) {
        this.setMessage('');
      }
      signingMutexUnlock();
    }
  }

  async promptAndWaitForSignature(message: string): Promise<string> {
    // validate prerequisites
    if (!this.setMessage) {
      throw new Error('invalid react signer configuration');
    }

    // callback to initiate the signature prompt
    this.setMessage(message);

    // wait for the signature to be completed
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

  async submitForSignature(message: string): Promise<string> {
    // validate prerequisites
    if (!this.signWithFireblocks) {
      throw new Error('invalid fireblocks signer configuration');
    }
    return await this.signWithFireblocks(message, this.address);
  }
}

// UD_COMPLETED_SIGNATURE is a constant to track the signed value of a message
export const UD_COMPLETED_SIGNATURE: (string | undefined)[] = [];
