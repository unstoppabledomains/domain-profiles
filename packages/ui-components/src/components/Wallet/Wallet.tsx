import Box from '@mui/material/Box';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {isDomainValidForManagement} from '../../lib';
import type {ManageTabProps} from '../Manage/common/types';
import {Configuration} from './Configuration';
import {Header} from './Header';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

export const Wallet: React.FC<
  ManageTabProps & {
    emailAddress?: string;
    avatarUrl?: string;
    recoveryToken?: string;
    showMessages?: boolean;
    mode?: WalletMode;
  }
> = ({
  emailAddress,
  address,
  domain,
  avatarUrl,
  recoveryToken,
  showMessages,
  mode = 'basic',
  onUpdate,
  setButtonComponent,
}) => {
  const {classes} = useStyles();
  const [isLoaded, setIsLoaded] = useState(false);

  const handleWalletLoaded = (v: boolean) => {
    setIsLoaded(v);
  };

  return (
    <Box className={classes.container}>
      <Header
        mode={mode}
        isLoaded={isLoaded}
        avatarUrl={avatarUrl}
        showMessages={showMessages}
        address={address}
        domain={isDomainValidForManagement(domain) ? domain : undefined}
      />
      <Configuration
        mode={mode}
        emailAddress={emailAddress}
        address={address}
        domain={domain}
        recoveryToken={recoveryToken}
        onLoaded={handleWalletLoaded}
        onUpdate={onUpdate}
        setButtonComponent={setButtonComponent}
      />
    </Box>
  );
};

export type WalletMode = 'basic' | 'portfolio';
