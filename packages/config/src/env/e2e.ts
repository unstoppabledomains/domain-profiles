import type {ConfigOverride} from './types';

export default function getE2eConfig(): ConfigOverride {
  return {
    APP_ENV: 'e2e',
  };
}
