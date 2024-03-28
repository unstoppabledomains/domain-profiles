import {notifyEvent} from '../error';
import {sleep} from '../sleep';
import type {signMessageProps} from '../wallet';

// ReactSigner implements the Ethers.js signing interface using react components
// to display and collect the required message signature
export class ReactSigner {
  address: string;
  setMessage: (v: string) => void;
  onClose?: () => void;

  // build an object that wraps a Wagmi WalletClient and a given address
  constructor(
    address: string,
    setMessage: (v: string) => void,
    onClose?: () => void,
  ) {
    this.address = address;
    this.setMessage = setMessage;
    this.onClose = onClose;
  }

  // getAddress retrieves the address that will be creating the signature
  async getAddress(): Promise<string> {
    return this.address;
  }

  async waitForSignature(): Promise<string> {
    while (true) {
      if (UD_COMPLETED_SIGNATURE.length > 0) {
        const signature = UD_COMPLETED_SIGNATURE.pop();
        if (!signature) {
          throw new Error('message not signed');
        }
        return signature;
      }
      await sleep(500);
    }
  }

  // signMessage supports a string arg or an account containing the message
  // that needs to be signed
  async signMessage(message: string | signMessageProps): Promise<string> {
    try {
      if (typeof message === 'string') {
        this.setMessage(message);
      } else {
        this.setMessage(message.message);
      }
      return await this.waitForSignature();
    } catch (e) {
      notifyEvent(e, 'warning', 'Wallet', 'Signature');
      throw e;
    } finally {
      if (this.onClose) {
        this.onClose();
      }
    }
  }
}

// UD_COMPLETED_SIGNATURE is a constant to track the signed value of a message
export const UD_COMPLETED_SIGNATURE: (string | undefined)[] = [];
