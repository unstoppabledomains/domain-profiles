import type {DomainProfileTabType} from '../DomainProfile';

export type ManageTabProps = {
  address: string;
  domain: string;
  setButtonComponent: (c: React.ReactFragment) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate: (tab: DomainProfileTabType, data?: any) => void;
  onLoaded?: (isSuccess: boolean) => void;
};
