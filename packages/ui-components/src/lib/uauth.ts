import UAuth from '@uauth/js';

import config from '@unstoppabledomains/config';

import {loadUnstoppableDomainsResolution} from './resolution/unstoppableDomainsResolution';

interface GetUAuthOptions {
  clientId?: string;
  redirectUri?: string;
  humanityCheck?: boolean;
}

let uauth: UAuth | null;
export async function getUAuth({
  clientId,
  redirectUri,
  humanityCheck,
}: GetUAuthOptions = {}): Promise<UAuth> {
  if (!uauth) {
    const udResolution = loadUnstoppableDomainsResolution();
    let fallbackIssuer =
      config.APP_ENV !== 'production'
        ? 'https://auth.ud-staging.com'
        : undefined;
    if (config.APP_ENV === 'development') {
      fallbackIssuer = 'https://localhost:4444';
    }

    uauth = new UAuth({
      clientID: clientId || config.LOGIN_WITH_UNSTOPPABLE.CLIENT_ID,
      redirectUri: redirectUri || config.LOGIN_WITH_UNSTOPPABLE.REDIRECT_URI,
      scope: humanityCheck ? 'openid humanity_check' : 'openid wallet',
      fallbackIssuer,
      resolution: udResolution,
    });
  }

  return uauth;
}
