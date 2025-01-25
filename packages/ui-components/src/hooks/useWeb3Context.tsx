import {useContext, useEffect} from 'react';

import config from '@unstoppabledomains/config';

import {isPinEnabled, isUnlocked, unlock} from '../lib';
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

        // bump the lock state to the future due to usage
        if (await isPinEnabled()) {
          const pin = await getPinFromToken(accessToken);
          await unlock(pin, config.WALLETS.DEFAULT_PIN_TIMEOUT_MS);
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
