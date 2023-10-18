import type {ConfigOverride} from './types';

export default function getTestConfig(): ConfigOverride {
  return {
    APP_ENV: 'test',
  };
}
