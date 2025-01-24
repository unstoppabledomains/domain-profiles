import {useContext, useEffect} from 'react';

import {isPinEnabled, isUnlocked} from '../lib';
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

    // hide the modal if the session is still active
    if (accessToken) {
      setShowPinCta(false);
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
