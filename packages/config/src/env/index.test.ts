import type {AppEnv} from './types';

const APP_ENVS: AppEnv[] = ['development', 'test', 'staging', 'production'];

describe('config', () => {
  const originalNextPublicAppEnv = process.env.NEXT_PUBLIC_APP_ENV;
  afterEach(() => {
    process.env.NEXT_PUBLIC_APP_ENV = originalNextPublicAppEnv;
  });
  afterEach(() => jest.resetModules());

  for (const appEnv of APP_ENVS) {
    it(`returns ${appEnv} config if NEXT_PUBLIC_APP_ENV=${appEnv}`, async () => {
      process.env.NEXT_PUBLIC_APP_ENV = appEnv;
      process.env.NEXT_PUBLIC_DEPLOYMENT =
        process.env.NEXT_PUBLIC_DEPLOYMENT ?? 'staging';
      const {default: config} = await import('.');
      expect(config.APP_ENV).toBe(appEnv);
    });
  }

  it('returns test config if NEXT_PUBLIC_APP_ENV unset, and NODE_ENV=test', async () => {
    delete process.env.NEXT_PUBLIC_APP_ENV;
    delete process.env.APP_ENV;
    process.env.NEXT_PUBLIC_DEPLOYMENT =
      process.env.NEXT_PUBLIC_DEPLOYMENT ?? 'staging';
    const {default: config} = await import('.');
    expect(config.APP_ENV).toBe('test');
  });
});
