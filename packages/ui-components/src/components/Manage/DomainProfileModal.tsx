import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileData, getProfileReverseResolution} from '../../actions';
import type {SerializedUserDomainProfileData} from '../../lib';
import {DomainFieldTypes} from '../../lib';
import type {DomainProfileTabType} from './DomainProfile';
import {DomainProfile} from './DomainProfile';

const MODAL_WIDTH = '750px';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    minHeight: `calc(100vh - ${theme.spacing(8)})`,
    maxWidth: `calc(${MODAL_WIDTH} - ${theme.spacing(5)})`,
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    zIndex: 100,
  },
  modalFullScreen: {
    '& .MuiDialog-container .MuiDialog-paper': {
      margin: 0,
      width: '100%',
    },
  },
}));

export const DomainProfileModal: React.FC<DomainProfileModalProps> = ({
  onClose,
  onUpdate,
  address,
  domain,
  metadata,
  fullScreen,
  open,
}) => {
  const {classes, cx} = useStyles();
  const [resolvedAddress, setResolvedAddress] = useState(address);
  const [resolvedMetadata, setResolvedMetadata] = useState(metadata);

  useEffect(() => {
    if (address) {
      return;
    }
    void loadResolvedAddress();
  }, [address]);

  useEffect(() => {
    if (metadata) {
      return;
    }
    void loadMetadata();
  }, [metadata]);

  const loadMetadata = async () => {
    const domainRecords = await getProfileData(domain, [
      DomainFieldTypes.Records,
    ]);
    if (domainRecords?.metadata) {
      setResolvedMetadata({
        ...domainRecords.metadata,
      });
    }
  };

  const loadResolvedAddress = async () => {
    const resolution = await getProfileReverseResolution(domain);
    if (resolution) {
      setResolvedAddress(resolution.address);
    }
  };

  return resolvedAddress && resolvedMetadata ? (
    <Dialog
      maxWidth="lg"
      open={open}
      fullScreen={fullScreen}
      fullWidth={fullScreen}
      onClose={() => onClose()}
      className={cx({
        [classes.modalFullScreen]: fullScreen,
      })}
    >
      <Box className={classes.container}>
        <DomainProfile
          address={resolvedAddress}
          domain={domain}
          metadata={resolvedMetadata}
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
  metadata?: Record<string, string | boolean>;
  fullScreen?: boolean;
  onClose(): void;
  onUpdate(
    tab: DomainProfileTabType,
    data?: SerializedUserDomainProfileData,
  ): void;
};

export default DomainProfileModal;
