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

  // in plain node.js, default to development if no env specified
  if (process.env.NODE_ENV) {
    return process.env.NODE_ENV as AppEnv;
  }
  return 'development';
}

function getEnvConfigOverrides(env?: AppEnv): ConfigOverride {
  const appEnv = env || getAppEnv();
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
      // default to development
      return getDevelopmentConfigOverrides();
  }
}

export function getConfig(env?: AppEnv): ImmutableConfig {
  return merge(getDefaultConfig(), getEnvConfigOverrides(env));
}

export default getConfig();
