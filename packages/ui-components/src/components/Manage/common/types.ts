import type {SerializedUserDomainProfileData} from '../../../lib';
import type {DomainProfileTabType} from '../DomainProfile';

export type ManageTabProps = {
  address: string;
  domain: string;
  setButtonComponent: (c: React.ReactFragment) => void;
  onUpdate: (
    tab: DomainProfileTabType,
    data?: SerializedUserDomainProfileData,
  ) => void;
};
