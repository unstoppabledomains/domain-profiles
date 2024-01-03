import QueryString from 'qs';
import {useQuery} from 'react-query';

import config from '@unstoppabledomains/config';

import type {AddressResolution} from '../components/Chat/types';
import type {NftResponse} from '../lib';
import {NftPageSize} from '../lib';
import {fetchApi} from '../lib/fetchApi';
import type {
  DomainFieldTypes,
  ImageData,
  SerializedBulkDomainResponse,
  SerializedFollowerListData,
  SerializedProfileSearch,
  SerializedPublicDomainProfileData,
  SerializedUserDomainProfileData,
} from '../lib/types/domain';
import {DomainProfileSocialMedia} from '../lib/types/domain';

const queryKey = {
  followStatus: () => ['domainProfile', 'followingStatus'],
};

export const checkIfFollowingDomainProfile = async (
  followerDomain: string,
  followeeDomain: string,
): Promise<boolean> => {
  const respJson = await fetchApi(
    `/followers/${followeeDomain}/follow-status/${followerDomain}`,
    {
      method: 'GET',
      mode: 'cors',
      host: config.PROFILE.HOST_URL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  );
  return respJson.isFollowing;
};

export const followDomainProfile = async (
  followerDomain: string,
  followeeDomain: string,
  auth: {
    expires: string;
    signature: string;
  },
): Promise<void> => {
  await fetchApi(`/followers/${followeeDomain}`, {
    method: 'POST',
    mode: 'cors',
    host: config.PROFILE.HOST_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-auth-domain': followerDomain,
      'x-auth-expires': auth.expires,
      'x-auth-signature': auth.signature,
    },
    body: JSON.stringify({domain: followerDomain}),
  });
};

export const getDomainNfts = async (
  domain: string,
  symbols?: string,
  cursor?: string,
): Promise<Record<string, NftResponse> | undefined> => {
  const queryStringParams = QueryString.stringify({
    symbols,
    cursor,
    limit: NftPageSize,
  });
  const domainNftUrl = `/public/${domain}/nfts?${queryStringParams}`;
  return await fetchApi(domainNftUrl, {host: config.PROFILE.HOST_URL});
};

export const getFollowers = async (
  domain: string,
  relationship: 'followers' | 'following' = 'followers',
  cursor?: number,
): Promise<SerializedFollowerListData | undefined> => {
  const domainProfileUrl = `/followers/${domain}?${QueryString.stringify(
    {
      relationship_type: relationship,
      take: 100,
      cursor,
    },
    {skipNulls: true},
  )}`;
  return await fetchApi(domainProfileUrl, {host: config.PROFILE.HOST_URL});
};

export const getProfileData = async (
  domain: string,
  fields: DomainFieldTypes[],
  expiry?: number,
): Promise<SerializedPublicDomainProfileData | undefined> => {
  const domainProfileUrl = `/public/${domain}?${QueryString.stringify(
    {
      expiry,
      fields: fields ? fields.join(',') : undefined,
    },
    {encode: false},
  )}`;
  return await fetchApi(domainProfileUrl, {host: config.PROFILE.HOST_URL});
};

export const getProfileResolution = async (
  address: string,
): Promise<AddressResolution | undefined> => {
  return await fetchApi(`/resolve/${address}`, {
    host: config.PROFILE.HOST_URL,
  });
};

export const getProfileUserData = async (
  domain: string,
  fields: DomainFieldTypes[],
  signature: string,
  expiry: string,
): Promise<SerializedUserDomainProfileData> => {
  return await fetchApi(`/user/${domain}?fields=${fields.join(',')}`, {
    host: config.PROFILE.HOST_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-auth-domain': domain,
      'x-auth-expires': expiry,
      'x-auth-signature': signature,
    },
  });
};

export const searchProfiles = async (
  query: string,
): Promise<SerializedProfileSearch[]> => {
  const data = await fetchApi(
    `/search?name=${query}&include-suggestions=true&profile-required=true&reverse-resolution-required=false`,
    {
      host: config.PROFILE.HOST_URL,
    },
  );
  return data ? data : [];
};

export const setProfileUserData = async (
  domain: string,
  originalProfile: SerializedUserDomainProfileData,
  updatedProfile: SerializedUserDomainProfileData,
  signature: string,
  expiry: string,
  profileImage?: ImageData,
  coverImage?: ImageData,
  bulkUpdate?: boolean,
): Promise<SerializedBulkDomainResponse> => {
  const compareField = <T>(original?: T, updated?: T): T | undefined => {
    if (original !== updated) {
      return updated;
    }
    return undefined;
  };

  return await fetchApi<SerializedBulkDomainResponse>(`/user/domains`, {
    host: config.PROFILE.HOST_URL,
    method: 'POST',
    body: JSON.stringify({
      domains: bulkUpdate ? [] : [domain],
      profile: {
        // profile fields
        displayName: compareField(
          originalProfile.profile?.displayName,
          updatedProfile.profile?.displayName,
        ),
        description: compareField(
          originalProfile.profile?.description,
          updatedProfile.profile?.description,
        ),
        location: compareField(
          originalProfile.profile?.location,
          updatedProfile.profile?.location,
        ),
        web2Url: compareField(
          originalProfile.profile?.web2Url,
          updatedProfile.profile?.web2Url,
        ),
        imagePath:
          updatedProfile.profile?.imageType !== 'default'
            ? compareField(
                originalProfile.profile?.imagePath,
                updatedProfile.profile?.imagePath,
              )
            : undefined,
        coverPath: compareField(
          originalProfile.profile?.coverPath,
          updatedProfile.profile?.coverPath,
        ),
        privateEmail: compareField(
          originalProfile.profile?.privateEmail,
          updatedProfile.profile?.privateEmail,
        ),
        publicDomainSellerEmail: compareField(
          originalProfile.profile?.publicDomainSellerEmail,
          updatedProfile.profile?.publicDomainSellerEmail,
        ),

        // image fields
        data: {
          image: profileImage,
          cover: coverImage,
        },

        // social fields
        socialAccounts: updatedProfile.socialAccounts && {
          twitter: compareField(
            originalProfile.socialAccounts
              ? originalProfile.socialAccounts[DomainProfileSocialMedia.Twitter]
                  ?.location
              : '',
            updatedProfile.socialAccounts[DomainProfileSocialMedia.Twitter]
              ?.location,
          ),
          discord: compareField(
            originalProfile.socialAccounts
              ? originalProfile.socialAccounts[DomainProfileSocialMedia.Discord]
                  ?.location
              : '',
            updatedProfile.socialAccounts[DomainProfileSocialMedia.Discord]
              ?.location,
          ),
          youtube: compareField(
            originalProfile.socialAccounts
              ? originalProfile.socialAccounts[DomainProfileSocialMedia.YouTube]
                  ?.location
              : '',
            updatedProfile.socialAccounts[DomainProfileSocialMedia.YouTube]
              ?.location,
          ),
          reddit: compareField(
            originalProfile.socialAccounts
              ? originalProfile.socialAccounts[DomainProfileSocialMedia.Reddit]
                  ?.location
              : '',
            updatedProfile.socialAccounts[DomainProfileSocialMedia.Reddit]
              ?.location,
          ),
          telegram: compareField(
            originalProfile.socialAccounts
              ? originalProfile.socialAccounts[
                  DomainProfileSocialMedia.Telegram
                ]?.location
              : '',
            updatedProfile.socialAccounts[DomainProfileSocialMedia.Telegram]
              ?.location,
          ),
          linkedin: compareField(
            originalProfile.socialAccounts
              ? originalProfile.socialAccounts[
                  DomainProfileSocialMedia.Linkedin
                ]?.location
              : '',
            updatedProfile.socialAccounts[DomainProfileSocialMedia.Linkedin]
              ?.location,
          ),
          github: compareField(
            originalProfile.socialAccounts
              ? originalProfile.socialAccounts[DomainProfileSocialMedia.Github]
                  ?.location
              : '',
            updatedProfile.socialAccounts[DomainProfileSocialMedia.Github]
              ?.location,
          ),
        },

        // public toggles
        displayNamePublic: compareField(
          originalProfile.profile?.displayNamePublic,
          updatedProfile.profile?.displayNamePublic,
        ),
        descriptionPublic: compareField(
          originalProfile.profile?.descriptionPublic,
          updatedProfile.profile?.descriptionPublic,
        ),
        locationPublic: compareField(
          originalProfile.profile?.locationPublic,
          updatedProfile.profile?.locationPublic,
        ),
        web2UrlPublic: compareField(
          originalProfile.profile?.web2UrlPublic,
          updatedProfile.profile?.web2UrlPublic,
        ),
        imagePathPublic: true,
        coverPathPublic: true,

        // visibility toggles
        showDomainSuggestion: compareField(
          originalProfile.profile?.showDomainSuggestion,
          updatedProfile.profile?.showDomainSuggestion,
        ),
        showFeaturedCommunity: compareField(
          originalProfile.profile?.showFeaturedCommunity,
          updatedProfile.profile?.showFeaturedCommunity,
        ),
        showFeaturedPartner: compareField(
          originalProfile.profile?.showFeaturedPartner,
          updatedProfile.profile?.showFeaturedPartner,
        ),

        // email configuration flags
        messagingDisabled: compareField(
          originalProfile.messaging?.disabled,
          updatedProfile.messaging?.disabled,
        ),
        messagingRulesReset: compareField(
          originalProfile.messaging?.resetRules,
          updatedProfile.messaging?.resetRules,
        ),
        thirdPartyMessagingEnabled: compareField(
          originalProfile.messaging?.thirdPartyMessagingEnabled,
          updatedProfile.messaging?.thirdPartyMessagingEnabled,
        ),
        thirdPartyMessagingConfigType: compareField(
          originalProfile.messaging?.thirdPartyMessagingConfigType,
          updatedProfile.messaging?.thirdPartyMessagingConfigType,
        ),
      },
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-auth-domain': domain,
      'x-auth-expires': expiry,
      'x-auth-signature': signature,
    },
  });
};

export const unfollowDomainProfile = async (
  followerDomain: string,
  followeeDomain: string,
  auth: {
    expires: string;
    signature: string;
  },
): Promise<void> => {
  await fetchApi(`/followers/${followeeDomain}`, {
    method: 'DELETE',
    mode: 'cors',
    host: config.PROFILE.HOST_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-auth-domain': followerDomain,
      'x-auth-expires': auth.expires,
      'x-auth-signature': auth.signature,
    },
    body: JSON.stringify({domain: followerDomain}),
  });
};

export const useDomainProfileFollowStatus = (
  followerDomain: string,
  followeeDomain: string,
) => {
  return useQuery(
    queryKey.followStatus(),
    async (): Promise<{
      isFollowing: boolean;
      followerDomain: string;
      followeeDomain: string;
    }> => {
      const isFollowing = await checkIfFollowingDomainProfile(
        followerDomain,
        followeeDomain,
      );
      return {isFollowing, followerDomain, followeeDomain};
    },
    {
      enabled: !!followerDomain,
    },
  );
};
