import type {IDeviceStore} from '../../../types/fireBlocks';

export class ReactDeviceStoreProvider implements IDeviceStore {
  constructor(
    private readonly state: Record<string, Record<string, string>>,
    private readonly saveState: (
      state: Record<string, Record<string, string>>,
    ) => void | Promise<void>,
  ) {}

  async get(deviceId: string, key: string): Promise<string | null> {
    if (!this.state[deviceId]) {
      return null;
    }
    if (!this.state[deviceId][key]) {
      return null;
    }
    return this.state[deviceId][key];
  }

  async set(deviceId: string, key: string, value: string): Promise<void> {
    if (!this.state[deviceId]) {
      this.state[deviceId] = {};
    }
    this.state[deviceId][key] = value;
    await this.saveState({...this.state});
  }

  async clear(deviceId: string, key: string): Promise<void> {
    if (!this.state[deviceId]?.[key]) {
      return;
    }
    delete this.state[deviceId][key];
    await this.saveState({...this.state});
  }

  async getAllKeys(deviceId: string): Promise<string[]> {
    if (!this.state[deviceId]) {
      return Promise.resolve([]);
    }
    return Object.keys(this.state[deviceId]);
  }
}
