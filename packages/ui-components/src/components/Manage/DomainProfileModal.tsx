import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {SerializedUserDomainProfileData} from '../../lib';
import type {DomainProfileTabType} from './DomainProfile';
import {DomainProfile} from './DomainProfile';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    minHeight: '100vh',
    maxWidth: '475px',
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    backgroundColor: theme.palette.white,
  },
}));

export const DomainProfileModal: React.FC<DomainProfileModalProps> = ({
  onClose,
  onUpdate,
  address,
  domain,
  open,
}) => {
  const {classes} = useStyles();

  return (
    <Dialog maxWidth="sm" open={open} onClose={() => onClose()}>
      <Box className={classes.container}>
        <DomainProfile address={address} domain={domain} onUpdate={onUpdate} />
      </Box>
    </Dialog>
  );
};

export type DomainProfileModalProps = {
  address: string;
  domain: string;
  open: boolean;
  onClose(): void;
  onUpdate(
    tab: DomainProfileTabType,
    data?: SerializedUserDomainProfileData,
  ): void;
};

export default DomainProfileModal;
