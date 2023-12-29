import React, {useState} from 'react';

import {DomainProfileTabType} from '../components';
import BaseProvider from './BaseProvider';

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
    <BaseProvider>
      <DomainConfigContext.Provider value={value}>
        {children}
      </DomainConfigContext.Provider>
    </BaseProvider>
  );
};

export default DomainConfigProvider;
