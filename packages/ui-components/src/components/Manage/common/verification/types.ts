import type {Web3Dependencies} from '../../../../lib';

export type VerificationProps = {
  ownerAddress: string;
  address: string;
  currency: string;
  domain: string;
  setVerified: React.Dispatch<React.SetStateAction<string>>;
  setWeb3Deps: (value: Web3Dependencies | undefined) => void;
};
