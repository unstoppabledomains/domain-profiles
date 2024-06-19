import qs from 'qs';

import config from '@unstoppabledomains/config';

import {fetchApi} from '../lib/fetchApi';
import type {
  SerializedIdentityResponse,
  SerializedOtpResponse,
} from '../lib/types/identity';
import type {PersonaIdentity} from '../lib/types/persona';

interface GetIdentityOptions {
  name?: string;
  names?: Array<string>;
}

interface UseIdentityQueryOptions {
  names?: string;
  name?: string;
}

export const createIdentity = async (
  identity: string,
  accessToken: string,
): Promise<SerializedIdentityResponse | undefined> => {
  return await fetchApi<SerializedIdentityResponse>(`/user/identity/wallet`, {
    method: 'POST',
    mode: 'cors',
    host: config.PROFILE.HOST_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: accessToken,
      'x-auth-subject': identity,
    },
  });
};

export const getHumanityCheckStatus = async (
  options: GetIdentityOptions | UseIdentityQueryOptions,
): Promise<PersonaIdentity | Record<string, PersonaIdentity>> => {
  return await fetchApi<PersonaIdentity | Record<string, PersonaIdentity>>(
    `/persona/identity/findBy?${qs.stringify(options)}`,
    {host: config.IDENTITY.HOST_URL},
  );
};

export const getIdentity = async (
  identity: string,
  accessToken: string,
): Promise<SerializedIdentityResponse | undefined> => {
  return await fetchApi<SerializedIdentityResponse>(`/user/identity`, {
    method: 'GET',
    mode: 'cors',
    host: config.PROFILE.HOST_URL,
    headers: {
      Authorization: accessToken,
      'x-auth-subject': identity,
    },
  });
};

export const saveIdentity = async (
  identity: string,
  accessToken: string,
  records?: Record<string, string>,
): Promise<SerializedIdentityResponse | undefined> => {
  return await fetchApi<SerializedIdentityResponse>(`/user/identity`, {
    method: 'POST',
    mode: 'cors',
    host: config.PROFILE.HOST_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: accessToken,
      'x-auth-subject': identity,
    },
    body: records ? JSON.stringify({records}) : undefined,
  });
};

export const sendOneTimeCode = async (
  account: string,
  type: 'email' | 'phone',
): Promise<SerializedOtpResponse> => {
  return await fetchApi(`/user/otp`, {
    method: 'POST',
    mode: 'cors',
    host: config.PROFILE.HOST_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({account, type}),
  });
};

export const verifyOneTimeCode = async (
  account: string,
  type: 'email' | 'phone',
  otp: string,
): Promise<string | undefined> => {
  const jwtResponse = await fetchApi(`/user/otp/verify`, {
    method: 'POST',
    mode: 'cors',
    host: config.PROFILE.HOST_URL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({account, type, otp}),
  });
  if (jwtResponse?.accessToken) {
    return jwtResponse.accessToken;
  }
  return;
};
