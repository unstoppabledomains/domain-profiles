import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import SendIcon from '@mui/icons-material/Send';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {Mutex} from 'async-mutex';
import Markdown from 'markdown-to-jsx';
import {useSnackbar} from 'notistack';
import React, {useEffect, useState} from 'react';
import useAsyncEffect from 'use-async-effect';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {DomainWalletTransactions} from '.';
import {
  DOMAIN_LIST_PAGE_SIZE,
  getOwnerDomains,
  getProfileData,
} from '../../actions';
import {getTransactionLockStatus} from '../../actions/fireBlocksActions';
import {useWeb3Context} from '../../hooks';
import useFireblocksState from '../../hooks/useFireblocksState';
import type {SerializedWalletBalance, TokenEntry} from '../../lib';
import {
  CustodyState,
  DomainFieldTypes,
  DomainProfileKeys,
  WALLET_CARD_HEIGHT,
  isLocked,
  useTranslationContext,
} from '../../lib';
import {notifyEvent} from '../../lib/error';
import type {TransactionLockStatusResponse} from '../../lib/types/fireBlocks';
import type {SerializedIdentityResponse} from '../../lib/types/identity';
import {localStorageWrapper} from '../Chat';
import {isEthAddress} from '../Chat/protocol/resolution';
import {DomainProfileList} from '../Domain';
import {DomainProfileModal} from '../Manage';
import Modal from '../Modal';
import ActionButton from './ActionButton';
import Buy from './Buy';
import FundWalletModal from './FundWalletModal';
import {LetsGetStartedCta} from './LetsGetStartedCta';
import Receive from './Receive';
import ReceiveDomainModal from './ReceiveDomainModal';
import Send from './Send';
import SetupTxLockModal from './SetupTxLockModal';
import Swap from './Swap';
import TokenDetail from './TokenDetail';
import {TokensPortfolio} from './TokensPortfolio';
import {WalletBanner} from './WalletBanner';

const useStyles = makeStyles<{isMobile: boolean}>()(
  (theme: Theme, {isMobile}) => ({
    container: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: getMinClientHeight(isMobile),
    },
    walletContainer: {
      display: 'flex',
      flexDirection: 'column',
      width: '375px',
      [theme.breakpoints.down('sm')]: {
        width: 'calc(100vw - 32px)',
      },
      height: '100%',
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      [theme.breakpoints.down('sm')]: {
        marginLeft: theme.spacing(-1),
        marginRight: theme.spacing(-1),
      },
    },
    balanceContainer: {
      display: 'flex',
      justifyContent: 'center',
    },
    snackBarButton: {
      marginLeft: theme.spacing(1),
      color: theme.palette.getContrastText(theme.palette.primary.main),
    },
    actionContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: theme.spacing(3),
    },
    listContainer: {
      marginBottom: theme.spacing(2),
      marginTop: '15px',
      height: `${WALLET_CARD_HEIGHT + 2}px`,
      [theme.breakpoints.down('sm')]: {
        height: 'calc(100dvh - 310px)',
      },
    },
    domainListContainer: {
      color: theme.palette.wallet.text.primary,
      display: 'flex',
      backgroundImage: `linear-gradient(${theme.palette.wallet.background.gradient.start}, ${theme.palette.wallet.background.gradient.end})`,
      borderRadius: theme.shape.borderRadius,
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    domainRow: {
      display: 'flex',
      justifyContent: 'space-between',
      textDecoration: 'none !important',
      alignItems: 'center',
      cursor: 'pointer',
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      color: theme.palette.wallet.text.primary,
      '&:visited': {
        color: theme.palette.wallet.text.primary,
      },
      '&:hover': {
        '& p': {
          color: theme.palette.wallet.text.primary,
        },
        '& svg': {
          color: theme.palette.wallet.text.primary,
        },
      },
    },
    panelContainer: {
      display: 'flex',
      width: '100%',
      height: '100%',
    },
    portfolioContainer: {
      display: 'flex',
      marginTop: theme.spacing(-2),
      marginBottom: theme.spacing(-2),
      width: '100%',
      height: '100%',
    },
    tabList: {
      marginTop: theme.spacing(-3),
      marginRight: theme.spacing(-4),
      [theme.breakpoints.down('sm')]: {
        marginLeft: theme.spacing(-1),
        marginRight: theme.spacing(-5),
      },
    },
    tabContentItem: {
      marginLeft: theme.spacing(-3),
      marginRight: theme.spacing(-3),
      height: '100%',
    },
    footer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    identitySnackbar: {
      display: 'flex',
      maxWidth: '300px',
    },
    modalTitleStyle: {
      color: 'inherit',
      alignSelf: 'center',
    },
    fundWalletCtaText: {
      maxWidth: '350px',
    },
  }),
);

// define a timer to refresh the page periodically
let refreshTimer: NodeJS.Timeout | undefined;
const REFRESH_BALANCE_MS = 30 * 1000; // 30 second interval to refresh the balance

export const Client: React.FC<ClientProps> = ({
  accessToken,
  wallets,
  paymentConfigStatus,
  fullScreenModals,
  onClaimWallet,
  onRefresh,
  onSecurityCenterClicked,
  setIsHeaderClicked,
  isHeaderClicked,
  isWalletLoading,
  externalBanner,
}) => {
  // mobile behavior flag
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // style and translation
  const {classes, cx} = useStyles({isMobile});
  const [t] = useTranslationContext();
  const {enqueueSnackbar, closeSnackbar} = useSnackbar();

  // wallet state variables
  const [state, saveState] = useFireblocksState();
  const [fundingModalTitle, setFundingModalTitle] = useState<string>();
  const [fundingModalIcon, setFundingModalIcon] = useState<React.ReactNode>();
  const [banner, setBanner] = useState<React.ReactNode>(externalBanner);
  const {setWeb3Deps, setShowPinCta, setTxLockStatus, txLockStatus} =
    useWeb3Context();
  const cryptoValue = wallets
    .map(w => w.totalValueUsdAmt || 0)
    .reduce((p, c) => p + c, 0);
  const isSellEnabled = cryptoValue >= 15;
  const refreshMutex = new Mutex();

  // component state variables
  const [isSend, setIsSend] = useState(false);
  const [isReceive, setIsReceive] = useState(false);
  const [isBuy, setIsBuy] = useState(false);
  const [isSwap, setIsSwap] = useState(false);
  const [isTxUnlockOpen, setIsTxUnlockOpen] = useState(false);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(ClientTabType.Portfolio);
  const [selectedToken, setSelectedToken] = useState<TokenEntry>();

  // domain list state
  const [domains, setDomains] = useState<string[]>([]);
  const [domainsValue, setDomainsValue] = useState<number>(0);
  const [cursor, setCursor] = useState<number | string>();
  const [isDomainsLoading, setIsDomainsLoading] = useState(true);
  const [retrievedAll, setRetrievedAll] = useState(false);
  const [domainToManage, setDomainToManage] = useState<string>();

  // owner address
  const address = wallets.find(w => isEthAddress(w.address))?.address;

  // initialize the page refresh timer
  useAsyncEffect(async () => {
    if (!accessToken) {
      return;
    }

    // retrieve wallet lock status
    setTxLockStatus(await getTransactionLockStatus(accessToken));

    // start a new refresh timer
    resetRefreshTimer(getTabFields(tabValue));

    // clear timer on unload
    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [accessToken]);

  // banner management
  useAsyncEffect(async () => {
    // prioritize the lock state banner if required
    if (txLockStatus?.enabled) {
      setBanner(
        <WalletBanner
          icon={<LockIcon fontSize="small" />}
          action={
            txLockStatus?.validUntil ? undefined : (
              <Button
                variant="text"
                color="inherit"
                size="small"
                onClick={handleTxUnlockClicked}
              >
                {t('wallet.unlock')}
              </Button>
            )
          }
        >
          <Markdown>
            {txLockStatus?.validUntil
              ? t('wallet.txLockTimeStatus', {
                  date: new Date(txLockStatus.validUntil).toLocaleString(),
                })
              : t('wallet.txLockManualStatus')}
          </Markdown>
        </WalletBanner>,
      );
      return;
    }

    // prioritize security health check
    const isHealthCheckCleared = await localStorageWrapper.getItem(
      DomainProfileKeys.BannerHealthCheck,
    );
    if (!isHealthCheckCleared && onSecurityCenterClicked) {
      setBanner(
        <Tooltip arrow title={t('wallet.securityHealthCheckDescription')}>
          <Box>
            <WalletBanner
              icon={<SecurityOutlinedIcon fontSize="small" />}
              action={
                <Box display="flex">
                  <IconButton
                    size="small"
                    color="inherit"
                    onClick={() => handleHealthCheckClicked(true)}
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="inherit"
                    onClick={() => handleHealthCheckClicked(false)}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              }
            >
              {t('wallet.securityHealthCheck')}
            </WalletBanner>
          </Box>
        </Tooltip>,
      );
      return;
    }

    // use an external banner if present
    setBanner(externalBanner);
  }, [externalBanner, txLockStatus]);

  useEffect(() => {
    if (!isHeaderClicked || !setIsHeaderClicked) {
      return;
    }
    if (address) {
      void handleLoadDomains(true);
    }
    setIsHeaderClicked(false);
    void handleCancelAction();
  }, [address, isHeaderClicked]);

  useEffect(() => {
    if (!paymentConfigStatus?.status) {
      return;
    }

    // nothing to do if message has already been shown
    if (paymentConfigStatus?.status === state.config?.identityState) {
      return;
    }

    // show message and set state key so it is not displayed again
    state.config = {
      ...state.config,
      identityState: paymentConfigStatus.status,
    };
    void saveState({
      ...state,
    });
    enqueueSnackbar(
      <Box className={classes.identitySnackbar}>
        <Markdown>
          {t(
            paymentConfigStatus.status === 'ready'
              ? 'claimIdentity.mpcWalletReady'
              : paymentConfigStatus.status === 'minting'
              ? 'claimIdentity.mpcWalletMinting'
              : 'claimIdentity.mpcWalletUpdating',
            {
              emailAddress: paymentConfigStatus.account,
            },
          )}
        </Markdown>
      </Box>,
      {variant: 'info'},
    );
  }, [paymentConfigStatus]);

  useEffect(() => {
    if (!address) {
      return;
    }
    void handleLoadDomains(true);
  }, [address]);

  useEffect(() => {
    if (accessToken || !cryptoValue) {
      if (showPasswordCtaTimer) {
        clearTimeout(showPasswordCtaTimer);
      }
      return;
    }
    showPasswordCtaTimer = setTimeout(showPasswordCta, 2000);
  }, [accessToken, cryptoValue]);

  useEffect(() => {
    if (!refreshTimer) {
      return;
    }

    // do not use the refresh timer if the swap modal is open
    if (isSwap) {
      clearTimeout(refreshTimer);
    } else {
      resetRefreshTimer(getTabFields(tabValue));
    }
  }, [isSwap]);

  // wrapper for the refresh method
  const refresh = async (showSpinner?: boolean, fields?: string[]) => {
    // skip background refresh if already locked
    if (!showSpinner && refreshMutex.isLocked()) {
      return;
    }

    // run serially to prevent race condition
    await refreshMutex.runExclusive(async () => {
      // refresh the data if the wallet is not locked
      const isWalletLocked = await isLocked();
      if (isWalletLocked) {
        setShowPinCta(true);
      } else {
        // retrieve fresh wallet balances
        await onRefresh(showSpinner, fields);
      }
    });
  };

  const handleTxUnlockClicked = () => {
    setIsTxUnlockOpen(true);
  };

  const handleTxUnlockComplete = (
    _mode: string,
    status: TransactionLockStatusResponse,
  ) => {
    setTxLockStatus(status);
  };

  const resetRefreshTimer = (fields: string[]) => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }
    refreshTimer = setInterval(
      () => refresh(false, fields),
      REFRESH_BALANCE_MS,
    );
  };

  // configure a CTA to prompt the user to set their password if the wallet
  // is in custody and has a crypto balance
  const showPasswordCta = async () => {
    enqueueSnackbar(
      <Typography variant="body2" className={classes.fundWalletCtaText}>
        {t('wallet.claimWalletCta')}
      </Typography>,
      {
        variant: 'info',
        persist: true,
        key: CustodyState.CUSTODY,
        preventDuplicate: true,
        action: (
          <Button
            variant="text"
            size="small"
            color="primary"
            className={classes.snackBarButton}
            onClick={handleClaimWallet}
          >
            {t('wallet.claimWalletCtaButton')}
          </Button>
        ),
      },
    );
  };
  let showPasswordCtaTimer: NodeJS.Timeout | undefined;

  const handleClaimWallet = async () => {
    closeSnackbar(CustodyState.CUSTODY);
    if (onClaimWallet) {
      onClaimWallet();
    }
  };

  const handleHealthCheckClicked = async (enabled: boolean) => {
    await localStorageWrapper.setItem(
      DomainProfileKeys.BannerHealthCheck,
      String(Date.now()),
    );
    if (enabled && onSecurityCenterClicked) {
      onSecurityCenterClicked();
    }
    setBanner(undefined);
  };

  const handleCloseFundingModal = () => {
    setFundingModalTitle(undefined);
    setFundingModalIcon(undefined);
  };

  const handleTabChange = async (
    _event: React.SyntheticEvent,
    newValue: string,
  ) => {
    const tv = newValue as ClientTabType;
    setIsTransactionsLoading(true);
    setTabValue(tv);
    if (address && tv === ClientTabType.Domains) {
      void handleLoadDomains(true);
    }

    // reset the refresh timer and call refresh
    resetRefreshTimer(getTabFields(tv));
    await refresh(true, getTabFields(tv));

    // transactions have been loaded
    setIsTransactionsLoading(false);
  };

  const handleRetrieveOwnerDomains = async (
    ownerAddress: string,
    reload?: boolean,
  ) => {
    const retData: {domains: string[]; cursor?: string} = {
      domains: [],
      cursor: undefined,
    };
    try {
      // load domains that are contained by this Unstoppable Wallet instance
      const domainData = await getOwnerDomains(
        ownerAddress,
        reload ? undefined : (cursor as string),
        true,
        true,
      );
      if (domainData) {
        retData.domains = domainData.data.map(f => f.domain);
        retData.cursor = domainData.meta.pagination.cursor;
        if (reload) {
          const marketData = await getProfileData(retData.domains[0], [
            DomainFieldTypes.Portfolio,
          ]);
          setDomainsValue(
            (marketData?.portfolio?.wallet?.valueAmt ||
              marketData?.portfolio?.account?.valueAmt ||
              0) / 100,
          );
        }
      }
    } catch (e) {
      notifyEvent(e, 'error', 'Profile', 'Fetch', {
        msg: 'error retrieving owner domains',
      });
    }
    return retData;
  };

  const handleLoadDomains = async (reload?: boolean) => {
    if (!address) {
      return;
    }
    if (retrievedAll && !reload) {
      return;
    }
    setIsDomainsLoading(true);
    const resp = await handleRetrieveOwnerDomains(address, reload);
    if (resp.domains.length) {
      if (reload) {
        setRetrievedAll(false);
        setDomains([...resp.domains]);
      } else {
        setDomains(d => [...d, ...resp.domains]);
      }
      setCursor(resp.cursor);
      if (resp.domains.length < DOMAIN_LIST_PAGE_SIZE) {
        setRetrievedAll(true);
      }
    } else {
      setRetrievedAll(true);
    }
    setIsDomainsLoading(false);
  };

  const handleDomainClick = (v: string) => {
    setDomainToManage(v);
  };

  const handleDomainUpdate = () => {
    void handleLoadDomains(true);
    enqueueSnackbar(t('manage.updatedDomainSuccess'), {variant: 'success'});
  };

  const handleTokenClicked = (token: TokenEntry) => {
    setSelectedToken(token);
  };

  const handleClickedSend = () => {
    if (!accessToken) {
      if (!cryptoValue) {
        setFundingModalTitle(t('common.send'));
        setFundingModalIcon(<SendIcon />);
      } else if (onClaimWallet) {
        onClaimWallet();
      }

      return;
    }

    setIsSend(true);
    setIsReceive(false);
    setIsBuy(false);
    setIsSwap(false);
  };

  const handleClickedSwap = () => {
    if (!accessToken) {
      if (!cryptoValue) {
        setFundingModalTitle(t('swap.title'));
        setFundingModalIcon(<SwapHorizIcon />);
      } else if (onClaimWallet) {
        onClaimWallet();
      }
      return;
    }

    setIsSwap(true);
    setIsBuy(false);
    setIsSend(false);
    setIsReceive(false);
  };

  const handleClickedBuy = () => {
    setIsBuy(true);
    setIsSend(false);
    setIsReceive(false);
    setIsSwap(false);
  };

  const handleClickedReceive = () => {
    setIsReceive(true);
    setIsSend(false);
    setIsBuy(false);
    setIsSwap(false);
  };

  const handleCancelAction = () => {
    // restore the wallet home screen
    setIsSend(false);
    setIsReceive(false);
    setIsBuy(false);
    setIsSwap(false);
  };

  const handleCancelToken = () => {
    setSelectedToken(undefined);
    handleCancelAction();
  };

  const handleLearnMoreClicked = () => {
    window.open(config.WALLETS.LANDING_PAGE_URL, '_blank');
  };

  const getTabFields = (tv: ClientTabType) => {
    return tv === ClientTabType.Transactions
      ? ['native', 'price', 'token', 'tx']
      : ['native', 'price', 'token'];
  };

  return (
    <Box className={classes.container}>
      <Box className={classes.walletContainer}>
        {isSend && accessToken ? (
          <Box className={classes.panelContainer}>
            <Send
              accessToken={accessToken}
              onCancelClick={handleCancelAction}
              onClickBuy={handleClickedBuy}
              onClickReceive={handleClickedReceive}
              wallets={wallets}
              initialSelectedToken={selectedToken}
            />
          </Box>
        ) : isSwap && accessToken ? (
          <Box className={classes.panelContainer}>
            <Swap
              accessToken={accessToken}
              onCancelClick={handleCancelAction}
              onClickBuy={handleClickedBuy}
              onClickReceive={handleClickedReceive}
              wallets={wallets}
              initialSelectedToken={selectedToken}
            />
          </Box>
        ) : isReceive ? (
          <Box className={classes.panelContainer}>
            <Receive
              onCancelClick={handleCancelAction}
              wallets={wallets}
              initialSelectedToken={selectedToken}
            />
          </Box>
        ) : isBuy ? (
          <Box className={classes.panelContainer}>
            <Buy
              onCancelClick={handleCancelAction}
              isSellEnabled={isSellEnabled}
              wallets={wallets}
            />
          </Box>
        ) : selectedToken && accessToken ? (
          <Box className={classes.panelContainer}>
            <TokenDetail
              accessToken={accessToken}
              token={selectedToken}
              onCancelClick={handleCancelToken}
              onClickReceive={handleClickedReceive}
              onClickSwap={handleClickedSwap}
              onClickSend={handleClickedSend}
            />
          </Box>
        ) : (
          <TabContext value={tabValue as ClientTabType}>
            {cryptoValue ? (
              <Box className={classes.header}>
                <Box className={classes.balanceContainer}>
                  <Typography variant="h3">
                    {(tabValue === ClientTabType.Domains
                      ? // show only domain value on domain tab
                        domainsValue
                      : tabValue === ClientTabType.Portfolio
                      ? // show only crypto value on crypto tab
                        cryptoValue
                      : tabValue === ClientTabType.Transactions &&
                        // show aggregate value (domains + crypto) on activity tab
                        domainsValue + cryptoValue
                    ).toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    })}
                  </Typography>
                </Box>
                <Grid container spacing={2} className={classes.actionContainer}>
                  <Grid item>
                    <ActionButton
                      onClick={handleClickedReceive}
                      size="medium"
                      variant="receive"
                    />
                  </Grid>
                  <Grid item>
                    <ActionButton
                      onClick={handleClickedSend}
                      size="medium"
                      variant="send"
                    />
                  </Grid>
                  <Grid item>
                    <ActionButton
                      onClick={handleClickedSwap}
                      size="medium"
                      variant="swap"
                    />
                  </Grid>
                  <Grid item>
                    <ActionButton
                      onClick={handleClickedBuy}
                      size="medium"
                      variant="buySell"
                    />
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box className={classes.balanceContainer}>
                <Typography
                  variant="h3"
                  color={theme.palette.neutralShades[500]}
                >
                  {(tabValue === ClientTabType.Domains
                    ? // show only domain value on domain tab
                      domainsValue
                    : tabValue === ClientTabType.Portfolio
                    ? // show only crypto value on crypto tab
                      cryptoValue
                    : tabValue === ClientTabType.Transactions &&
                      // show aggregate value (domains + crypto) on activity tab
                      domainsValue + cryptoValue
                  ).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </Typography>
              </Box>
            )}
            <Grid container className={classes.portfolioContainer}>
              <Grid item xs={12} height="100%">
                <TabPanel
                  value={ClientTabType.Portfolio}
                  className={classes.tabContentItem}
                >
                  {cryptoValue ? (
                    <Box className={classes.listContainer}>
                      <TokensPortfolio
                        banner={banner}
                        wallets={wallets}
                        isOwner={true}
                        verified={true}
                        fullHeight={isMobile}
                        onTokenClick={handleTokenClicked}
                      />
                    </Box>
                  ) : (
                    <Box mt={2}>
                      <LetsGetStartedCta
                        onBuyClicked={handleClickedBuy}
                        onReceiveClicked={handleClickedReceive}
                      />
                    </Box>
                  )}
                </TabPanel>
                <TabPanel
                  value={ClientTabType.Domains}
                  className={classes.tabContentItem}
                >
                  {domains.length > 0 ? (
                    <Box
                      className={cx(
                        classes.domainListContainer,
                        classes.listContainer,
                      )}
                    >
                      <DomainProfileList
                        id={'wallet-domain-list'}
                        domains={domains}
                        isLoading={isDomainsLoading}
                        withInfiniteScroll={true}
                        setWeb3Deps={setWeb3Deps}
                        onLastPage={handleLoadDomains}
                        hasMore={!retrievedAll}
                        onClick={handleDomainClick}
                        rowStyle={classes.domainRow}
                        itemsPerPage={DOMAIN_LIST_PAGE_SIZE}
                      />
                    </Box>
                  ) : (
                    <Modal
                      title={t('wallet.addDomain')}
                      open={true}
                      fullScreen={fullScreenModals}
                      titleStyle={classes.modalTitleStyle}
                      onClose={() => setTabValue(ClientTabType.Portfolio)}
                    >
                      <ReceiveDomainModal />
                    </Modal>
                  )}
                </TabPanel>
                <TabPanel
                  value={ClientTabType.Transactions}
                  className={classes.tabContentItem}
                >
                  <Box className={classes.listContainer}>
                    <DomainWalletTransactions
                      id="unstoppable-wallet"
                      wallets={wallets}
                      isOwner={true}
                      isWalletLoading={isWalletLoading || isTransactionsLoading}
                      verified={true}
                      fullScreenModals={fullScreenModals}
                      accessToken={accessToken}
                      onBack={() => setTabValue(ClientTabType.Portfolio)}
                      onBuyClicked={handleClickedBuy}
                      onReceiveClicked={handleClickedReceive}
                      fullHeight={isMobile}
                    />
                  </Box>
                </TabPanel>
              </Grid>
            </Grid>
            <Box className={classes.footer}>
              <Box />
              {cryptoValue ? (
                <TabList
                  orientation="horizontal"
                  onChange={handleTabChange}
                  variant="fullWidth"
                  className={classes.tabList}
                  indicatorColor="primary"
                  textColor="primary"
                >
                  <Tab
                    icon={<PaidOutlinedIcon />}
                    value={ClientTabType.Portfolio}
                    label={t('tokensPortfolio.crypto')}
                    iconPosition="start"
                  />
                  <Tab
                    icon={<ListOutlinedIcon />}
                    value={ClientTabType.Domains}
                    label={t('common.domains')}
                    iconPosition="start"
                  />
                  <Tab
                    icon={<HistoryIcon />}
                    value={ClientTabType.Transactions}
                    label={t('activity.title')}
                    iconPosition="start"
                  />
                </TabList>
              ) : (
                <Button
                  variant="text"
                  size="small"
                  fullWidth
                  color="inherit"
                  onClick={handleLearnMoreClicked}
                >
                  {t('common.learnMore')}
                </Button>
              )}
            </Box>
          </TabContext>
        )}
      </Box>
      {domainToManage && (
        <DomainProfileModal
          domain={domainToManage}
          address={address}
          open={true}
          fullScreen={fullScreenModals}
          onClose={() => setDomainToManage(undefined)}
          onUpdate={handleDomainUpdate}
        />
      )}
      {fundingModalTitle && (
        <Modal
          title={fundingModalTitle}
          open={true}
          fullScreen={fullScreenModals}
          titleStyle={classes.modalTitleStyle}
          onClose={handleCloseFundingModal}
        >
          <FundWalletModal
            icon={fundingModalIcon}
            onBuyClicked={() => {
              handleClickedBuy();
              handleCloseFundingModal();
            }}
            onReceiveClicked={() => {
              handleClickedReceive();
              handleCloseFundingModal();
            }}
          />
        </Modal>
      )}
      {isTxUnlockOpen && accessToken && (
        <Modal
          open={true}
          title={t('wallet.txLockManual')}
          onClose={() => setIsTxUnlockOpen(false)}
        >
          <SetupTxLockModal
            accessToken={accessToken}
            onClose={() => setIsTxUnlockOpen(false)}
            onComplete={handleTxUnlockComplete}
          />
        </Modal>
      )}
    </Box>
  );
};

export type ClientProps = {
  accessToken?: string;
  wallets: SerializedWalletBalance[];
  paymentConfigStatus?: SerializedIdentityResponse;
  fullScreenModals?: boolean;
  onClaimWallet?: () => void;
  onSecurityCenterClicked?: () => void;
  onRefresh: (showSpinner?: boolean, fields?: string[]) => Promise<void>;
  isHeaderClicked: boolean;
  isWalletLoading?: boolean;
  setIsHeaderClicked?: (v: boolean) => void;
  externalBanner?: React.ReactNode;
};

export enum ClientTabType {
  Domains = 'domains',
  Portfolio = 'portfolio',
  Transactions = 'txns',
}

export const getMinClientHeight = (isMobile: boolean, offset = 0) => {
  return isMobile ? `calc(100dvh - 80px - ${offset}px)` : `${550 + offset}px`;
};
