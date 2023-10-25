import type {ConfigOverride} from './types';

export default function getStagingConfig(): ConfigOverride {
  return {
    APP_ENV: 'staging',
    LOGIN_WITH_UNSTOPPABLE: {
      CLIENT_ID: '65637020-9d14-4d7d-880b-6a5c497d9540',
      REDIRECT_URI: 'https://staging.ud.me',
    },
  };
}
