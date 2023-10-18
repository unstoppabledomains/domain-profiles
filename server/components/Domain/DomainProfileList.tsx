import KeyboardArrowRightOutlinedIcon from '@mui/icons-material/KeyboardArrowRightOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import type {Web3Dependencies} from 'lib/types/web3';
import React, {useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

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
    borderBottom: `1px dashed ${theme.palette.neutralShades[100]}`,
    alignItems: 'center',
    cursor: 'pointer',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    color: theme.palette.neutralShades[800],
    '&:visited': {
      color: theme.palette.neutralShades[800],
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
    marginLeft: theme.spacing(1),
    fontSize: 14,
    color: 'initial',
  },
  arrowRightIcon: {
    color: theme.palette.neutralShades[400],
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

type Props = {
  domains: string[];
  isLoading: boolean;
  showNumber?: boolean;
  itemsPerPage?: number;
  onLastPage?: () => void;
  withPagination?: boolean;
  setWeb3Deps?: (value: Web3Dependencies | undefined) => void;
};

const DomainProfileList: React.FC<Props> = ({
  domains,
  isLoading,
  showNumber = false,
  itemsPerPage = 7,
  withPagination = false,
  setWeb3Deps,
  onLastPage,
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

  return (
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
                className={cx(classes.row, {
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
