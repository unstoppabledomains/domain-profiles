import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileResolution} from '../../actions';
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
  const [resolvedAddress, setResolvedAddress] = useState(address);

  useEffect(() => {
    if (address) {
      return;
    }
    void loadResolvedAddress();
  }, [address]);

  const loadResolvedAddress = async () => {
    const resolution = await getProfileResolution(domain);
    if (resolution) {
      setResolvedAddress(resolution.address);
    }
  };

  return resolvedAddress ? (
    <Dialog maxWidth="sm" open={open} onClose={() => onClose()}>
      <Box className={classes.container}>
        <DomainProfile
          address={resolvedAddress}
          domain={domain}
          onUpdate={onUpdate}
        />
      </Box>
    </Dialog>
  ) : null;
};

export type DomainProfileModalProps = {
  address?: string;
  domain: string;
  open: boolean;
  onClose(): void;
  onUpdate(
    tab: DomainProfileTabType,
    data?: SerializedUserDomainProfileData,
  ): void;
};

export default DomainProfileModal;
