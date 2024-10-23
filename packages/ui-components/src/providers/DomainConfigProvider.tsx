import React, {useState} from 'react';

import {DomainProfileTabType} from '../components/Manage/common/types';
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
  const {web3Deps, messageToSign, setMessageToSign, txToSign, setTxToSign} =
    useWeb3Context();
  const [configTab, setConfigTab] = useState<DomainProfileTabType>(
    DomainProfileTabType.Profile,
  );

  const value = {
    isOpen,
    setIsOpen,
    configTab,
    setConfigTab,
  };

  // handleClose ensures the messages are cleared from queue
  const handleClose = () => {
    setMessageToSign('');
    setTxToSign(undefined);
  };

  // indicates that something is available for signing
  const isMessage = messageToSign || txToSign;

  return (
    <DomainConfigContext.Provider value={value}>
      {children}
      {web3Deps?.unstoppableWallet?.promptForSignatures && isMessage && (
        <AccessWalletModal
          prompt={false}
          address={web3Deps.address}
          open={true}
          onClose={handleClose}
          isMpcWallet={true}
          fullScreen={web3Deps.unstoppableWallet.fullScreenModal}
          hideHeader={web3Deps.unstoppableWallet.fullScreenModal}
        />
      )}
    </DomainConfigContext.Provider>
  );
};

export default DomainConfigProvider;
