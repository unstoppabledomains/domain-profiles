import merge from 'lodash/merge';

import getDefaultConfig from './default';
import getDevelopmentConfigOverrides from './development';
import getE2eConfigOverrides from './e2e';
import getProductionConfigOverrides from './production';
import getStagingConfigOverrides from './staging';
import getTestConfigOverrides from './testing';
import type {AppEnv, ConfigOverride, ImmutableConfig} from './types';

function getAppEnv(): AppEnv {
  // APP_ENV translated to NEXT_PUBLIC_APP_ENV in .env file for NextJS to expose to the browser.
  // https://nextjs.org/docs/basic-features/environment-variables
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
  if (
    appEnv === 'development' ||
    appEnv === 'test' ||
    appEnv === 'e2e' ||
    appEnv === 'staging' ||
    appEnv === 'production'
  ) {
    return appEnv;
  }
  // To support Jest plugins (e.g. for Jest VSCode extension running tests in the background)
  // https://jestjs.io/docs/environment-variables
  if (process.env.NODE_ENV === 'test') {
    return 'test';
  }
  throw new Error(
    'APP_ENV must be set to development, test, e2e, staging, or production',
  );
}

function getEnvConfigOverrides(): ConfigOverride {
  const appEnv = getAppEnv();
  switch (appEnv) {
    case 'development':
      return getDevelopmentConfigOverrides();
    case 'test':
      return getTestConfigOverrides();
    case 'e2e':
      return getE2eConfigOverrides();
    case 'staging':
      return getStagingConfigOverrides();
    case 'production':
      return getProductionConfigOverrides();
    default:
      throw new Error(`Unexpected APP_ENV "${appEnv}"`);
  }
}

function getConfig(): ImmutableConfig {
  return merge(getDefaultConfig(), getEnvConfigOverrides());
}

export default getConfig();
