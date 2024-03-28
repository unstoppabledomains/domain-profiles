import type {IDeviceStore} from '../../types/fireBlocks';
import type {MemoryDeviceStoreProvider} from './provider/memoryDeviceStore';
import type {ReactDeviceStoreProvider} from './provider/reactDeviceStore';

export class StorageFactoryProvider {
  constructor(
    private readonly memoryStoreProvider: MemoryDeviceStoreProvider,
    private readonly reactStoreProvider?: ReactDeviceStoreProvider,
  ) {}

  buildDeviceStorage(): IDeviceStore {
    return this.reactStoreProvider || this.memoryStoreProvider;
  }
}
