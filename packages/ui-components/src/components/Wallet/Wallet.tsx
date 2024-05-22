import Box from '@mui/material/Box';
import type {Theme} from '@mui/material/styles';
import React from 'react';

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
    avatarUrl?: string;
    mode?: WalletMode;
  }
> = ({
  address,
  domain,
  avatarUrl,
  mode = 'basic',
  onUpdate,
  setButtonComponent,
}) => {
  const {classes} = useStyles();

  return (
    <Box className={classes.container}>
      <Header
        mode={mode}
        avatarUrl={avatarUrl}
        domain={isDomainValidForManagement(domain) ? domain : undefined}
      />
      <Configuration
        mode={mode}
        address={address}
        domain={domain}
        onUpdate={onUpdate}
        setButtonComponent={setButtonComponent}
      />
    </Box>
  );
};

export type WalletMode = 'basic' | 'portfolio';
