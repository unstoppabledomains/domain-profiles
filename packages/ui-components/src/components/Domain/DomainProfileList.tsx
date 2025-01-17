import KeyboardArrowRightOutlinedIcon from '@mui/icons-material/KeyboardArrowRightOutlined';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {Web3Dependencies} from '../../lib/types/web3';
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
}));

type DomainProfileListProps = {
  id: string;
  domains: string[];
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
}) => {
  const {classes, cx} = useStyles();
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(domains.length / itemsPerPage);

  const handlePageChange = (e: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    if (onLastPage && newPage === totalPages) {
      onLastPage();
    }
  };

  return withInfiniteScroll && onLastPage ? (
    <Box className={classes.scrollableContainer} id={`scrollableDiv-${id}`}>
      <InfiniteScroll
        scrollableTarget={`scrollableDiv-${id}`}
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
        {domains.map((domain, i) => (
          <Box key={`domainList-${domain}-${i}`}>
            <a
              className={cx(rowStyle || classes.row, {
                [classes.rowFirst]: i === 0,
              })}
              onClick={onClick ? () => onClick(domain) : undefined}
              href={!onClick ? `${config.UD_ME_BASE_URL}/${domain}` : undefined}
              key={domain}
            >
              <div className={classes.leftContent}>
                {showNumber && (
                  <Typography className={classes.number}>
                    {(page - 1) * itemsPerPage + i + 1}
                  </Typography>
                )}
                <DomainPreview
                  domain={domain}
                  size={30}
                  setWeb3Deps={setWeb3Deps}
                />
                <Typography variant="body2" className={classes.domainText}>
                  {domain}
                </Typography>
              </div>
              <KeyboardArrowRightOutlinedIcon
                className={classes.arrowRightIcon}
              />
            </a>
          </Box>
        ))}
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
          .map((domain, i) => (
            <>
              <a
                className={cx(rowStyle || classes.row, {
                  [classes.rowFirst]: i === 0,
                })}
                href={`${config.UD_ME_BASE_URL}/${domain}`}
                key={domain}
              >
                <div className={classes.leftContent}>
                  {showNumber && (
                    <Typography className={classes.number}>
                      {(page - 1) * itemsPerPage + i + 1}
                    </Typography>
                  )}
                  <DomainPreview
                    domain={domain}
                    size={30}
                    setWeb3Deps={setWeb3Deps}
                  />
                  <Typography className={classes.domainText}>
                    {domain}
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
