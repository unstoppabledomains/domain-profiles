import type {ConfigOverride} from './types';

export default function getDevelopmentConfig(): ConfigOverride {
  return {
    APP_ENV: 'development',
    UD_ME_BASE_URL: 'http://localhost:3000',
    UP_IO_BASE_URL: 'http://localhost:3000',
    UNSTOPPABLE_WEBSITE_URL: 'http://localhost:3000',
    UNSTOPPABLE_API_URL: 'http://localhost:8080',
    MESSAGING: {
      HOST_URL: 'http://localhost:5003/api',
    },
    IDENTITY: {
      HOST_URL: 'http://localhost:5002/api',
    },
    LOGIN_WITH_UNSTOPPABLE: {
      CLIENT_ID: '00000000-0000-0000-0000-000000000000',
      REDIRECT_URI: process.env.NEXT_PUBLIC_CLIENT_URL,
    },
    PROFILE: {
      HOST_URL: 'http://localhost:5004/api',
    },
  };
}
