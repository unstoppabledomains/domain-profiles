import type {Signer} from 'ethers';

export interface Web3Dependencies {
  address: string;
  signer: Signer;
}
