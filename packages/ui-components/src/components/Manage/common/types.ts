export enum DomainProfileTabType {
  Badges = 'badges',
  Crypto = 'crypto',
  Email = 'email',
  ListForSale = 'listForSale',
  Profile = 'profile',
  Reverse = 'reverse',
  TokenGallery = 'tokenGallery',
  Transfer = 'transfer',
  Wallet = 'wallet',
  Website = 'website',
  DNSRecords = 'DNSRecords',
}

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
