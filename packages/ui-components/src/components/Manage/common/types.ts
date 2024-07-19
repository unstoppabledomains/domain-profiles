import type {DomainProfileTabType} from '../DomainProfile';

export type ManageTabProps = {
  address: string;
  domain: string;
  setButtonComponent: (c: React.ReactElement) => void;
  onUpdate: (
    tab: DomainProfileTabType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any,
  ) => void;
  onLoaded?: (isSuccess: boolean) => void;
};
