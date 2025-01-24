import * as storage from '../../../components/Chat/storage';
import {createPIN} from './key';
import {isPinEnabled, isUnlocked, unlock} from './locker';
import {saveLockStatus} from './store';

describe('PIN locker', () => {
  beforeEach(() => {
    const testStorage: Record<string, string> = {};
    jest
      .spyOn(storage.localStorageWrapper, 'setItem')
      .mockImplementation(async (k: string, v: string) => {
        testStorage[k] = v;
      });
    jest
      .spyOn(storage.localStorageWrapper, 'getItem')
      .mockImplementation(async (k: string) => {
        return testStorage[k];
      });
  });

  it('should return true if PIN is enabled', async () => {
    await createPIN('1234');
    expect(await isPinEnabled()).toBeTruthy();
  });

  it('should return false if PIN is not enabled', async () => {
    expect(await isPinEnabled()).toBeFalsy();
  });

  it('should be unlocked if timestamp is valid', async () => {
    await createPIN('1234');
    const expirationTime = await unlock('1234', 10000);
    expect(expirationTime).toBeGreaterThan(Date.now());
    expect(await isUnlocked()).toBeTruthy();
  });

  it('should fail to unlock with incorrect PIN', async () => {
    await createPIN('1234');
    await expect(unlock('BAD_PIN', 10000)).rejects.toThrow('invalid PIN');
  });

  it('should be locked if timestamp is expired', async () => {
    await createPIN('1234');
    const expirationTime = await unlock('1234', -10000);
    expect(expirationTime).toBeLessThan(Date.now());
    expect(await isUnlocked()).toBeFalsy();
  });

  it('should be unlocked if proof is invalid', async () => {
    await createPIN('1234');
    await saveLockStatus({
      timestamp: Date.now() + 10000,
      proof:
        '5cqdkSXNZYKhxJrDFKRhCn1ZYxGJz4Sjwwo2CKRhwLGBfHXZTnhdVNn8RSmU649NFBPNb5QhxwAQeFegWcZ8jhmw',
    });
    expect(await isUnlocked()).toBeFalsy();
  });

  it('should be locked if there is no state', async () => {
    expect(await isUnlocked()).toBeFalsy();
  });
});
