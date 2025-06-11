import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import KeyboardArrowRightOutlinedIcon from '@mui/icons-material/KeyboardArrowRightOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {Nft, SerializedDomainListEntry} from '../../lib';
import {isDomainListEntry, useTranslationContext} from '../../lib';
import type {Web3Dependencies} from '../../lib/types/web3';
import {NftTag} from '../TokenGallery';
import NftCard from '../TokenGallery/NftCard';
import {DomainPreview} from './DomainPreview';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    ...theme.containers.modalContent,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 'initial',
    gap: theme.spacing(2),
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '5em',
  },
  titleStyle: {
    color: 'inherit',
    alignSelf: 'center',
  },
  number: {
    color: `${theme.palette.neutralShades[400]} !important`,
    fontWeight: 600,
    fontSize: 18,
    marginRight: theme.spacing(2),
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    textDecoration: 'none !important',
    borderBottom: `1px dashed ${theme.palette.getContrastText(
      theme.palette.background.paper,
    )}`,
    alignItems: 'center',
    cursor: 'pointer',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    color: theme.palette.getContrastText(theme.palette.background.paper),
    '&:visited': {
      color: theme.palette.getContrastText(theme.palette.background.paper),
    },
    '&:hover': {
      '& p': {
        color: theme.palette.primary.main,
      },
      '& svg': {
        color: theme.palette.primary.main,
      },
    },
  },
  rowFirst: {
    borderTop: `0px`,
  },
  leftContent: {
    display: 'flex',
    alignItems: 'center',
    '& img': {
      width: '40px !important',
      height: '40px !important',
    },
  },
  domainText: {
    fontWeight: 600,
    marginLeft: theme.spacing(2),
  },
  arrowRightIcon: {
    color: 'inherit',
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  scrollableContainer: {
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
    height: '100%',
    width: '100%',
  },
  infinitescroll: {
    paddingRight: '1px',
    paddingLeft: '1px',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  infiniteScrollLoading: {
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    color: theme.palette.neutralShades[400],
    marginBottom: theme.spacing(1),
  },
  loadingSpinner: {
    color: 'inherit',
  },
  cardContainer: {
    position: 'relative',
  },
}));

type DomainProfileListProps = {
  id: string;
  domains: SerializedDomainListEntry[] | string[];
  isLoading: boolean;
  showNumber?: boolean;
  itemsPerPage?: number;
  onLastPage?: () => void;
  onClick?: (domain: string) => void;
  withPagination?: boolean;
  withInfiniteScroll?: boolean;
  setWeb3Deps?: (value: Web3Dependencies | undefined) => void;
  hasMore?: boolean;
  rowStyle?: string;
  variant?: 'list' | 'grid';
};

const DomainProfileList: React.FC<DomainProfileListProps> = ({
  id,
  domains,
  isLoading,
  showNumber = false,
  itemsPerPage = 7,
  withPagination = false,
  withInfiniteScroll = false,
  setWeb3Deps,
  onLastPage,
  onClick,
  hasMore = false,
  rowStyle,
  variant = 'list',
}) => {
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(domains.length / itemsPerPage);

  const handlePageChange = (e: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    if (onLastPage && newPage === totalPages) {
      onLastPage();
    }
  };

  const handleGridClick = (selected: Nft) => {
    window.open(
      `${config.UNSTOPPABLE_WEBSITE_URL}/d/${selected.name}`,
      '_blank',
    );
  };

  const getDomainNft = (domain: string | SerializedDomainListEntry): Nft => {
    return {
      name: getDomainName(domain),
      link: `${config.UNSTOPPABLE_WEBSITE_URL}/d/${getDomainName(domain)}`,
      image_url: `${
        config.UNSTOPPABLE_METADATA_ENDPOINT
      }/image-src/${getDomainName(domain)}?withOverlay=true`,
      description: getDomainName(domain),
      collection:
        typeof domain === 'string' || !domain.listing?.priceFormattedUsd
          ? 'Unlisted'
          : domain.listing.priceFormattedUsd,
      variant:
        typeof domain === 'string' || !domain.listing?.priceFormattedUsd
          ? 'unlisted'
          : 'listed',
      collectionLink: config.UNSTOPPABLE_WEBSITE_URL,
      tags: [NftTag.Domain],
      public: true,
    };
  };

  const getDomainName = (domain: string | SerializedDomainListEntry) => {
    if (isDomainListEntry(domain)) {
      return domain.domain;
    }
    return domain;
  };

  return withInfiniteScroll && onLastPage ? (
    <Box className={classes.scrollableContainer} id={`scrollableDiv-${id}`}>
      <InfiniteScroll
        className={classes.infinitescroll}
        scrollableTarget={
          variant === 'list' ? `scrollableDiv-${id}` : undefined
        }
        hasMore={hasMore}
        loader={
          <Box className={classes.infiniteScrollLoading}>
            <CircularProgress className={classes.loadingSpinner} />
          </Box>
        }
        next={onLastPage}
        dataLength={domains.length}
        scrollThreshold={0.7}
      >
        <Grid container spacing={2}>
          {domains.map((domainEntry, i) =>
            variant === 'list' ? (
              <Grid
                item
                xs={12}
                key={`domainList-${getDomainName(domainEntry)}-${i}`}
              >
                <a
                  className={cx(rowStyle || classes.row, {
                    [classes.rowFirst]: i === 0,
                  })}
                  onClick={
                    onClick
                      ? () => onClick(getDomainName(domainEntry))
                      : undefined
                  }
                  href={
                    !onClick
                      ? `${config.UD_ME_BASE_URL}/${getDomainName(domainEntry)}`
                      : undefined
                  }
                  key={getDomainName(domainEntry)}
                >
                  <div className={classes.leftContent}>
                    {showNumber && (
                      <Typography className={classes.number}>
                        {(page - 1) * itemsPerPage + i + 1}
                      </Typography>
                    )}
                    <DomainPreview
                      domain={getDomainName(domainEntry)}
                      size={30}
                      setWeb3Deps={setWeb3Deps}
                    />
                    <Typography variant="body2" className={classes.domainText}>
                      {getDomainName(domainEntry)}
                    </Typography>
                  </div>
                  <KeyboardArrowRightOutlinedIcon
                    className={classes.arrowRightIcon}
                  />
                </a>
              </Grid>
            ) : (
              <Grid
                key={`domainGrid-${getDomainName(domainEntry)}-${i}`}
                item
                xs={6}
                sm={3}
                md={3}
              >
                <Box className={classes.cardContainer}>
                  <NftCard
                    nft={getDomainNft(domainEntry)}
                    key={i}
                    onClick={handleGridClick}
                  />
                </Box>
              </Grid>
            ),
          )}
        </Grid>
        {hasMore && !isLoading && variant === 'list' && (
          <Button
            startIcon={<ArrowDownwardIcon />}
            onClick={() => onLastPage()}
            size="small"
            fullWidth
            color="secondary"
          >
            {t('common.loadMore')}
          </Button>
        )}
      </InfiniteScroll>
    </Box>
  ) : (
    <div className={classes.root}>
      {isLoading ? (
        <div className={classes.loaderContainer}>
          <CircularProgress />
        </div>
      ) : (
        domains
          .slice(
            (page - 1) * itemsPerPage,
            (page - 1) * itemsPerPage + itemsPerPage,
          )
          .map((domainEntry, i) => (
            <>
              <a
                className={cx(rowStyle || classes.row, {
                  [classes.rowFirst]: i === 0,
                })}
                href={`${config.UD_ME_BASE_URL}/${getDomainName(domainEntry)}`}
                key={getDomainName(domainEntry)}
              >
                <div className={classes.leftContent}>
                  {showNumber && (
                    <Typography className={classes.number}>
                      {(page - 1) * itemsPerPage + i + 1}
                    </Typography>
                  )}
                  <DomainPreview
                    domain={getDomainName(domainEntry)}
                    size={30}
                    setWeb3Deps={setWeb3Deps}
                  />
                  <Typography className={classes.domainText}>
                    {getDomainName(domainEntry)}
                  </Typography>
                </div>
                <KeyboardArrowRightOutlinedIcon
                  className={classes.arrowRightIcon}
                />
              </a>
            </>
          ))
      )}
      <div className={classes.paginationContainer}>
        {withPagination && !isLoading && domains.length / itemsPerPage > 1 && (
          <Pagination
            color="primary"
            shape="rounded"
            count={totalPages}
            onChange={handlePageChange}
            page={page}
          />
        )}
      </div>
    </div>
  );
};

export default DomainProfileList;
