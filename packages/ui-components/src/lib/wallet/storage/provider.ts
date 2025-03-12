import {
  clearWalletStorageData,
  getWalletStorageData,
  setWalletStorageData,
} from '../../../actions/walletStorageActions';

export class WalletStorageProvider {
  static async getItem(
    k: string,
    accountId: string,
    accessToken: string,
  ): Promise<string | null> {
    // retrieve wallet storage data
    const walletPreferences = await getWalletStorageData(
      accountId,
      accessToken,
    );
    if (!walletPreferences?.data) {
      return null;
    }

    // return the value for requested key if present
    const data: Record<string, string> = JSON.parse(walletPreferences.data);
    return data[k];
  }

  static async setItem(
    k: string,
    v: string,
    accountId: string,
    accessToken: string,
  ): Promise<void> {
    // retrieve wallet storage data
    const walletPreferences = await getWalletStorageData(
      accountId,
      accessToken,
    );

    // return the value for requested key if present
    const data: Record<string, string> = walletPreferences?.data
      ? JSON.parse(walletPreferences.data)
      : {};

    // update the value for requested key
    data[k] = v;

    // update wallet storage data
    await setWalletStorageData(data, accountId, accessToken);
  }

  static async removeItem(
    k: string,
    accountId: string,
    accessToken: string,
  ): Promise<void> {
    // retrieve wallet storage data
    const walletPreferences = await getWalletStorageData(
      accountId,
      accessToken,
    );
    if (!walletPreferences?.data) {
      return;
    }

    // remove the value for requested key
    const data: Record<string, string> = JSON.parse(walletPreferences.data);
    delete data[k];

    // update wallet storage data
    await setWalletStorageData(data, accountId, accessToken);
  }

  static async clear(accountId: string, accessToken: string): Promise<void> {
    await clearWalletStorageData(accountId, accessToken);
  }
}
