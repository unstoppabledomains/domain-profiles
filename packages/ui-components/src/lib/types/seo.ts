import type {
  SerializedDomainProfileSocialAccountsUserInfo,
  SerializedPublicDomainProfileData,
} from './domain';

export const DEFAULT_SEO_DESCRIPTION =
  'Domain profiles give users a way to build a portable Web3 identity for their Unstoppable Domains.';
export type GetSeoTagsProps = {
  domain?: string;
  title: string;
  description?: string;
  profileData?: SerializedPublicDomainProfileData | null | undefined;
  socialsInfo?: SerializedDomainProfileSocialAccountsUserInfo;
  domainAvatar?: string | null;
  url?: string;
  twitterSite?: string;
};

export const UD_TWITTER_HANDLE = 'unstoppableweb';
export const UP_IO_TWITTER_HANDLE = 'upiowallet';
