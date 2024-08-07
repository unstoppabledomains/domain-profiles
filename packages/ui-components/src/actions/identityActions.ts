import qs from 'qs';

import config from '@unstoppabledomains/config';

import {fetchApi} from '../lib/fetchApi';
import type {PersonaIdentity} from '../lib/types/persona';

interface GetIdentityOptions {
  name?: string;
  names?: Array<string>;
}

interface UseIdentityQueryOptions {
  names?: string;
  name?: string;
}

export const getHumanityCheckStatus = async (
  options: GetIdentityOptions | UseIdentityQueryOptions,
): Promise<PersonaIdentity | Record<string, PersonaIdentity>> => {
  return await fetchApi<PersonaIdentity | Record<string, PersonaIdentity>>(
    `/persona/identity/findBy?${qs.stringify(options)}`,
    {host: config.IDENTITY.HOST_URL},
  );
};
