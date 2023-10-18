import {fetchApi} from 'lib/fetchApi';
import type {PersonaIdentity} from 'lib/types/persona';
import qs from 'qs';

import config from '@unstoppabledomains/config';

interface GetIdentityOptions {
  name?: string;
  names?: Array<string>;
}

interface UseIdentityQueryOptions {
  names?: string;
  name?: string;
}

export const getIdentity = async (
  options: GetIdentityOptions | UseIdentityQueryOptions,
): Promise<PersonaIdentity | Record<string, PersonaIdentity>> => {
  return await fetchApi<PersonaIdentity | Record<string, PersonaIdentity>>(
    `/api/persona/identity/findBy?${qs.stringify(options)}`,
    {host: config.IDENTITY.HOST_URL},
  );
};
