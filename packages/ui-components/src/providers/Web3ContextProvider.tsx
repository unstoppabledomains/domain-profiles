import React, {useState} from 'react';
import {useLocalStorage, useSessionStorage} from 'usehooks-ts';

import type {CreateTransaction} from '../lib/types/fireBlocks';
import { FireblocksStateKey} from '../lib/types/fireBlocks';
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
  const [sessionKeyState, setSessionKeyState] = useSessionStorage<
    Record<string, Record<string, string>>
  >(FireblocksStateKey, {});
  const [persistentKeyState, setPersistentKeyState] = useLocalStorage<
    Record<string, Record<string, string>>
  >(FireblocksStateKey, {});
  const [messageToSign, setMessageToSign] = useState<string>();
  const [txToSign, setTxToSign] = useState<CreateTransaction>();

  const value = {
    web3Deps,
    setWeb3Deps,
    accessToken,
    setAccessToken,
    messageToSign,
    setMessageToSign,
    txToSign,
    setTxToSign,
    sessionKeyState,
    setSessionKeyState,
    persistentKeyState,
    setPersistentKeyState,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export default Web3ContextProvider;
