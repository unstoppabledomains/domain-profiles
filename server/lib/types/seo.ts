import type {
  SerializedDomainProfileSocialAccountsUserInfo,
  SerializedPublicDomainProfileData,
} from './domain';

export const UD_TWITTER_HANDLE = 'unstoppableweb';
export const DEFAULT_SEO_DESCRIPTION =
  'Domain profiles give holders a way to associate extra pieces of metadata with their domains.';

export type GetSeoTagsProps = {
  domain: string;
  profileData: SerializedPublicDomainProfileData | null | undefined;
  socialsInfo: SerializedDomainProfileSocialAccountsUserInfo;
  domainAvatar?: string | null;
};
