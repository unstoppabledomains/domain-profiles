import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileReverseResolution} from '../../actions';
import type {SerializedUserDomainProfileData} from '../../lib';
import type {DomainProfileTabType} from './DomainProfile';
import {DomainProfile} from './DomainProfile';

const MODAL_WIDTH = '550px';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    minHeight: `calc(100vh - ${theme.spacing(8)})`,
    maxWidth: `calc(${MODAL_WIDTH} - ${theme.spacing(5)})`,
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    backgroundColor: theme.palette.white,
    zIndex: 100,
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
    const resolution = await getProfileReverseResolution(domain);
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
          width={MODAL_WIDTH}
          onClose={onClose}
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
