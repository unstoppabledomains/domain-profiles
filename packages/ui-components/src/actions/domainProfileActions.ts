import QueryString from 'qs';
import {useQuery} from 'react-query';

import config from '@unstoppabledomains/config';

import type {AddressResolution} from '../components/Chat/types';
import type {NftResponse} from '../lib';
import {fetchApi} from '../lib/fetchApi';
import type {
  DomainFieldTypes,
  SerializedFollowerListData,
  SerializedPublicDomainProfileData,
} from '../lib/types/domain';

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
  const domainProfileUrl = `/public/${domain}?${QueryString.stringify({
    expiry,
    fields: fields ? fields.join(',') : undefined,
  })}`;
  return await fetchApi(domainProfileUrl, {host: config.PROFILE.HOST_URL});
};

export const getProfileResolution = async (
  address: string,
): Promise<AddressResolution | undefined> => {
  return await fetchApi(`/resolve/${address}`, {
    host: config.PROFILE.HOST_URL,
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
