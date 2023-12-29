import {useContext} from 'react';

import {DomainConfigContext} from '../providers/DomainConfigProvider';

const useDomainConfig = () => {
  const {isOpen, setIsOpen, configTab, setConfigTab} =
    useContext(DomainConfigContext);
  if (!setIsOpen || !setConfigTab) {
    throw new Error(
      'Expected useDomainConfig to be called within <DomainConfigProvider />',
    );
  }
  return {
    isOpen,
    setIsOpen,
    configTab,
    setConfigTab,
  };
};

export default useDomainConfig;
