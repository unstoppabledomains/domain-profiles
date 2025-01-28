import React, {useEffect, useState} from 'react';
import {useLocalStorage, useSessionStorage} from 'usehooks-ts';

import {Modal} from '../components';
import UnlockPinModal from '../components/Wallet/UnlockPinModal';
import useChromeStorage, {
  isChromeStorageSupported,
} from '../hooks/useChromeStorage';
import type {CreateTransaction} from '../lib/types/fireBlocks';
import {FireblocksStateKey} from '../lib/types/fireBlocks';
import type {Web3Dependencies} from '../lib/types/web3';

type Props = {
  children: React.ReactNode;
};

export const Web3Context = React.createContext<{
  web3Deps?: Web3Dependencies;
  setWeb3Deps?: (v: Web3Dependencies | undefined) => void;
  accessToken?: string;
  setAccessToken?: (v: string) => void;
  messageToSign?: string;
  setMessageToSign?: (v: string) => void;
  showPinCta?: boolean;
  setShowPinCta?: (v: boolean) => void;
  txToSign?: CreateTransaction;
  setTxToSign?: (v?: CreateTransaction) => void;
  sessionKeyState?: Record<string, Record<string, string>>;
  setSessionKeyState?: (state: Record<string, Record<string, string>>) => void;
  persistentKeyState?: Record<string, Record<string, string>>;
  setPersistentKeyState?: (
    state: Record<string, Record<string, string>>,
  ) => void;
}>({});

const Web3ContextProvider: React.FC<Props> = ({children}) => {
  // used as common source for web3 deps
  const [web3Deps, setWeb3Deps] = useState<Web3Dependencies>();

  // used as common source for Unstoppable Wallet state
  const [accessToken, setAccessToken] = useState<string>();

  // standard storage parameters
  const [sessionKeyState, setSessionKeyState] = useSessionStorage<
    Record<string, Record<string, string>>
  >(FireblocksStateKey, {});
  const [persistentKeyState, setPersistentKeyState] = useLocalStorage<
    Record<string, Record<string, string>>
  >(FireblocksStateKey, {});

  // extension storage parameters
  const [isChromeExtension, setIsChromeExtension] = useState(false);
  const [chromeSessionKeyState, setChromeSessionKeyState] = useChromeStorage<
    Record<string, Record<string, string>>
  >(FireblocksStateKey, {}, 'session');
  const [chromePersistentKeyState, setChromePersistentKeyState] =
    useChromeStorage<Record<string, Record<string, string>>>(
      FireblocksStateKey,
      {},
      'local',
    );

  // signing parameters
  const [messageToSign, setMessageToSign] = useState<string>();
  const [txToSign, setTxToSign] = useState<CreateTransaction>();
  const [showPinCta, setShowPinCta] = useState<boolean>();

  // determine if chrome extension runtime
  useEffect(() => {
    try {
      if (isChromeStorageSupported('local')) {
        setIsChromeExtension(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const value = {
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
    sessionKeyState: isChromeExtension
      ? chromeSessionKeyState
      : sessionKeyState,
    setSessionKeyState: isChromeExtension
      ? setChromeSessionKeyState
      : setSessionKeyState,
    persistentKeyState: isChromeExtension
      ? chromePersistentKeyState
      : persistentKeyState,
    setPersistentKeyState: isChromeExtension
      ? setChromePersistentKeyState
      : setPersistentKeyState,
  };

  const handlePinComplete = () => {
    setShowPinCta(false);
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
      {showPinCta && (
        <Modal
          open={showPinCta}
          onClose={handlePinComplete}
          fullScreen={true}
          noModalHeader
          isConfirmation
        >
          <UnlockPinModal onSuccess={handlePinComplete} />
        </Modal>
      )}
    </Web3Context.Provider>
  );
};

export default Web3ContextProvider;
