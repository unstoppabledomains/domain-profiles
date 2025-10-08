import {useContext} from 'react';

import {DomainConfigContext} from '../providers/DomainConfigProvider';

const useDomainConfig = () => {
  const {
    isOpen,
    setIsOpen,
    configTab,
    setConfigTab,
    showSuccessAnimation,
    setShowSuccessAnimation,
  } = useContext(DomainConfigContext);
  if (!setIsOpen || !setConfigTab || !setShowSuccessAnimation) {
    throw new Error(
      'Expected useDomainConfig to be called within <DomainConfigProvider />',
    );
  }
  return {
    isOpen,
    setIsOpen,
    configTab,
    setConfigTab,
    showSuccessAnimation,
    setShowSuccessAnimation,
  };
};

export default useDomainConfig;
