import type {ConfigOverride} from './types';

export default function getStagingConfig(): ConfigOverride {
  return {
    APP_ENV: 'staging',
    UD_ME_BASE_URL: 'https://www.ud-me-staging.com',
    LOGIN_WITH_UNSTOPPABLE: {
      CLIENT_ID: '65637020-9d14-4d7d-880b-6a5c497d9540',
      REDIRECT_URI: 'https://domain-profiles-vf5eblhuka-uc.a.run.app',
    },
  };
}
