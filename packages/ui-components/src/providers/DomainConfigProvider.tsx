import React, {useState} from 'react';
import Animation from 'react-canvas-confetti/dist/presets/fireworks';

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
  showSuccessAnimation?: boolean;
  setShowSuccessAnimation?: SetBool;
}>({});

const DomainConfigProvider: React.FC<Props> = ({children}) => {
  const [isOpen, setIsOpen] = useState<boolean>();
  const [showSuccessAnimation, setShowSuccessAnimation] = useState<boolean>();
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
    showSuccessAnimation,
    setShowSuccessAnimation,
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
      {showSuccessAnimation && (
        <Animation autorun={{speed: 3, duration: 1500}} />
      )}
    </DomainConfigContext.Provider>
  );
};

export default DomainConfigProvider;
