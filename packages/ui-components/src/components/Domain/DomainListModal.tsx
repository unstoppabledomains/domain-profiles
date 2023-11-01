import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import Modal from '../../components/Modal';
import type {Web3Dependencies} from '../../lib/types/web3';
import DomainProfileList from './DomainProfileList';

const useStyles = makeStyles()((theme: Theme) => ({
  titleStyle: {
    color: 'inherit',
    alignSelf: 'center',
  },
  contentContainer: {
    marginTop: theme.spacing(2),
    width: '100%',
  },
}));

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  showNumber?: boolean;
  retrieveDomains: (
    cursor?: number,
  ) => Promise<{domains: string[]; cursor?: number}>;
  setWeb3Deps?: (value: Web3Dependencies | undefined) => void;
};

export const DomainListModal = (props: ModalProps) => {
  const {classes} = useStyles();
  const [domains, setDomains] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [retrievedAll, setRetrievedAll] = useState(false);

  useEffect(() => {
    if (props.open) {
      // retrieve initial list of domains on open
      void handleRetrieveDomains();
    } else {
      // clear domain state on close
      setDomains([]);
      setRetrievedAll(false);
      setCursor(undefined);
    }
  }, [props.open]);

  const handleRetrieveDomains = async () => {
    if (retrievedAll) {
      return;
    }
    setIsLoading(true);
    const resp = await props.retrieveDomains(cursor);
    if (resp.domains.length) {
      setDomains(d => [...d, ...resp.domains]);
      setCursor(resp.cursor);
      if (resp.domains.length < 100) {
        setRetrievedAll(true);
      }
    }
    setIsLoading(false);
  };

  return (
    <Modal
      title={props.title}
      open={props.open}
      onClose={props.onClose}
      titleStyle={classes.titleStyle}
      noContentPadding
    >
      <div className={classes.contentContainer}>
        <DomainProfileList
          domains={domains}
          isLoading={isLoading}
          withPagination
          showNumber={props.showNumber}
          setWeb3Deps={props.setWeb3Deps}
          onLastPage={handleRetrieveDomains}
        />
      </div>
    </Modal>
  );
};
