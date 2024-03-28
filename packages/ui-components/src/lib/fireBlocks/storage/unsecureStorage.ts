import type {IStorageProvider} from '@fireblocks/ncw-js-sdk';

import type {IDeviceStore} from '../../types/fireBlocks';

const KEY_PREFIX = 'UNSECURE_';

export class UnsecureKeyStorageProvider implements IStorageProvider {
  constructor(
    private readonly deviceId: string,
    private readonly storageProvider: IDeviceStore,
  ) {}

  async get(key: string): Promise<string | null> {
    key = this.getKey(key);
    const value = await this.storageProvider.get(this.deviceId, key);

    return value;
  }
  async set(key: string, value: string): Promise<void> {
    key = this.getKey(key);

    await this.storageProvider.set(this.deviceId, key, value);
  }
  async clear(key: string): Promise<void> {
    key = this.getKey(key);

    await this.storageProvider.clear(this.deviceId, key);
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
