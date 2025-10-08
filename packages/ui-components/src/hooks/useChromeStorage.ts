import {useEffect, useState} from 'react';

import {notifyEvent} from '../lib/error';

export type ChromeStorageType = 'local' | 'session' | 'sync';

export const isChromeStorageSupported = (type: ChromeStorageType) => {
  try {
    if (chrome?.storage?.[type]) {
      return true;
    }
  } catch (e) {
    // ignore
  }
  return false;
};

export const isChromeStorageType = (
  type: string,
): type is ChromeStorageType => {
  return ['local', 'session', 'sync'].includes(type);
};

const useChromeStorage = <T>(
  key: string,
  initialValue: T,
  type: ChromeStorageType = 'session',
): [T, (state: T) => void] => {
  const [chromeStorageState, setChromeStorageState] = useState<T>(initialValue);

  // determine if chrome.storage is available
  useEffect(() => {
    if (!isChromeStorageSupported(type)) {
      return;
    }

    // initialize the data managed by the hook
    const initialize = async () => {
      await migrate();
      await reload();
    };
    void initialize();
  }, []);

  const migrate = async () => {
    try {
      const existingValueStr =
        type === 'local'
          ? localStorage.getItem(key)
          : sessionStorage.getItem(key);
      if (!existingValueStr) {
        return;
      }
      const existingValue = JSON.parse(existingValueStr);
      if (!existingValue) {
        return;
      }

      // store existing data in chrome.storage
      await setChromeStorage(existingValue);

      // remove existing data
      if (type === 'local') {
        localStorage.removeItem(key);
        return;
      }
      sessionStorage.removeItem(key);
    } catch (e) {
      notifyEvent(e, 'error', 'Wallet', 'Configuration', {
        msg: 'error migrating to chrome storage',
        meta: {key, type},
      });
    }
  };

  const reload = async () => {
    // load chrome storage data data
    const allStorage = await chrome.storage[type].get(key);
    if (allStorage[key]) {
      try {
        setChromeStorageState(JSON.parse(allStorage[key]));
      } catch (e) {
        notifyEvent(e, 'error', 'Wallet', 'Configuration', {
          msg: 'error loading chrome storage',
          meta: {key, type},
        });
      }
    }
  };

  const setChromeStorage = async (v: T) => {
    try {
      // nothing to do if unsupported
      if (!isChromeStorageSupported(type)) {
        return;
      }

      // persist to chrome storage
      await chrome.storage[type].set({[key]: JSON.stringify(v)});

      // reload the state value
      await reload();
    } catch (e) {
      notifyEvent(e, 'error', 'Wallet', 'Configuration', {
        msg: 'error saving chrome storage',
        meta: {key, type},
      });
    }
  };

  return [chromeStorageState, setChromeStorage];
};

export default useChromeStorage;
