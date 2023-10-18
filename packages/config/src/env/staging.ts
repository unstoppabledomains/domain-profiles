import type {ConfigOverride} from './types';

export default function getStagingConfig(): ConfigOverride {
  return {
    APP_ENV: 'staging',
    UD_ME_BASE_URL: 'https://www.ud-staging.com/d',
    LOGIN_WITH_UNSTOPPABLE: {
      CLIENT_ID: '93d7efca-a5c6-409c-94b5-91adf1b33904',
      REDIRECT_URI: process.env.NEXT_PUBLIC_CLIENT_URL,
    },
  };
}
