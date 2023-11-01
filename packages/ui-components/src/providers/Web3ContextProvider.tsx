import React, {useState} from 'react';

import type {Web3Dependencies} from '../lib/types/web3';

type Props = {
  children: React.ReactNode;
};

export const Web3Context = React.createContext<{
  web3Deps?: Web3Dependencies;
  setWeb3Deps?: (v: Web3Dependencies | undefined) => void;
}>({});

const Web3ContextProvider: React.FC<Props> = ({children}) => {
  const [web3Deps, setWeb3Deps] = useState<Web3Dependencies>();

  const value = {
    web3Deps,
    setWeb3Deps,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export default Web3ContextProvider;
