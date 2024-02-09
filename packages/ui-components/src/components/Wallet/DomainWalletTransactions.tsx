import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import SendIcon from '@mui/icons-material/Send';
import SouthOutlinedIcon from '@mui/icons-material/SouthOutlined';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import Badge from '@mui/material/Badge';
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
import numeral from 'numeral';
import React, {useEffect, useState} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import truncateEthAddress from 'truncate-eth-address';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getDomainTransactions} from '../../actions';
import type {CurrenciesType, SerializedTx} from '../../lib';
import {WALLET_CARD_HEIGHT, useTranslationContext} from '../../lib';
import {notifyEvent} from '../../lib/error';
import type {SerializedWalletBalance} from '../../lib/types/domain';
import {CryptoIcon} from '../Image';

const bgNeutralShade = 800;

const useStyles = makeStyles()((theme: Theme) => ({
  walletContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  walletPlaceholder: {
    height: `${WALLET_CARD_HEIGHT}px`,
    width: '100%',
    borderRadius: theme.shape.borderRadius,
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
    height: `${WALLET_CARD_HEIGHT + 2}px`,
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
    width: 35,
    height: 35,
  },
  noActivity: {
    color: theme.palette.neutralShades[bgNeutralShade - 600],
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
    color: theme.palette.white,
  },
  txFee: {
    color: theme.palette.neutralShades[bgNeutralShade - 400],
  },
  txTime: {
    color: theme.palette.neutralShades[bgNeutralShade - 400],
    marginBottom: theme.spacing(1),
  },
  txLink: {
    cursor: 'pointer',
  },
  txImgPreview: {
    width: '50px',
    height: '50px',
    borderRadius: theme.shape.borderRadius,
  },
  txIcon: {
    color: theme.palette.common.black,
    borderRadius: '50%',
    padding: '2px',
    border: `1px solid black`,
    width: '17px',
    height: '17px',
  },
  txIconReceive: {
    backgroundColor: theme.palette.success.main,
  },
  txIconSend: {
    backgroundColor: theme.palette.primary.main,
    transform: 'rotate(-45deg)',
  },
  txIconInteract: {
    backgroundColor: theme.palette.secondary.main,
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
      if (w.txns?.data) {
        initialTxns.push(...w.txns.data);
      }
      if (w.txns?.cursor) {
        setHasMore(true);
        initialCursors[w.symbol] = w.txns.cursor;
      }
      w.txns?.data
        .filter(tx => !tx.symbol)
        .map(tx => {
          tx.symbol = w.symbol;
        });
    });
    setTxns(initialTxns);
    setCursors(initialCursors);
  }, [wallets]);

  const handleClick = (link: string) => {
    window.open(link, '_blank');
  };

  const handleNext = async () => {
    let isNewCursor = false;
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
          if (v?.data) {
            newTxns.push(...v.data);
          }
          if (v?.cursor) {
            isNewCursor = true;
            newCursors[symbol] = v.cursor;
          }
          v?.data
            .filter(tx => !tx.symbol)
            .map(tx => {
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
    setHasMore(isNewCursor);
    setCursors(newCursors);
    setTxns([...txns!, ...newTxns]);
  };

  const renderActivity = (
    index: number,
    tx: SerializedTx,
    prev?: SerializedTx,
    next?: SerializedTx,
  ) => {
    const isSender =
      (wallets || []).filter(
        w => w.address.toLowerCase() === tx.from.address.toLowerCase(),
      ).length > 0;
    const isNft = tx.type === 'nft';
    const isErc20 = tx.type === 'erc20';
    const isXfer = tx.value > 0;
    const actionName =
      isSender && isXfer
        ? t('activity.sent')
        : !isSender && isXfer
        ? t('activity.received')
        : isNft
        ? isSender
          ? t('activity.sentNft')
          : t('activity.receivedNft')
        : !['unknown', 'transfer'].includes(tx.method.toLowerCase())
        ? tx.method
        : t('activity.appInteraction');
    const actionSubject =
      isSender && isXfer
        ? t('activity.to', {
            subject: tx.to.label || truncateEthAddress(tx.to.address),
          })
        : !isSender && isXfer
        ? tx.from.address
          ? t('activity.from', {
              subject: tx.from.label || truncateEthAddress(tx.from.address),
            })
          : ''
        : isNft
        ? tx.method
        : isSender
        ? tx.to.label || truncateEthAddress(tx.to.address)
        : tx.from.label || truncateEthAddress(tx.from.address);
    const actionSubjectLink = isNft
      ? tx.link
      : isSender && isXfer
      ? tx.to.link
      : !isSender && isXfer
      ? tx.from.link
      : isSender
      ? tx.to.link
      : tx.from.link;
    const currDate = moment(tx.timestamp).format('LL');
    const prevDate = prev ? moment(prev.timestamp).format('LL') : '';
    const nextDate = next ? moment(next.timestamp).format('LL') : '';

    return (
      <React.Fragment key={`${tx.hash}-${index}`}>
        {currDate !== prevDate && (
          <Grid item xs={12}>
            <Typography
              mt={prev ? 2 : undefined}
              variant="body2"
              className={classes.txTime}
            >
              {currDate}
            </Typography>
          </Grid>
        )}
        <Grid
          item
          xs={2}
          className={classes.txLink}
          onClick={() => handleClick(tx.link)}
        >
          <Box display="flex" justifyContent="center" textAlign="center">
            <Badge
              overlap="circular"
              anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
              badgeContent={
                isXfer || isNft ? (
                  isSender ? (
                    <SendIcon
                      className={cx(classes.txIcon, classes.txIconSend)}
                    />
                  ) : (
                    <SouthOutlinedIcon
                      className={cx(classes.txIcon, classes.txIconReceive)}
                    />
                  )
                ) : (
                  <SyncAltIcon
                    className={cx(classes.txIcon, classes.txIconInteract)}
                  />
                )
              }
            >
              <CryptoIcon
                currency={tx.symbol as CurrenciesType}
                className={classes.currencyIcon}
              />
            </Badge>
          </Box>
        </Grid>
        <Grid item xs={isNft ? 8 : 6}>
          <Box display="flex" flexDirection="column">
            <Typography
              variant="caption"
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
          </Box>
        </Grid>
        <Grid item xs={isNft ? 2 : 4}>
          <Box
            display="flex"
            flexDirection="column"
            textAlign="right"
            justifyContent="right"
            justifyItems="right"
          >
            {!isNft && tx.value > 0 && (
              <Typography
                variant="caption"
                className={isSender ? classes.txSent : classes.txReceived}
              >
                {isSender ? '-' : '+'}
                {numeral(tx.value).format('0,0.[0000]')}{' '}
                {isErc20 ? tx.method.toUpperCase() : tx.symbol}
              </Typography>
            )}
            {!isNft && tx.gas > 0 && (
              <Typography variant="caption" className={classes.txFee}>
                -{numeral(tx.gas).format('0,0.[0000]')} {t('activity.gas')}
              </Typography>
            )}
            {isNft && tx.imageUrl && (
              <Box display="flex" justifyContent="right">
                <img className={classes.txImgPreview} src={tx.imageUrl} />
              </Box>
            )}
          </Box>
        </Grid>
        {currDate === nextDate && (
          <Grid item xs={12}>
            <Divider />
          </Grid>
        )}
      </React.Fragment>
    );
  };

  // calculate total balance
  const txCount = (wallets || [])
    .map(
      w =>
        parseInt(w.stats?.transactions || '0', 10) +
        parseInt(w.stats?.transfers || '0', 10),
    )
    .reduce((p, c) => p + c, 0);
  const sortedTxns = txns?.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

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
      {txns && wallets ? (
        <Box
          mt={'15px'}
          mb={2}
          id={`scrollableTxDiv`}
          className={classes.scrollableContainer}
        >
          {(txns || []).length > 0 ? (
            <InfiniteScroll
              scrollableTarget={`scrollableTxDiv`}
              hasMore={hasMore}
              loader={
                <Box className={classes.infiniteScrollLoading}>
                  <CircularProgress className={classes.loadingSpinner} />
                </Box>
              }
              next={handleNext}
              dataLength={(txns || []).length}
              scrollThreshold={0.7}
            >
              <Grid container spacing={1}>
                {sortedTxns?.map((tx, i) =>
                  renderActivity(
                    i,
                    tx,
                    i > 0 ? sortedTxns[i - 1] : undefined,
                    i + 1 < sortedTxns.length ? sortedTxns[i + 1] : undefined,
                  ),
                )}
              </Grid>
            </InfiniteScroll>
          ) : (
            <Typography className={classes.noActivity}>
              {t('activity.noActivity')}
            </Typography>
          )}
        </Box>
      ) : (
        <Grid mt="0px" mb={1.5} container spacing={2}>
          <Grid item xs={12}>
            <Skeleton
              variant="rectangular"
              className={classes.walletPlaceholder}
            />
          </Grid>
        </Grid>
      )}
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
