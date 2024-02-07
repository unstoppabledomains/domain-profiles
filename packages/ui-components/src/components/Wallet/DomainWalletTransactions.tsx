import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Bluebird from 'bluebird';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import truncateEthAddress from 'truncate-eth-address';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getDomainTransactions} from '../../actions';
import type {CurrenciesType, SerializedTx} from '../../lib';
import {useTranslationContext} from '../../lib';
import {notifyEvent} from '../../lib/error';
import type {SerializedWalletBalance} from '../../lib/types/domain';
import {CryptoIcon} from '../Image';

const bgNeutralShade = 800;

const useStyles = makeStyles()((theme: Theme) => ({
  walletContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  sectionHeaderContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: theme.spacing(6, 0, 0),
    minHeight: '42px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.h5.fontSize,
    lineHeight: 1.4,
  },
  totalValue: {
    color: theme.palette.neutralShades[600],
    marginLeft: theme.spacing(1),
  },
  headerIcon: {
    color: theme.palette.neutralShades[600],
    marginRight: theme.spacing(1),
  },
  scrollableContainer: {
    overflowY: 'auto',
    overflowX: 'hidden',
    overscrollBehavior: 'contain',
    height: '212px',
    width: '100%',
    backgroundImage: `linear-gradient(${
      theme.palette.neutralShades[bgNeutralShade - 200]
    }, ${theme.palette.neutralShades[bgNeutralShade]})`,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.neutralShades[bgNeutralShade - 600]}`,
    padding: theme.spacing(2),
  },
  infiniteScrollLoading: {
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    color: theme.palette.neutralShades[bgNeutralShade - 400],
    marginBottom: theme.spacing(1),
  },
  loadingSpinner: {
    color: 'inherit',
  },
  currencyIcon: {
    width: 30,
    height: 30,
  },
  txTitle: {
    fontWeight: 'bold',
    color: theme.palette.white,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  txSubTitle: {
    color: theme.palette.neutralShades[bgNeutralShade - 600],
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  txReceived: {
    fontWeight: 'bold',
    color: theme.palette.success.main,
  },
  txSent: {
    fontWeight: 'bold',
    color: theme.palette.neutralShades[bgNeutralShade - 600],
  },
  txFee: {
    color: theme.palette.neutralShades[bgNeutralShade - 400],
  },
  txTime: {
    color: theme.palette.neutralShades[bgNeutralShade - 400],
  },
  txLink: {
    cursor: 'pointer',
  },
}));

export const DomainWalletTransactions: React.FC<
  DomainWalletTransactionsProps
> = ({domain, wallets}) => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();
  const [cursors, setCursors] = useState<Record<string, string>>({});
  const [txns, setTxns] = useState<SerializedTx[]>();
  const [hasMore, setHasMore] = useState<boolean>(false);

  useEffect(() => {
    const initialTxns: SerializedTx[] = [];
    const initialCursors: Record<string, string> = {};
    wallets?.map(w => {
      if (w.txns?.txns) {
        initialTxns.push(...w.txns.txns);
      }
      if (w.txns?.cursor) {
        initialCursors[w.symbol] = w.txns.cursor;
      }
      w.txns?.txns.map(tx => {
        tx.symbol = w.symbol;
      });
    });
    setTxns(initialTxns);
    setCursors(initialCursors);
    setHasMore((wallets || []).filter(w => w.txns?.cursor).length > 0);
  }, [wallets]);

  const handleClick = (link: string) => {
    window.open(link, '_blank');
  };

  const handleNext = async () => {
    const newTxns: SerializedTx[] = [];
    const newCursors: Record<string, string> = {};
    await Bluebird.map(
      Object.keys(cursors),
      async symbol => {
        try {
          const v = await getDomainTransactions(
            domain,
            symbol,
            cursors[symbol],
          );
          if (v?.txns) {
            newTxns.push(...v.txns);
          }
          if (v?.cursor) {
            newCursors[symbol] = v.cursor;
          }
          v?.txns.map(tx => {
            tx.symbol = symbol;
          });
        } catch (e) {
          notifyEvent(e, 'warning', 'WALLET', 'Fetch', {
            msg: 'unable to retrieve transactions',
          });
        }
      },
      {concurrency: 3},
    );
    setCursors(newCursors);
    setTxns([...txns!, ...newTxns]);
    setHasMore(Object.keys(newCursors).length > 0);
  };

  const renderActivity = (tx: SerializedTx) => {
    const isSender =
      (wallets || []).filter(
        w => w.address.toLowerCase() === tx.from.address.toLowerCase(),
      ).length > 0;
    const isXfer = tx.value > 0;
    const actionName =
      isSender && isXfer
        ? t('activity.sent')
        : !isSender && isXfer
        ? t('activity.received')
        : !['unknown', 'transfer'].includes(tx.method.toLowerCase())
        ? tx.method
        : t('activity.appInteraction');
    const actionSubject =
      isSender && isXfer
        ? t('activity.to', {
            subject: tx.to.label || truncateEthAddress(tx.to.address),
          })
        : !isSender && isXfer
        ? t('activity.from', {
            subject: tx.from.label || truncateEthAddress(tx.from.address),
          })
        : isSender
        ? tx.to.label || truncateEthAddress(tx.to.address)
        : tx.from.label || truncateEthAddress(tx.from.address);
    const actionSubjectLink =
      isSender && isXfer
        ? tx.to.link
        : !isSender && isXfer
        ? tx.from.link
        : isSender
        ? tx.to.link
        : tx.from.link;

    return (
      <>
        <Grid
          item
          xs={2}
          className={classes.txLink}
          onClick={() => handleClick(tx.link)}
        >
          <Box display="flex" justifyContent="center" textAlign="center">
            <CryptoIcon
              currency={tx.symbol as CurrenciesType}
              className={classes.currencyIcon}
            />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box display="flex" flexDirection="column">
            <Typography
              variant="body2"
              onClick={() => handleClick(tx.link)}
              className={classes.txTitle}
            >
              {actionName}
            </Typography>
            <Typography
              variant="caption"
              onClick={() => handleClick(actionSubjectLink)}
              className={classes.txSubTitle}
            >
              {actionSubject}
            </Typography>
            <Typography variant="caption" className={classes.txTime}>
              {moment(tx.timestamp).fromNow()}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box display="flex" flexDirection="column" textAlign="right">
            {tx.value > 0 && (
              <Typography
                variant="body2"
                className={isSender ? classes.txSent : classes.txReceived}
              >
                {isSender ? '-' : '+'}
                {tx.value.toFixed(3)} {tx.symbol}
              </Typography>
            )}
            {tx.gas > 0 && (
              <Typography variant="caption" className={classes.txFee}>
                -{tx.gas.toFixed(3)} {t('activity.gas')}
              </Typography>
            )}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
      </>
    );
  };

  // calculate total balance
  const txCount = (wallets || [])
    .map(w => parseInt(w.stats?.transactions || '0', 10))
    .reduce((p, c) => p + c, 0);

  // render the wallet list
  return (
    <Box className={classes.walletContainer}>
      <Box className={classes.sectionHeaderContainer}>
        <Box className={classes.sectionHeader}>
          <Tooltip title={t('verifiedWallets.verifiedOnly', {domain})}>
            <HistoryOutlinedIcon className={classes.headerIcon} />
          </Tooltip>
          <Typography variant="h6">{t('activity.title')}</Typography>
          {txCount > 0 && (
            <Typography variant="body2" className={classes.totalValue}>
              ({txCount})
            </Typography>
          )}
        </Box>
      </Box>
      <Box
        mt={'15px'}
        mb={2}
        id={`scrollableTxDiv`}
        className={classes.scrollableContainer}
      >
        {txns ? (
          <InfiniteScroll
            scrollableTarget={`scrollableTxDiv`}
            hasMore={hasMore}
            loader={
              <Box className={classes.infiniteScrollLoading}>
                <CircularProgress className={classes.loadingSpinner} />
              </Box>
            }
            next={handleNext}
            dataLength={txns.length}
            scrollThreshold={0.7}
          >
            <Grid container spacing={1}>
              {txns
                .sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime(),
                )
                .map(tx => renderActivity(tx))}
            </Grid>
          </InfiniteScroll>
        ) : (
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Skeleton variant="text" width="100%" />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="text" width="50%" />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="text" width="100%" />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="text" width="50%" />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="text" width="100%" />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="text" width="50%" />
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export type DomainWalletTransactionsProps = {
  domain: string;
  isOwner?: boolean;
  wallets?: SerializedWalletBalance[];
  minCount?: number;
  maxCount?: number;
};
