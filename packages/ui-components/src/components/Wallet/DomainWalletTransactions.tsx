import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import HistoryIcon from '@mui/icons-material/History';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import SendIcon from '@mui/icons-material/Send';
import SouthOutlinedIcon from '@mui/icons-material/SouthOutlined';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import React, {useState} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import truncateEthAddress from 'truncate-eth-address';
import useAsyncEffect from 'use-async-effect';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getTransactionsByAddress, getTransactionsByDomain} from '../../actions';
import type {CurrenciesType, SerializedTx} from '../../lib';
import {
  DomainProfileKeys,
  TokenType,
  WALLET_CARD_HEIGHT,
  useTranslationContext,
} from '../../lib';
import {notifyEvent} from '../../lib/error';
import type {SerializedWalletBalance} from '../../lib/types/domain';
import {localStorageWrapper} from '../Chat';
import {CryptoIcon} from '../Image';
import {
  getBlockchainDisplaySymbol,
  getBlockchainGasSymbol,
} from '../Manage/common/verification/types';
import Modal from '../Modal';
import FundWalletModal from './FundWalletModal';

const useStyles = makeStyles<{fullHeight?: boolean}>()(
  (theme: Theme, {fullHeight}) => ({
    walletContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
    walletPlaceholder: {
      height: fullHeight ? '100%' : `${WALLET_CARD_HEIGHT}px`,
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
      color: theme.palette.wallet.text.primary,
      marginLeft: theme.spacing(1),
    },
    headerIcon: {
      color: theme.palette.wallet.text.primary,
      marginRight: theme.spacing(1),
    },
    scrollableContainer: {
      overflowY: 'auto',
      overflowX: 'hidden',
      overscrollBehavior: 'contain',
      height: fullHeight ? '100%' : `${WALLET_CARD_HEIGHT + 2}px`,
      width: '100%',
      backgroundImage: `linear-gradient(${theme.palette.wallet.background.gradient.start}, ${theme.palette.wallet.background.gradient.end})`,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(2),
      ['::-webkit-scrollbar']: {
        display: 'none',
      },
    },
    transactionContainer: {
      border: '1px solid transparent',
    },
    infiniteScrollLoading: {
      width: '100%',
      alignItems: 'center',
      textAlign: 'center',
      justifyContent: 'center',
      color: theme.palette.wallet.text.primary,
      marginBottom: theme.spacing(1),
    },
    loadingSpinner: {
      color: 'inherit',
    },
    currencyIcon: {
      width: 35,
      height: 35,
      backgroundColor: theme.palette.wallet.background.main,
    },
    noActivity: {
      marginTop: theme.spacing(2),
      color: theme.palette.wallet.text.primary,
    },
    txContainer: {
      display: 'flex',
      cursor: 'pointer',
      width: '100%',
      padding: theme.spacing(0.5),
      borderRadius: theme.shape.borderRadius,
      backgroundColor: 'transparent',
      marginLeft: theme.spacing(1),
      '&:hover': {
        backgroundColor: theme.palette.wallet.background.main,
      },
    },
    txTitle: {
      fontWeight: 'bold',
      color: theme.palette.wallet.text.primary,
      cursor: 'pointer',
    },
    txSubTitle: {
      color: theme.palette.wallet.text.secondary,
    },
    txReceived: {
      fontWeight: 'bold',
      color: theme.palette.wallet.chart.up,
    },
    txSent: {
      fontWeight: 'bold',
      color: theme.palette.wallet.text.primary,
    },
    txFee: {
      color: theme.palette.wallet.chart.down,
    },
    txTime: {
      color: theme.palette.wallet.text.secondary,
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
      color: theme.palette.wallet.background.main,
      borderRadius: '50%',
      padding: '2px',
      border: `1px solid black`,
      width: '17px',
      height: '17px',
    },
    txIconReceive: {
      backgroundColor: theme.palette.wallet.chart.up,
    },
    txIconSend: {
      backgroundColor: theme.palette.wallet.chart.down,
      transform: 'rotate(-45deg)',
    },
    txIconInteract: {
      backgroundColor: theme.palette.wallet.chart.down,
    },
    modalTitleStyle: {
      color: 'inherit',
      alignSelf: 'center',
    },
    txPlaceholder: {
      width: '100%',
      height: '50px',
      borderRadius: theme.shape.borderRadius,
      marginBottom: theme.spacing(1),
    },
  }),
);

export const DomainWalletTransactions: React.FC<
  DomainWalletTransactionsProps
> = ({
  id,
  accessToken,
  domain,
  isOwner,
  wallets,
  isError,
  isWalletLoading,
  verified,
  fullScreenModals,
  fullHeight,
  boxShadow,
  onBack,
  onBuyClicked,
  onReceiveClicked,
}) => {
  const {classes, cx} = useStyles({fullHeight});
  const [t] = useTranslationContext();
  const [cursors, setCursors] = useState<Record<string, string>>({});
  const [txns, setTxns] = useState<SerializedTx[]>();
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  // load previously known transactions from local state
  useAsyncEffect(async () => {
    // retrieve previously known transactions from local state
    const cachedTxns = await localStorageWrapper.getItem(
      DomainProfileKeys.WalletTransactions,
    );
    if (cachedTxns) {
      setTxns(JSON.parse(cachedTxns));
    }
  }, []);

  // update transactions dynamically
  useAsyncEffect(async () => {
    const initialTxns: SerializedTx[] = [];
    const initialCursors: Record<string, string> = {};
    wallets?.map(w => {
      if (w.txns?.data) {
        initialTxns.push(...w.txns.data);
      }
      if (w.txns?.cursor) {
        setHasMore(true);
        initialCursors[`${w.symbol}-${w.address}`] = w.txns.cursor;
      }
      w.txns?.data
        .filter(tx => !tx.symbol)
        .map(tx => {
          tx.symbol = w.symbol;
        });
    });

    // show the initial transactions
    setTxns(initialTxns);
    setCursors(initialCursors);

    // store the initial transactions in local state
    await localStorageWrapper.setItem(
      DomainProfileKeys.WalletTransactions,
      JSON.stringify(initialTxns),
    );
  }, [wallets]);

  const handleClick = (link: string) => {
    window.open(link, '_blank');
  };

  const handleNext = async () => {
    let isNewCursor = false;
    const newTxns: SerializedTx[] = [];
    const newCursors: Record<string, string> = {};
    setIsLoading(true);
    await Bluebird.map(
      Object.keys(cursors),
      async cursorKey => {
        try {
          const symbol = cursorKey.split('-')[0];
          const v = domain
            ? await getTransactionsByDomain(domain, symbol, cursors[cursorKey])
            : accessToken &&
              wallets?.find(
                w => w.symbol.toLowerCase() === symbol.toLowerCase(),
              )
            ? await getTransactionsByAddress(
                wallets.find(
                  w => w.symbol.toLowerCase() === symbol.toLowerCase(),
                )!.address,
                accessToken,
                symbol,
                cursors[cursorKey],
              )
            : undefined;
          if (v?.data) {
            newTxns.push(...v.data);
          }
          if (v?.cursor) {
            isNewCursor = true;
            newCursors[cursorKey] = v.cursor;
          }
          v?.data
            .filter(tx => !tx.symbol)
            .map(tx => {
              tx.symbol = symbol;
            });
        } catch (e) {
          notifyEvent(e, 'warning', 'Wallet', 'Fetch', {
            msg: 'unable to retrieve transactions',
          });
        }
      },
      {concurrency: 3},
    );
    setIsLoading(false);
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
        w => w.address.toLowerCase() === tx.from?.address.toLowerCase(),
      ).length > 0;
    const isNft = tx.type === TokenType.Nft;
    const isErc20 = tx.type === TokenType.Erc20;
    const isNative = tx.type === TokenType.Native;
    const isXfer = Math.abs(tx.value) > 0;
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
            subject: tx.to.label || truncateEthAddress(tx.to.address || ''),
          })
        : !isSender && isXfer
        ? tx.from.address
          ? t('activity.from', {
              subject:
                tx.from.label || truncateEthAddress(tx.from.address || ''),
            })
          : ''
        : isNft
        ? tx.method
        : isSender
        ? tx.to.label || truncateEthAddress(tx.to.address || '')
        : tx.from.label || truncateEthAddress(tx.from.address || '');
    const currDate = moment(tx.timestamp).format('LL');
    const prevDate = prev ? moment(prev.timestamp).format('LL') : '';
    const nextDate = next ? moment(next.timestamp).format('LL') : '';
    const gasFee =
      tx.gas && tx.gas > 0 ? numeral(tx.gas).format('0,0.[0000]') : '';

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
        <Box
          onClick={() => handleClick(tx.link)}
          className={classes.txContainer}
        >
          <Grid item xs={2} className={classes.txLink}>
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
                {tx.type === 'spl' && tx.imageUrl ? (
                  <Avatar
                    src={tx.imageUrl}
                    alt={tx.symbol}
                    className={classes.currencyIcon}
                  />
                ) : (
                  <CryptoIcon
                    currency={tx.symbol as CurrenciesType}
                    className={classes.currencyIcon}
                  />
                )}
              </Badge>
            </Box>
          </Grid>
          <Grid item xs={isNft ? 8 : 6}>
            <Box display="flex" flexDirection="column">
              <Typography variant="caption" className={classes.txTitle}>
                {actionName}
              </Typography>
              <Typography variant="caption" className={classes.txSubTitle}>
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
              {!isNft && Math.abs(tx.value) > 0 && (
                <Typography
                  variant="caption"
                  className={isSender ? classes.txSent : classes.txReceived}
                >
                  {isSender ? '-' : '+'}
                  {numeral(Math.abs(tx.value)).format('0,0.[0000]')}{' '}
                  {isErc20
                    ? tx.method.toUpperCase()
                    : tx.symbol &&
                      getBlockchainDisplaySymbol(
                        isNative
                          ? getBlockchainGasSymbol(tx.symbol)
                          : tx.symbol,
                      )}
                </Typography>
              )}
              {!isNft && gasFee && gasFee.toLowerCase() !== 'nan' && (
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
        </Box>
        {currDate === nextDate && (
          <Grid item xs={12}>
            <Divider />
          </Grid>
        )}
      </React.Fragment>
    );
  };

  // calculate total balance
  const txCount = (txns || []).length;
  const txHashes = (txns || []).map(tx => tx.hash);
  const sortedTxns = txns
    ?.filter((tx, index) => !txHashes.includes(tx.hash, index + 1))
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  // show CTA if there are no transactions
  if (
    isOwner &&
    !isWalletLoading &&
    txns &&
    txns.length === 0 &&
    onBack &&
    onBuyClicked &&
    onReceiveClicked
  ) {
    return (
      <Modal
        title={t('activity.title')}
        open={true}
        fullScreen={fullScreenModals}
        titleStyle={classes.modalTitleStyle}
        onClose={onBack}
      >
        <FundWalletModal
          onBuyClicked={onBuyClicked}
          onReceiveClicked={onReceiveClicked}
          icon={<HistoryIcon />}
        />
      </Modal>
    );
  }

  // render the transaction list
  return (
    <Box className={classes.walletContainer}>
      {domain && (
        <Box className={classes.sectionHeaderContainer}>
          <Box className={classes.sectionHeader}>
            <Tooltip
              title={t(
                verified
                  ? 'verifiedWallets.verifiedOnly'
                  : 'verifiedWallets.notVerified',
                {domain},
              )}
            >
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
      )}
      {isError || (txns && wallets) ? (
        <Box
          id={`scrollableTxDiv-${id}`}
          className={classes.scrollableContainer}
          boxShadow={boxShadow}
        >
          {!isError && (txns || []).length > 0 ? (
            <InfiniteScroll
              scrollableTarget={`scrollableTxDiv-${id}`}
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
              <Grid
                container
                spacing={1}
                className={classes.transactionContainer}
              >
                {sortedTxns?.map((tx, i) =>
                  renderActivity(
                    i,
                    tx,
                    i > 0 ? sortedTxns[i - 1] : undefined,
                    i + 1 < sortedTxns.length ? sortedTxns[i + 1] : undefined,
                  ),
                )}
              </Grid>
              {hasMore && !isLoading && (
                <Button
                  startIcon={<ArrowDownwardIcon />}
                  onClick={() => handleNext()}
                  size="small"
                  fullWidth
                  color="secondary"
                >
                  {t('common.loadMore')}
                </Button>
              )}
            </InfiniteScroll>
          ) : isWalletLoading ? (
            <Box className={classes.infiniteScrollLoading}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton
                  key={`placeholder-${i}`}
                  className={classes.txPlaceholder}
                  variant="rectangular"
                />
              ))}
            </Box>
          ) : (
            <Typography className={classes.noActivity} textAlign="center">
              {isError ? t('activity.retrieveError') : t('activity.noActivity')}
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
  id: string;
  domain?: string;
  accessToken?: string;
  isOwner?: boolean;
  isError?: boolean;
  isWalletLoading?: boolean;
  wallets?: SerializedWalletBalance[];
  minCount?: number;
  maxCount?: number;
  verified: boolean;
  fullScreenModals?: boolean;
  fullHeight?: boolean;
  boxShadow?: number;
  onBack?: () => void;
  onReceiveClicked?: () => void;
  onBuyClicked?: () => void;
};
