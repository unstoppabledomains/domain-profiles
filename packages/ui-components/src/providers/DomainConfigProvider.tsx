import React, {useState} from 'react';

import {DomainProfileTabType} from '../components';

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
    </DomainConfigContext.Provider>
  );
};

export default DomainConfigProvider;
