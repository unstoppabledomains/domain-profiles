import type {
  ISecureStorageProvider,
  TReleaseSecureStorageCallback,
} from '@fireblocks/ncw-js-sdk';
import {decryptAesGCM, encryptAesGCM} from '@fireblocks/ncw-js-sdk';

import type {IDeviceStore} from '../../types/fireBlocks';

const KEY_PREFIX = 'SECURE_';

export class SecureKeyStorageProvider implements ISecureStorageProvider {
  private encKey: string | null = null;

  constructor(
    private readonly deviceId: string,
    private readonly storageProvider: IDeviceStore,
    private readonly pin?: string,
  ) {
    this.encKey = this.pin || deviceId;
  }

  async getAccess(): Promise<TReleaseSecureStorageCallback> {
    return async () => {
      await this.release();
    };
  }

  async get(key: string): Promise<string | null> {
    key = this.getKey(key);

    if (!this.encKey) {
      throw new Error('Storage locked');
    }

    const value = await this.storageProvider.get(this.deviceId, key);

    if (!value) {
      return null;
    }

    const decryptedData = await decryptAesGCM(
      value,
      this.encKey,
      this.deviceId,
    );

    return decryptedData;
  }

  async set(key: string, data: string): Promise<void> {
    key = this.getKey(key);

    if (!this.encKey) {
      throw new Error('Storage locked');
    }

    // encrypt the value. use the device id as the salt
    const encryptedData = await encryptAesGCM(data, this.encKey, this.deviceId);

    await this.storageProvider.set(this.deviceId, key, encryptedData);
  }

  async clear(key: string): Promise<void> {
    key = this.getKey(key);

    await this.storageProvider.clear(this.deviceId, key);
  }

  private async release(): Promise<void> {
    this.encKey = null;
  }

  async getAllKeys(): Promise<string[]> {
    const keys = await this.storageProvider.getAllKeys(this.deviceId);
    const filteredKeys = keys
      .filter(k => k.startsWith(KEY_PREFIX))
      .map(k => k.substring(KEY_PREFIX.length));

    return filteredKeys;
  }

  private getKey(key: string): string {
    return KEY_PREFIX + key;
  }
}
