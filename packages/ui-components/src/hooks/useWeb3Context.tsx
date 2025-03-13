import {useContext} from 'react';
import useAsyncEffect from 'use-async-effect';

import config from '@unstoppabledomains/config';

import {getWalletStorageData} from '../actions/walletStorageActions';
import {localStorageWrapper} from '../components';
import {
  DomainProfileKeys,
  isLocked,
  isPinEnabled,
  lock,
  notifyEvent,
  unlock,
} from '../lib';
import {getPinFromToken} from '../lib/wallet/pin/store';
import {Web3Context} from '../providers/Web3ContextProvider';

const useWeb3Context = () => {
  const {
    web3Deps,
    setWeb3Deps,
    accessToken,
    setAccessToken,
    messageToSign,
    setMessageToSign,
    showPinCta,
    setShowPinCta,
    txToSign,
    setTxToSign,
    sessionKeyState,
    setSessionKeyState,
    persistentKeyState,
    setPersistentKeyState,
    txLockStatus,
    setTxLockStatus,
  } = useContext(Web3Context);

  if (
    !setWeb3Deps ||
    !setAccessToken ||
    !setMessageToSign ||
    !setShowPinCta ||
    !setTxToSign ||
    !setSessionKeyState ||
    !setPersistentKeyState ||
    !setTxLockStatus
  ) {
    throw new Error(
      'Expected useWeb3Context to be called within <Web3ContextProvider />',
    );
  }

  // timer to show the lock screen
  let lockScreenTimeout: NodeJS.Timeout;

  // check wallet PIN status
  useAsyncEffect(async () => {
    // return if modal is already visible
    if (showPinCta) {
      return;
    }

    // handle empty key state
    const isAnyState =
      (persistentKeyState && Object.keys(persistentKeyState).length > 0) ||
      (sessionKeyState && Object.keys(sessionKeyState).length > 0);
    if (!isAnyState) {
      setShowPinCta(false);
      return;
    }

    // handle access token present
    if (accessToken) {
      // hide the modal if the session is still active
      setShowPinCta(false);
      clearTimeout(lockScreenTimeout);

      // synchronize the encrypted PIN
      await synchronizeEncryptedPin();

      // check if session lock is enabled
      if (await isPinEnabled()) {
        // bump the lock state to the future due to usage
        const pin = await getPinFromToken(accessToken);
        const expirationTime = await unlock(
          pin,
          config.WALLETS.DEFAULT_PIN_TIMEOUT_MS,
        );

        // set timer to lock the screen
        lockScreenTimeout = setTimeout(
          handleLockScreen,
          expirationTime - Date.now(),
        );
      }
      return;
    }

    // check PIN state
    const checkPinState = async () => {
      if (await isLocked()) {
        // show the modal if unlock is required
        setShowPinCta(true);
        return;
      }

      // session is not locked
      setShowPinCta(false);
    };
    void checkPinState();
  }, [accessToken, persistentKeyState, sessionKeyState, showPinCta]);

  const synchronizeEncryptedPin = async () => {
    // access token is required
    if (!accessToken) {
      return;
    }

    try {
      // retrieve the encrypted PIN from remote wallet configuration
      const encryptedPin = await localStorageWrapper.getItem(
        DomainProfileKeys.EncryptedPIN,
        {
          type: 'wallet',
          accessToken,
        },
      );

      // synchronize the remote and local encrypted PIN configurations
      if (encryptedPin) {
        // set the local encrypted PIN to the one set remotely
        await localStorageWrapper.setItem(
          DomainProfileKeys.EncryptedPIN,
          encryptedPin,
        );
      } else {
        // TODO: this code can be removed in a future release once migration
        // has had an opportunity to complete

        // only sync local configuration if remote configuration is empty
        const walletConfig = await getWalletStorageData(accessToken);

        // set the remote encrypted PIN to the one set locally
        if (
          !walletConfig?.data ||
          Object.keys(JSON.parse(walletConfig.data)).length === 0
        ) {
          const localEncryptedPin = await localStorageWrapper.getItem(
            DomainProfileKeys.EncryptedPIN,
          );
          if (localEncryptedPin) {
            await localStorageWrapper.setItem(
              DomainProfileKeys.EncryptedPIN,
              localEncryptedPin,
              {
                type: 'wallet',
                accessToken,
              },
            );
          }
        }
      }
    } catch (e) {
      notifyEvent(e, 'warning', 'Wallet', 'Configuration');
    }
  };

  const handleLockScreen = async () => {
    if (!persistentKeyState) {
      return;
    }

    // show the lock screen and lock the session
    try {
      setShowPinCta(true);
      await lock(persistentKeyState, setPersistentKeyState);
    } catch (e) {
      notifyEvent(e, 'warning', 'Wallet', 'Configuration');
    }
  };

  return {
    web3Deps,
    setWeb3Deps,
    accessToken,
    setAccessToken,
    messageToSign,
    setMessageToSign,
    showPinCta,
    setShowPinCta,
    txToSign,
    setTxToSign,
    sessionKeyState,
    setSessionKeyState,
    persistentKeyState,
    setPersistentKeyState,
    txLockStatus,
    setTxLockStatus,
  };
};

export default useWeb3Context;
