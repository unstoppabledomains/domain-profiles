import type {WalletClient} from 'wagmi';

interface signMessageProps {
  account: string;
  message: string;
}

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

  // signMessage supports a string arg or an account containing the message
  // that needs to be signed
  async signMessage(message: string | signMessageProps): Promise<string> {
    if (typeof message === 'string') {
      return await this.wallet.signMessage({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        account: this.address as any,
        message,
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.wallet.signMessage(message as any);
  }
}
