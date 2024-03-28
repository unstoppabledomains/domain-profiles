import type {IDeviceStore} from '../../../types/fireBlocks';

const LOCAL_MEMORY: Record<string, Record<string, string>> = {};

export class MemoryDeviceStoreProvider implements IDeviceStore {
  async get(deviceId: string, key: string): Promise<string | null> {
    if (!LOCAL_MEMORY[deviceId]) {
      return null;
    }
    if (!LOCAL_MEMORY[deviceId][key]) {
      return null;
    }
    return LOCAL_MEMORY[deviceId][key];
  }

  async set(deviceId: string, key: string, value: string): Promise<void> {
    if (!LOCAL_MEMORY[deviceId]) {
      LOCAL_MEMORY[deviceId] = {};
    }
    LOCAL_MEMORY[deviceId][key] = value;
  }

  async clear(deviceId: string, key: string): Promise<void> {
    if (!LOCAL_MEMORY[deviceId]?.[key]) {
      return;
    }
    delete LOCAL_MEMORY[deviceId][key];
  }

  async getAllKeys(deviceId: string): Promise<string[]> {
    if (!LOCAL_MEMORY[deviceId]) {
      return Promise.resolve([]);
    }
    return Object.keys(LOCAL_MEMORY[deviceId]);
  }
}
