import cookie from 'react-cookies';

import config from '@unstoppabledomains/config';

export type CookieCategory = 'marketing' | 'analytics' | 'essential';

export type CookieName = 'NEXT_LOCALE' | 'cookie-consent';

type CookieOptions = {
  maxAge?: number;
  signed?: boolean;
  expires?: Date;
  httpOnly?: boolean;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
};

export const baseOptions: {
  path: CookieOptions['path'];
  sameSite?: CookieOptions['sameSite'];
  secure: CookieOptions['secure'];
} = {
  path: '/',
  sameSite: config.COOKIE.SAME_SITE,
  secure: config.COOKIE.SECURE,
};

export const getCookie = (name: CookieName) => {
  return cookie.load(name);
};

export const setCookie = ({
  name,
  value,
  options,
  category,
}: {
  name: CookieName;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  options?: CookieOptions;
  category: CookieCategory;
}): void => {
  // react-cookies uses cookie@0.3.1 which does not support SameSite=none in
  // cookies.  This support was added to the cookie package in version 0.4.x.
  // In the meantime removing the sameSite option is the same thing as
  // sameSite=none.  This only affects the staging environment which has the
  // sameSite app config set to "none".  Long term I see us move away from
  // react-cookies which doesn't seem to be receiving updates and has no
  // available github repo.
  if (baseOptions.sameSite === 'none') {
    delete baseOptions.sameSite;
  }
  const userConsentType = getCookie('cookie-consent');

  if (userConsentType === 'all' || category === 'essential') {
    cookie.save(name, value, {
      ...baseOptions,
      ...options,
    });
  }
};
