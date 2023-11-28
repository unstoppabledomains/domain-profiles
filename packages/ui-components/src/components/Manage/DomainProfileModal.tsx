import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import React from 'react';

import {DomainProfile} from './DomainProfile';

export const DomainProfileModal: React.FC<DomainProfileModalProps> = ({
  onClose,
  address,
  domain,
  open,
}) => {
  return (
    <Dialog maxWidth="lg" open={open} onClose={() => onClose()}>
      <DialogContent>
        <DomainProfile address={address} domain={domain} />
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
