import {useContext, useEffect} from 'react';

import config from '@unstoppabledomains/config';

import {
  encrypt,
  getBootstrapState,
  isPinEnabled,
  isUnlocked,
  saveBootstrapState,
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
  } = useContext(Web3Context);

  if (
    !setWeb3Deps ||
    !setAccessToken ||
    !setMessageToSign ||
    !setShowPinCta ||
    !setTxToSign ||
    !setSessionKeyState ||
    !setPersistentKeyState
  ) {
    throw new Error(
      'Expected useWeb3Context to be called within <Web3ContextProvider />',
    );
  }

  // timer to show the lock screen
  let lockScreenTimeout: NodeJS.Timeout;

  // check wallet PIN status
  useEffect(() => {
    // return if modal is already visible
    if (showPinCta) {
      return;
    }

    // hide the modal if key state is empty
    const isAnyState =
      (persistentKeyState && Object.keys(persistentKeyState).length > 0) ||
      (sessionKeyState && Object.keys(sessionKeyState).length > 0);
    if (!isAnyState) {
      setShowPinCta(false);
      return;
    }

    // handle access token present
    if (accessToken) {
      const handleAccessToken = async () => {
        // hide the modal if the session is still active
        setShowPinCta(false);
        clearTimeout(lockScreenTimeout);

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
      };
      void handleAccessToken();
      return;
    }

    // check PIN state
    const checkPinState = async () => {
      // retrieve lock state
      const [pinEnabled, unlocked] = await Promise.all([
        isPinEnabled(),
        isUnlocked(),
      ]);

      // show the modal if unlock is required
      if (pinEnabled && !unlocked) {
        setShowPinCta(true);
        return;
      }
    };
    void checkPinState();
  }, [accessToken, persistentKeyState, sessionKeyState, showPinCta]);

  const handleLockScreen = async () => {
    if (!persistentKeyState) {
      return;
    }

    // retrieve and validate key state
    const clientState = getBootstrapState(persistentKeyState);
    if (!clientState?.refreshToken) {
      return;
    }

    // lock the wallet by encrypting the refresh token with user-defined PIN
    const pin = await getPinFromToken(clientState.refreshToken);
    clientState.lockedRefreshToken = encrypt(clientState.refreshToken, pin);
    clientState.refreshToken = '';

    // save the state with encrypted refresh token
    setShowPinCta(true);
    await saveBootstrapState(
      clientState,
      persistentKeyState,
      setPersistentKeyState,
    );
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
  };
};

export default useWeb3Context;
