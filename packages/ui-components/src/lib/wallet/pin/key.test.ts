import * as storage from '../../../components/Chat/storage';
import {createPIN} from './key';
import {getKeypair, getPublicKey} from './store';

describe('PIN key management', () => {
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

  it('should create and store a new public key', async () => {
    const publicKey = await createPIN('1234');
    const retrievedKey = await getPublicKey();
    expect(publicKey).toEqual(retrievedKey?.toBase58());
  });

  it('should retrieve a private key with correct PIN', async () => {
    const publicKey = await createPIN('1234');
    const retrievedKey = await getKeypair('1234');
    expect(publicKey).toEqual(retrievedKey?.publicKey.toBase58());
    expect(retrievedKey.secretKey).toBeDefined();
  });

  it('should not retrieve a private key with incorrect correct PIN', async () => {
    const publicKey = await createPIN('1234');
    expect(publicKey).toBeDefined();
    await expect(getKeypair('BAD_PIN')).rejects.toThrow('invalid PIN');
  });
});
