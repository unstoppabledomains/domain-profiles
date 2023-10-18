import type UAuth from '@uauth/js';
import config from '@unstoppabledomains/config';

import Resolution from '@unstoppabledomains/resolution';

import {loadUnstoppableDomainsResolution} from './resolution/unstoppableDomainsLoader';

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
    const UAuth = (await import('@uauth/js')).default;
    const sourceConfig = await loadUnstoppableDomainsResolution();
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
      resolution: new Resolution({sourceConfig}),
    });
  }

  return uauth;
}
