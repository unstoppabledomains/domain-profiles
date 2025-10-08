import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {DOMAIN_LIST_PAGE_SIZE} from '../../actions';
import Modal from '../../components/Modal';
import {isDomainBasicListData, isDomainFullListData} from '../../lib';
import type {
  SerializedDomainBasicListData,
  SerializedDomainFullListData,
  SerializedDomainListEntry,
} from '../../lib';
import type {Web3Dependencies} from '../../lib/types/web3';
import DomainProfileList from './DomainProfileList';

const useStyles = makeStyles<{fullScreen?: boolean}>()(
  (theme: Theme, {fullScreen}) => ({
    titleStyle: {
      color: 'inherit',
      alignSelf: 'center',
    },
    contentContainer: {
      marginTop: theme.spacing(2),
      width: '100%',
      height: fullScreen ? '500px' : '350px',
    },
  }),
);

type ModalProps = {
  id: string;
  open: boolean;
  onClose: () => void;
  onClick?: (domain: string) => void;
  title: string;
  subtitle?: string;
  showNumber?: boolean;
  fullScreen?: boolean;
  retrieveDomains: (
    cursor?: number | string,
  ) => Promise<
    SerializedDomainFullListData | SerializedDomainBasicListData | undefined
  >;
  setWeb3Deps?: (value: Web3Dependencies | undefined) => void;
};

export const DomainListModal = (props: ModalProps) => {
  const {classes} = useStyles({fullScreen: props.fullScreen});
  const [domains, setDomains] = useState<SerializedDomainListEntry[]>([]);
  const [cursor, setCursor] = useState<number | string>();
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
    if (isDomainFullListData(resp)) {
      if (resp?.data && resp.data.length) {
        setDomains(d => [...d, ...resp.data]);
        setCursor(resp.meta.pagination.cursor);
        if (resp.data.length < DOMAIN_LIST_PAGE_SIZE) {
          setRetrievedAll(true);
        }
      } else {
        setRetrievedAll(true);
      }
    } else if (isDomainBasicListData(resp)) {
      if (resp?.domains && resp.domains.length) {
        setDomains(d => [...d, ...resp.domains.map(domain => ({domain}))]);
        setCursor(resp.cursor);
        if (resp.domains.length < DOMAIN_LIST_PAGE_SIZE) {
          setRetrievedAll(true);
        }
      } else {
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
      fullScreen={props.fullScreen}
      noContentPadding
    >
      {props.subtitle && (
        <Box display="flex" width="100%" justifyItems="left">
          <Typography variant="body2">{props.subtitle}</Typography>
        </Box>
      )}
      <div className={classes.contentContainer}>
        <DomainProfileList
          id={props.id}
          domains={domains}
          isLoading={isLoading}
          withInfiniteScroll={true}
          setWeb3Deps={props.setWeb3Deps}
          onLastPage={handleRetrieveDomains}
          hasMore={!retrievedAll}
          onClick={props.onClick}
        />
      </div>
    </Modal>
  );
};
