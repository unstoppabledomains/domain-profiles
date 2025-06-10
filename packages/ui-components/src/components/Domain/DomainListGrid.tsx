import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {DOMAIN_LIST_PAGE_SIZE} from '../../actions';
import {useTranslationContext} from '../../lib';
import DomainProfileList from './DomainProfileList';

const useStyles = makeStyles()((theme: Theme) => ({
  contentContainer: {
    marginTop: theme.spacing(2),
  },
  headerContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  headerText: {
    display: 'flex',
    alignItems: 'center',
    verticalAlign: 'center',
    textAlign: 'center',
    paddingBottom: theme.spacing(1),
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.h5.fontSize,
    margin: theme.spacing(6, 0, 0),
    lineHeight: 1.4,
  },
  headerIcon: {
    color: theme.palette.getContrastText(theme.palette.background.default),
    marginRight: theme.spacing(1),
  },
  domainCount: {
    color: theme.palette.wallet.text.primary,
    marginLeft: theme.spacing(1),
  },
  emptyPortfolio: {
    color: theme.palette.text.secondary,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing(2),
  },
  emptyIcon: {
    color: theme.palette.text.secondary,
    fontSize: theme.typography.h3.fontSize,
  },
}));

type GridProps = {
  id: string;
  title: string;
  totalCount?: number;
  retrieveDomains: (
    cursor?: number | string,
  ) => Promise<{domains: string[]; cursor?: number | string}>;
};

export const DomainListGrid = (props: GridProps) => {
  const [t] = useTranslationContext();
  const {classes} = useStyles();
  const [domains, setDomains] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | string>();
  const [isLoading, setIsLoading] = useState(true);
  const [retrievedAll, setRetrievedAll] = useState(false);

  useEffect(() => {
    // retrieve initial list of domains on load
    void handleRetrieveDomains();
  }, []);

  const handleRetrieveDomains = async () => {
    if (retrievedAll) {
      return;
    }
    setIsLoading(true);
    const resp = await props.retrieveDomains(cursor);
    if (resp.domains.length) {
      setDomains(d => [...d, ...resp.domains]);
      setCursor(resp.cursor);
      if (resp.domains.length < DOMAIN_LIST_PAGE_SIZE) {
        setRetrievedAll(true);
      }
    } else {
      setRetrievedAll(true);
    }
    setIsLoading(false);
  };

  if (domains.length === 0 && retrievedAll) {
    return (
      <Box className={classes.emptyPortfolio}>
        <PhotoLibraryOutlinedIcon className={classes.emptyIcon} />
        <Typography variant="h3" mt={1}>
          {t('profile.emptyPortfolio')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box className={classes.headerContainer}>
        <Typography className={classes.headerText} variant="h6">
          <PhotoLibraryOutlinedIcon className={classes.headerIcon} />
          {props.title}
          <Typography variant="body2" className={classes.domainCount}>
            {props.totalCount && `(${props.totalCount})`}
          </Typography>
        </Typography>
      </Box>
      <div className={classes.contentContainer}>
        <DomainProfileList
          id={props.id}
          domains={domains}
          isLoading={isLoading}
          withInfiniteScroll={true}
          onLastPage={handleRetrieveDomains}
          hasMore={!retrievedAll}
          variant="grid"
        />
      </div>
    </Box>
  );
};
