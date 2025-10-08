import Box from '@mui/material/Box';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileData, getProfileReverseResolution} from '../../actions';
import type {SerializedUserDomainProfileData} from '../../lib';
import {DomainFieldTypes} from '../../lib';
import Modal from '../Modal';
import type {DomainProfileTabType} from './DomainProfile';
import {DomainProfile} from './DomainProfile';

const MODAL_WIDTH = '750px';

const useStyles = makeStyles<{fullScreen?: boolean}>()(
  (theme: Theme, {fullScreen}) => ({
    container: {
      display: 'flex',
      marginTop: theme.spacing(-3),
      height: fullScreen ? `calc(100vh)` : `calc(100vh - ${theme.spacing(7)})`,
      backgroundColor: theme.palette.background.paper,
      zIndex: 100,
    },
  }),
);

export const DomainProfileModal: React.FC<DomainProfileModalProps> = ({
  onClose,
  onUpdate,
  address,
  domain,
  metadata,
  fullScreen,
  open,
}) => {
  const {classes} = useStyles({fullScreen});
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
    <Modal
      maxWidth="lg"
      open={open}
      fullScreen={fullScreen}
      onClose={onClose}
      noModalHeader={true}
      noContentPadding={true}
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
    </Modal>
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
