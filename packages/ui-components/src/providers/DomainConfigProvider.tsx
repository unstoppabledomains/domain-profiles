import React, {useState} from 'react';

import {DomainProfileTabType} from '../components';
import {AccessWalletModal} from '../components/Wallet/AccessWallet';
import {useWeb3Context} from '../hooks';

type Props = {
  children: React.ReactNode;
};

type SetBool = (s?: boolean) => void;
type SetTab = (t: DomainProfileTabType) => void;

export const DomainConfigContext = React.createContext<{
  setIsOpen?: SetBool;
  isOpen?: boolean;
  setConfigTab?: SetTab;
  configTab?: string;
}>({});

const DomainConfigProvider: React.FC<Props> = ({children}) => {
  const [isOpen, setIsOpen] = useState<boolean>();
  const {web3Deps, messageToSign, setMessageToSign} = useWeb3Context();
  const [configTab, setConfigTab] = useState<DomainProfileTabType>(
    DomainProfileTabType.Profile,
  );

  const value = {
    isOpen,
    setIsOpen,
    configTab,
    setConfigTab,
  };

  return (
    <DomainConfigContext.Provider value={value}>
      {children}
      {web3Deps?.unstoppableWallet?.promptForSignatures && messageToSign && (
        <AccessWalletModal
          prompt={true}
          address={web3Deps.address}
          open={true}
          onClose={() => setMessageToSign('')}
        />
      )}
    </DomainConfigContext.Provider>
  );
};

export default DomainConfigProvider;
