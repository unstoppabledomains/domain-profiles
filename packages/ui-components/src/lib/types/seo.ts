import type {
  SerializedPartialDomainProfileSocialAccountsUserInfo,
  SerializedPublicDomainProfileData,
} from './domain';

export const DEFAULT_SEO_DESCRIPTION =
  'Domain profiles give users a way to build a portable Web3 identity for their Unstoppable Domains.';
export type GetSeoTagsProps = {
  domain?: string;
  title: string;
  description?: string;
  profileData?: SerializedPublicDomainProfileData | null | undefined;
  socialsInfo?: SerializedPartialDomainProfileSocialAccountsUserInfo;
  domainAvatar?: string | null;
};

export const UD_TWITTER_HANDLE = 'unstoppableweb';
