import {useContext} from 'react';

import {Web3Context} from '../providers/Web3ContextProvider';

const useWeb3Context = () => {
  const {web3Deps, setWeb3Deps} = useContext(Web3Context);
  if (!setWeb3Deps) {
    throw new Error(
      'Expected useWeb3Context to be called within <Web3ContextProvider />',
    );
  }
  return {
    web3Deps,
    setWeb3Deps,
  };
};

export default useWeb3Context;
