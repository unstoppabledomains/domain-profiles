import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {DomainProfile} from './DomainProfile';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    minHeight: '90vh',
    maxWidth: '475px',
  },
}));

export const DomainProfileModal: React.FC<DomainProfileModalProps> = ({
  onClose,
  address,
  domain,
  open,
}) => {
  const {classes} = useStyles();

  return (
    <Dialog maxWidth="sm" open={open} onClose={() => onClose()}>
      <DialogContent>
        <Box className={classes.container}>
          <DomainProfile address={address} domain={domain} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export type DomainProfileModalProps = {
  address: string;
  domain: string;
  open: boolean;
  onClose(): void;
};

export default DomainProfileModal;
