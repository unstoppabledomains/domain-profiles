import QueryString from 'qs';
import {useQuery} from 'react-query';

import config from '@unstoppabledomains/config';

import type {AddressResolution} from '../components/Chat/types';
import type {NftResponse} from '../lib';
import {fetchApi} from '../lib/fetchApi';
import type {
  DomainFieldTypes,
  ImageData,
  SerializedFollowerListData,
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

export const searchProfiles = async (query: string): Promise<string[]> => {
  const data: Array<{name: string}> | undefined = await fetchApi(
    `/search?name=${query}`,
    {
      host: config.PROFILE.HOST_URL,
    },
  );
  return data ? data.map(profile => profile.name) : [];
};

export const setProfileUserData = async (
  domain: string,
  profileData: SerializedUserDomainProfileData,
  signature: string,
  expiry: string,
  profileImage?: ImageData,
  coverImage?: ImageData,
): Promise<void> => {
  await fetchApi(`/user/${domain}`, {
    host: config.PROFILE.HOST_URL,
    method: 'POST',
    body: JSON.stringify({
      // profile fields
      displayName: profileData.profile?.displayName,
      description: profileData.profile?.description,
      location: profileData.profile?.location,
      web2Url: profileData.profile?.web2Url,
      imagePath:
        profileData.profile?.imageType !== 'default' &&
        profileData.profile?.imagePath,
      coverPath: profileData.profile?.coverPath,
      privateEmail: profileData.profile?.privateEmail,

      // image fields
      data: {
        image: profileImage,
        cover: coverImage,
      },

      // social fields
      socialAccounts: profileData.socialAccounts && {
        twitter: profileData.socialAccounts[DomainProfileSocialMedia.Twitter],
        discord: profileData.socialAccounts[DomainProfileSocialMedia.Discord],
        youtube: profileData.socialAccounts[DomainProfileSocialMedia.YouTube],
        reddit: profileData.socialAccounts[DomainProfileSocialMedia.Reddit],
        telegram: profileData.socialAccounts[DomainProfileSocialMedia.Telegram],
        google: profileData.socialAccounts[DomainProfileSocialMedia.Google],
        linkedin: profileData.socialAccounts[DomainProfileSocialMedia.Linkedin],
        github: profileData.socialAccounts[DomainProfileSocialMedia.Github],
      },

      // public toggles
      displayNamePublic: profileData.profile?.displayNamePublic,
      descriptionPublic: profileData.profile?.descriptionPublic,
      locationPublic: profileData.profile?.locationPublic,
      web2UrlPublic: profileData.profile?.web2UrlPublic,
      imagePathPublic: true,
      coverPathPublic: true,

      // visibility toggles
      showDomainSuggestion: profileData.profile?.showDomainSuggestion,
      showFeaturedCommunity: profileData.profile?.showFeaturedCommunity,
      showFeaturedPartner: profileData.profile?.showFeaturedPartner,

      // email configuration flags
      messagingDisabled: profileData.messaging?.disabled,
      messagingRulesReset: profileData.messaging?.resetRules,
      thirdPartyMessagingEnabled:
        profileData.messaging?.thirdPartyMessagingEnabled,
      thirdPartyMessagingConfigType:
        profileData.messaging?.thirdPartyMessagingConfigType,
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
