import {useEffect, useState} from 'react';

const useChromeStorage = <T>(
  key: string,
  initialValue: T,
  type: 'local' | 'session' | 'sync' = 'session',
): [T, (state: T) => void] => {
  const [chromeStorageState, setChromeStorageState] = useState<T>(initialValue);

  // determine if chrome.storage is available
  useEffect(() => {
    if (!isSupported()) {
      return;
    }

    // populate initial values
    void reload();
  }, []);

  const isSupported = () => {
    if (chrome?.storage?.[type]) {
      return true;
    }
    return false;
  };

  const reload = async () => {
    const allStorage = await chrome.storage[type].get(key);
    if (allStorage[key]) {
      const objectState = JSON.parse(allStorage[key]);
      console.log(
        'AJQ retrieved chrome storage',
        JSON.stringify({key, type, objectState}),
      );
      setChromeStorageState(objectState);
    }
  };

  const setChromeStorage = async (v: T) => {
    // nothing to do if unsupported
    if (!isSupported()) {
      return;
    }

    // persist to chrome storage
    await chrome.storage[type].set({[key]: JSON.stringify(v)});

    console.log('AJQ saved chrome storage', JSON.stringify({key, type, v}));

    // reload the state value
    await reload();
  };

  return [chromeStorageState, setChromeStorage];
};

export default useChromeStorage;
