import * as storage from '../../../components/Chat/storage';
import {createPIN} from './key';
import {getKeypairFromPin, getKeypairFromToken, getPublicKey} from './store';

const mockAccountId = '1234567890';
const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2FwaS51bnN0b3BwYWJsZWRvbWFpbnMuY29tL2NsYWltcy90b2tlbi1wdXJwb3NlIjoiUkVGUkVTSCIsImh0dHBzOi8vYXBpLnVuc3RvcHBhYmxlZG9tYWlucy5jb20vY2xhaW1zL2FjY291bnQiOiJXQUxMRVRfVVNFUiIsImh0dHBzOi8vYXBpLnVuc3RvcHBhYmxlZG9tYWlucy5jb20vY2xhaW1zL2NvbnRleHQiOiJkY0ZmS081SmZtNC9tWmxCekJLZHpmankvODRlS214cndBaFNMYUNYQjByV1BuNTVhZDY0c2VnL1U1eGVURkhtYU1WMVRTa2RudTBaWGZmTkxNcy9ZZm9LQTZUb0ZiY2QzWUZRbmxxUWt4T2N6U3pNMWllTjVNVkIrbGVkdXI5S3lmdmk0ZUZ5NVl1MFcwVXozaGRoY2pWb3NCUWF4TmM5SFF0VWxBaHVObDgyVmJQbDBBV2VBMzY5R0ZDVnVWY3B6SjU2bEc3cHpUMlh1VUJ5bDVjRU1VZFhQS1FnYjZja2s5ekV0WHFnNWN6S2lxYVBocFdvenBGM3pjK1YyMFVMNW1IbjhjQmN4WENzNWZ6Um85cWhZSUU5SGorSG9INFIrbHZqejZIeUppKzlQR3hBcy9ObFkvYmNJbnV2MERwV0VqN0tkSjc1Uy9hRks5R3g4dDVTODlxS3F2eHk0VERLZVJHWnh1OUc4Wmc1TDdWWVJDUGNqTTMyWVZxQ3grRnJUL0JBM3ppLzhpbjJTSUsya2duTkFxbHFCbENtemVLTnBGTTZwbEFWNndKazFBUkxLOHgwNGhCTTZPTWlBMDJnMVpYTjQyRWl6UVpWbk5DdURadllnbExJMExHTnZUcnpmMU1UazVVWW92MkM1RkhpQktzcGlZUFY4OCt6em1yeHZFSkZnTEkzd1BWdmNrZkpQUHZrT2ltRjhJTkU1VDdDR3FjM0ZydVZrV1FLN0xta2pGbUxaOEErZklQVCtyRFlObEpmaG13Nnd6N1A3Q0lBazQ1SFd5U1BZUGJtUm5jYzVSUjR0d3JnNndSM3Vic0x4UUJhK2ZNMjJ0dUYrZXpWaTNvd0E4SEUvdTJTMzg2UHdjdGhjWXRJY1RqODVLVjg1SzM5RmhuWEJlVVQ2cEE0eThYTTRyS2RTTnlKUGxQanBiTURrSC84bEQraDY5a3dZVXZrSTN6SU5pZUpYbXhBZW1vQUFrdWFkN1Era1FiSEVqc0diUXhrZ3FmVkVlRDkzWUwvTGJjTXd3VGJoVWtXaU1rWE55VWFDVGx2aFZYK1MvaDRTZ3JLdkpkZmNxVFhxRVJ0SU0yeTFzaVF3ZEVjaTBONVBQc2lmM3k4Q1hTOG9DL3hLVUkwNUY4MWF4dGdPRm01Q2Via0p1cHZreUp5MFBBWGgrcE9LTGtOYmJMTEtxVlp5UGl4bUJGVnVyNThIWFpmQTJlNFR1MFZyL2dnL2g4Q3NyeC9sOWxYOTVnSTUra1c2WXRWK0xkaTVBSkpUVmlmTHRHdGpEa3dFZlVsV2VRaDhCVTgweUF3UXpNcXZ6dmFSdWVUOUd5SytoeTJyOVVQd2hKZnhVSVhqeTBWZGpjRytzSXNoODNpNFF5MFpZeTM5TlEwUGw3dlJ1dERXMk9OM05NU0RuN1FacFhvWkZkeHBEVHNFb3RzNDUyTzFhcEw1SEtoc0dWK1hoSVpRUFpER24wZFJOc0FmQ09IUnE4ZTdqTk44WEo0OE9yVFNKb1R2S3ZYNTY0K0lGZlE0WW81aWZCMDlHMU43OXlubTBBV1haL1hoa1J3YUR4dVVSdElBdkRVSGMyVkFJV2RVemR5RDNRYWxjZDhwY2hlUGNSSjl0aE95RkxoVnRHWXZJN1I3ekQrNDhJZm12bDM2Zm5UME9oREF2WCt1ZW4xQjAyamE2T3VzQjJQSUVZb0FDVy9QUW9RSC9hc3FSZDk1SjRKTGpkMUpJZEZhMkx5d1I4S3djbzZuTE5YMkJocTZSdW9ucEpSREg1eFVBM01mbDBPVFpLeVJTeTZQRE5COXlsR25ENktKWmg2UW5pdnFjZWkwRVMrV3Q2d1g1eTBjU0RvMmlZbHZpY1RGWDdiSmxRMUpBPT0iLCJpYXQiOjE3Mzc3NTc2MDgsImV4cCI6MTc2OTI5MzYwOCwiYXVkIjoiMzFjOTMzOWYtZWMyYy00NDIxLWJhYzAtMDRkYzRlYTRjZDdiIiwiaXNzIjoiaHR0cHM6Ly9hcGkudW5zdG9wcGFibGVkb21haW5zLmNvbSJ9.9yGyDwAlgiAPwK56bkQPXvqspNf0NdNFed_BNmg3SJw';

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
    const publicKey = await createPIN('1234', mockAccountId, mockToken);
    const retrievedKey = await getPublicKey();
    expect(publicKey).toEqual(retrievedKey?.toBase58());
  });

  it('should retrieve a private key with correct PIN', async () => {
    const publicKey = await createPIN('1234', mockAccountId, mockToken);
    const retrievedKey = await getKeypairFromPin('1234');
    expect(publicKey).toEqual(retrievedKey?.publicKey.toBase58());
    expect(retrievedKey.secretKey).toBeDefined();
  });

  it('should retrieve a private key with valid JWT', async () => {
    const publicKey = await createPIN('1234', mockAccountId, mockToken);
    const retrievedKey = await getKeypairFromToken(mockToken);
    expect(publicKey).toEqual(retrievedKey?.publicKey.toBase58());
    expect(retrievedKey.secretKey).toBeDefined();
  });

  it('should retrieve the same secret using PIN or JWT', async () => {
    const publicKey = await createPIN('1234', mockAccountId, mockToken);
    const retrievedKeyPin = await getKeypairFromPin('1234');
    const retrievedKeyToken = await getKeypairFromToken(mockToken);
    expect(publicKey).toEqual(retrievedKeyPin?.publicKey.toBase58());
    expect(retrievedKeyPin).toMatchObject(retrievedKeyToken);
  });

  it('should not retrieve a private key with incorrect correct PIN', async () => {
    const publicKey = await createPIN('1234', mockAccountId, mockToken);
    expect(publicKey).toBeDefined();
    await expect(getKeypairFromPin('BAD_PIN')).rejects.toThrow('invalid PIN');
  });
});
