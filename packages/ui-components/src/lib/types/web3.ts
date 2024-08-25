import type {Signer} from 'ethers';

export interface Web3Dependencies {
  address: string;
  signer: Signer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider?: any;
  unstoppableWallet?: {
    addresses: string[];
    promptForSignatures: boolean;
    fullScreenModal?: boolean;
    connectedApp?: {
      name: string;
      hostUrl: string;
      iconUrl: string;
    };
  };
}
