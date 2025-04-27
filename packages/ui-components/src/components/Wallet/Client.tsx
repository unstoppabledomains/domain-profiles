import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import SendIcon from '@mui/icons-material/Send';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {Mutex} from 'async-mutex';
import Bluebird from 'bluebird';
import cloneDeep from 'lodash/cloneDeep';
import Markdown from 'markdown-to-jsx';
import {useSnackbar} from 'notistack';
import numeral from 'numeral';
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
import {
  getWalletCollectionNfts,
  getWalletNftCollections,
} from '../../actions/nftActions';
import {getWalletStorageData} from '../../actions/walletStorageActions';
import {useUnstoppableMessaging, useWeb3Context} from '../../hooks';
import useFireblocksState from '../../hooks/useFireblocksState';
import type {Nft, SerializedWalletBalance, TokenEntry} from '../../lib';
import {
  CustodyState,
  DomainFieldTypes,
  DomainProfileKeys,
  TokenType,
  WALLET_CARD_HEIGHT,
  getAccountIdFromBootstrapState,
  getBootstrapState,
  isLocked,
  useTranslationContext,
} from '../../lib';
import {notifyEvent} from '../../lib/error';
import type {
  TokenRefreshResponse,
  TransactionLockStatusResponse,
} from '../../lib/types/fireBlocks';
import type {SerializedIdentityResponse} from '../../lib/types/identity';
import {UnstoppableMessaging, localStorageWrapper} from '../Chat';
import CallToAction from '../Chat/modal/CallToAction';
import {isEthAddress} from '../Chat/protocol/resolution';
import {DomainProfileList} from '../Domain';
import {DomainProfileModal} from '../Manage';
import Modal from '../Modal';
import NftModal from '../TokenGallery/NftModal';
import ActionButton from './ActionButton';
import Buy from './Buy';
import FundWalletModal from './FundWalletModal';
import {LetsGetStartedCta} from './LetsGetStartedCta';
import NftCollectionDetail from './NftCollectionDetail';
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
      alignItems: 'center',
    },
    balanceText: {
      position: 'relative',
    },
    snackBarButton: {
      marginLeft: theme.spacing(1),
      color:
        theme.palette.primary.contrastText ||
        theme.palette.getContrastText(theme.palette.primary.main),
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
    refreshContainer: {
      position: 'absolute',
      right: theme.spacing(-4),
      top: theme.spacing(-0.75),
    },
    refreshIcon: {
      color: theme.palette.wallet.text.secondary,
      width: '20px',
      height: '20px',
    },
    loadingSpinner: {
      width: '20px',
      height: '20px',
      marginRight: theme.spacing(1),
      color: theme.palette.wallet.text.secondary,
    },
  }),
);

export const Client: React.FC<ClientProps> = ({
  accessToken,
  wallets,
  paymentConfigStatus,
  fullScreenModals,
  onClaimWallet,
  onRefresh,
  onSecurityCenterClicked,
  onUseExistingAccount,
  onLoginInitiated,
  setIsHeaderClicked,
  setShowMessagesInHeader,
  isHeaderClicked,
  isWalletLoading,
  externalBanner,
  showMessages,
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
  const clientState = getBootstrapState(state);
  const [fundingModalTitle, setFundingModalTitle] = useState<string>();
  const [fundingModalIcon, setFundingModalIcon] = useState<React.ReactNode>();
  const [banner, setBanner] = useState<React.ReactNode>(externalBanner);
  const {setWeb3Deps, setShowPinCta, setTxLockStatus, txLockStatus} =
    useWeb3Context({enforcePin: true});
  const cryptoValue = wallets
    .map(w => w.totalValueUsdAmt || 0)
    .reduce((p, c) => p + c, 0);
  const isSellEnabled = cryptoValue >= 15;
  const refreshMutex = new Mutex();

  // chat state
  const {setOpenChat, openChat, isChatReady} = useUnstoppableMessaging();
  const [isXmtpIntroConfirmed, setIsXmtpIntroConfirmed] = useState(false);

  // component state variables
  const [isChat, setIsChat] = useState(false);
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
  const [collectiblesValue, setCollectiblesValue] = useState<number>(0);
  const [cursor, setCursor] = useState<number | string>();
  const [isDomainsLoading, setIsDomainsLoading] = useState(true);
  const [retrievedAll, setRetrievedAll] = useState(false);
  const [domainToManage, setDomainToManage] = useState<string>();

  // NFT gallery state variables
  const [nftWallets, setNftWallets] = useState<SerializedWalletBalance[]>([]);
  const [selectedNftCollection, setSelectedNftCollection] =
    useState<TokenEntry>();
  const [selectedNft, setSelectedNft] = useState<Nft>();
  const [isNftModalOpen, setIsNftModalOpen] = useState(false);
  const [isNftLoading, setIsNftLoading] = useState(false);

  // owner address
  const address = wallets.find(w => isEthAddress(w.address))?.address;

  // empty state flag
  const isEmptyState =
    // check crypto value
    !cryptoValue &&
    // check collectibles value
    !collectiblesValue &&
    // ensure domains are loaded
    !domainsValue &&
    domains.length === 0;

  // initialize wallet security features
  useAsyncEffect(async () => {
    if (!accessToken) {
      return;
    }

    // retrieve API calls concurrently
    const accountId = getAccountIdFromBootstrapState(clientState);
    const [lockStatus] = await Promise.all([
      getTransactionLockStatus(accessToken),
      accountId
        ? getWalletStorageData(accessToken, accountId, true)
        : undefined,
    ]);

    // load messaging intro status
    if (
      await localStorageWrapper.getItem(DomainProfileKeys.MessagingIntro, {
        type: 'wallet',
        accessToken,
        accountId: getAccountIdFromBootstrapState(clientState),
      })
    ) {
      setIsXmtpIntroConfirmed(true);
    }

    // set wallet lock status
    setTxLockStatus(lockStatus);
  }, [accessToken]);

  useEffect(() => {
    if (setShowMessagesInHeader) {
      setShowMessagesInHeader(isEmptyState);
    }
  }, [setShowMessagesInHeader, isEmptyState]);

  // banner management
  useAsyncEffect(async () => {
    // prioritize the lock state banner if required
    if (txLockStatus?.enabled) {
      setBanner(
        <WalletBanner
          backgroundColor={theme.palette.primary.main}
          textColor={theme.palette.white}
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
      {
        type: 'wallet',
        accessToken,
        accountId: getAccountIdFromBootstrapState(clientState),
      },
    );
    if (!isHealthCheckCleared && onSecurityCenterClicked) {
      setBanner(
        <Tooltip arrow title={t('wallet.securityHealthCheckDescription')}>
          <Box>
            <WalletBanner
              backgroundColor={theme.palette.primary.main}
              textColor={theme.palette.white}
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

    // look up available domains if the address is present
    if (address) {
      void handleLoadDomains(true);
    }

    // reset the header clicked state
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

  useAsyncEffect(async () => {
    if (isChat && isChatReady && isXmtpIntroConfirmed) {
      setOpenChat(t('push.messages'));
    }
  }, [isChat, isChatReady, isXmtpIntroConfirmed]);

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

  const handleTransferNft = (nft: Nft) => {
    setSelectedNft(nft);
    setIsNftModalOpen(false);
    setIsSend(true);
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
      {
        type: 'wallet',
        accessToken,
        accountId: getAccountIdFromBootstrapState(clientState),
      },
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
    try {
      // special handling for domain listing
      if (address && tv === ClientTabType.Domains) {
        void handleLoadDomains(true);
        return;
      }

      // special handling for collectibles listing
      if (address && tv === ClientTabType.Collectibles) {
        void handleLoadCollectibles(true);
        return;
      }

      // general handling for tab change
      await refresh(true, getTabFields(tv));
    } finally {
      // transactions have been loaded
      setIsTransactionsLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    await refresh(true, getTabFields(tabValue));
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

  const handleLoadCollectibles = async (reload?: boolean) => {
    // set loading state
    setIsNftLoading(true);

    // get the nft collections from all EVM and Solana wallets
    const walletAddresses = [
      ...new Set(
        wallets
          .filter(w => ['ETH', 'SOL'].includes(w.symbol.toUpperCase()))
          .map(w => w.address),
      ),
    ];

    // aggregate all NFT collections across chains
    const aggregatedNftWallets = cloneDeep(wallets);
    await Bluebird.map(walletAddresses, async walletAddress => {
      const nftCollections = await getWalletNftCollections(
        walletAddress,
        reload,
      );
      if (nftCollections && Object.keys(nftCollections).length > 0) {
        Object.keys(nftCollections).forEach(symbol => {
          const nftWallet = aggregatedNftWallets.find(
            w =>
              w.address.toLowerCase() === walletAddress.toLowerCase() &&
              w.symbol === symbol,
          );
          if (nftWallet) {
            nftWallet.nfts = nftCollections[symbol];
          }
        });
      }
    });

    // calculate NFT portfolio value
    const nftPortfolioValue = aggregatedNftWallets
      .map(w => w.nfts?.reduce((p, c) => p + (c.totalValueUsdAmt || 0), 0) || 0)
      .reduce((p, c) => p + c, 0);
    setCollectiblesValue(nftPortfolioValue);

    // prepare the NFT wallets for display
    setNftWallets(aggregatedNftWallets);
    setIsNftLoading(false);
  };

  const handleLoadDomains = async (reload?: boolean) => {
    // skip if no address is present
    if (!address) {
      return;
    }

    // skip if all domains have already been retrieved
    if (retrievedAll && !reload) {
      return;
    }

    // set loading state
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

  const handleNftClicked = async (collection: TokenEntry) => {
    if (collection.balance === 1 && collection.address) {
      // retrieve the single NFT and display it in modal
      const nftData = await getWalletCollectionNfts(
        collection.symbol,
        collection.walletAddress,
        collection.address,
      );
      const nftList = nftData?.[collection.symbol]?.nfts;
      if (nftList && nftList.length > 0) {
        // normalize NFT data
        const nft = nftList[0];
        nft.symbol = collection.symbol;
        setSelectedNft(nft);
        setIsNftModalOpen(true);
      }
    } else {
      // view the collection NFT list
      setSelectedNftCollection(collection);
    }
  };

  const handleCloseNftModal = () => {
    setIsNftModalOpen(false);
    setSelectedNft(undefined);
  };

  const handleViewSwapToken = (token: TokenEntry) => {
    setSelectedToken(token);
    setIsSwap(false);
  };

  const handleClickedChat = () => {
    // activate the chat panel
    setIsChat(true);

    // deactivate other panels
    setIsSend(false);
    setIsReceive(false);
    setIsBuy(false);
    setIsSwap(false);
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
    setIsChat(false);
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
    setIsChat(false);
  };

  const handleClickedBuy = () => {
    setIsBuy(true);
    setIsSend(false);
    setIsReceive(false);
    setIsSwap(false);
    setIsChat(false);
  };

  const handleClickedReceive = () => {
    setIsReceive(true);
    setIsSend(false);
    setIsBuy(false);
    setIsSwap(false);
    setIsChat(false);
  };

  const handleCancelAction = () => {
    // restore the wallet home screen
    setIsSend(false);
    setIsReceive(false);
    setIsBuy(false);
    setIsSwap(false);
    setIsChat(false);

    // if message tab was clicked, go to home
    if (tabValue === ClientTabType.Messages) {
      setTabValue(ClientTabType.Portfolio);
    }
  };

  const handleCancelToken = () => {
    setSelectedToken(undefined);
    setSelectedNft(undefined);
    handleCancelAction();
  };

  const handleCancelNftCollection = () => {
    setSelectedNftCollection(undefined);
    handleCancelAction();
  };

  const handleLearnMoreClicked = () => {
    window.open(config.WALLETS.LANDING_PAGE_URL, '_blank');
  };

  const handleXmtpLearnMoreClicked = () => {
    window.open('https://xmtp.org', '_blank');
  };

  const handleXmtpOpenInboxClicked = async () => {
    setOpenChat(t('push.messages'));
    setIsXmtpIntroConfirmed(true);
    await localStorageWrapper.setItem(
      DomainProfileKeys.MessagingIntro,
      String(Date.now()),
      {
        type: 'wallet',
        accessToken,
        accountId: getAccountIdFromBootstrapState(clientState),
      },
    );
  };

  const getTabFields = (tv: ClientTabType) => {
    return tv === ClientTabType.Transactions
      ? ['native', 'price', 'token', 'tx']
      : ['native', 'price', 'token'];
  };

  // calculate the balance amount based on the current tab
  const balanceAmount =
    tabValue === ClientTabType.Domains
      ? // show only domain value on domain tab
        domainsValue
      : tabValue === ClientTabType.Portfolio ||
        tabValue === ClientTabType.Messages
      ? // show only crypto value on crypto tab
        cryptoValue
      : tabValue === ClientTabType.Transactions
      ? // show aggregate value (domains + collectibles + crypto) on activity tab
        domainsValue + cryptoValue + collectiblesValue
      : tabValue === ClientTabType.Collectibles
      ? // show only collectibles value on collectibles tab
        collectiblesValue
      : 0;

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
              initialSelectedNft={selectedNft}
            />
          </Box>
        ) : isSwap && accessToken ? (
          <Box className={classes.panelContainer}>
            <Swap
              accessToken={accessToken}
              onCancelClick={handleCancelAction}
              onClickBuy={handleClickedBuy}
              onClickReceive={handleClickedReceive}
              onViewTokenClick={handleViewSwapToken}
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
              wallets={wallets}
              onCancelClick={handleCancelToken}
              onClickReceive={handleClickedReceive}
              onClickSwap={handleClickedSwap}
              onClickSend={handleClickedSend}
              onRefreshClicked={handleManualRefresh}
            />
          </Box>
        ) : selectedNftCollection && accessToken ? (
          <Box className={classes.panelContainer}>
            <NftCollectionDetail
              accessToken={accessToken}
              collection={selectedNftCollection}
              onCancelClick={handleCancelNftCollection}
              onTransferNft={handleTransferNft}
            />
          </Box>
        ) : (
          <TabContext value={tabValue as ClientTabType}>
            {isEmptyState ? (
              <Box className={classes.balanceContainer}>
                <Typography
                  variant="h3"
                  color={theme.palette.neutralShades[500]}
                >
                  {cryptoValue.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </Typography>
              </Box>
            ) : (
              <Box className={classes.header}>
                <Box className={classes.balanceContainer}>
                  <Typography className={classes.balanceText} variant="h3">
                    {numeral(balanceAmount).format(
                      balanceAmount < 1000 ? '$0,0.00' : '$0,0',
                    )}
                    <Box className={classes.refreshContainer}>
                      <Tooltip title={t('common.refresh')}>
                        <IconButton size="small" onClick={handleManualRefresh}>
                          <RefreshIcon className={classes.refreshIcon} />
                        </IconButton>
                      </Tooltip>
                    </Box>
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
                      disabled={txLockStatus?.enabled}
                    />
                  </Grid>
                  <Grid item>
                    <ActionButton
                      onClick={handleClickedSwap}
                      size="medium"
                      variant="swap"
                      disabled={txLockStatus?.enabled}
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
            )}
            <Grid container className={classes.portfolioContainer}>
              <Grid item xs={12} height="100%">
                <TabPanel
                  value={ClientTabType.Portfolio}
                  className={classes.tabContentItem}
                >
                  {isEmptyState ? (
                    <Box mt={2}>
                      <LetsGetStartedCta
                        onBuyClicked={handleClickedBuy}
                        onReceiveClicked={handleClickedReceive}
                        onUseExistingAccount={onUseExistingAccount}
                        onClaimInitiated={onLoginInitiated}
                      />
                    </Box>
                  ) : (
                    <Box className={classes.listContainer}>
                      <TokensPortfolio
                        tokenTypes={[
                          TokenType.Native,
                          TokenType.Erc20,
                          TokenType.Spl,
                        ]}
                        banner={banner}
                        wallets={wallets}
                        isOwner={true}
                        verified={true}
                        fullHeight={isMobile}
                        onTokenClick={handleTokenClicked}
                      />
                    </Box>
                  )}
                </TabPanel>
                <TabPanel
                  value={ClientTabType.Collectibles}
                  className={classes.tabContentItem}
                >
                  <Box className={classes.listContainer}>
                    <TokensPortfolio
                      isWalletsLoading={isNftLoading}
                      tokenTypes={[TokenType.Nft]}
                      banner={banner}
                      wallets={nftWallets}
                      isOwner={true}
                      verified={true}
                      fullHeight={isMobile}
                      onTokenClick={handleNftClicked}
                    />
                  </Box>
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
                <TabPanel
                  value={ClientTabType.Messages}
                  className={classes.tabContentItem}
                >
                  <Box className={classes.listContainer}>
                    {(!isXmtpIntroConfirmed || !openChat) && (
                      <CallToAction
                        icon="ForumOutlinedIcon"
                        title={
                          isChatReady ? (
                            t('push.yourInboxIsReady')
                          ) : (
                            <Box display="flex" alignItems="center">
                              <CircularProgress
                                className={classes.loadingSpinner}
                                size={20}
                              />
                              {t('push.preparingChat')}
                            </Box>
                          )
                        }
                        subTitle={
                          <Box width="350px">
                            {t('push.preparingChatDescription')}
                          </Box>
                        }
                        buttonText={
                          isChatReady ? t('push.openInbox') : undefined
                        }
                        handleButtonClick={
                          isChatReady ? handleXmtpOpenInboxClicked : undefined
                        }
                      >
                        <Button
                          variant="text"
                          size="small"
                          onClick={handleXmtpLearnMoreClicked}
                        >
                          {t('common.learnMore')}
                        </Button>
                      </CallToAction>
                    )}
                  </Box>
                </TabPanel>
              </Grid>
            </Grid>
            <Box className={classes.footer}>
              <Box />
              {isEmptyState ? (
                <Button
                  variant="text"
                  size="small"
                  fullWidth
                  color="inherit"
                  onClick={handleLearnMoreClicked}
                >
                  {t('common.learnMore')}
                </Button>
              ) : (
                <TabList
                  orientation="horizontal"
                  onChange={handleTabChange}
                  variant="fullWidth"
                  className={classes.tabList}
                  indicatorColor="primary"
                  textColor="primary"
                >
                  <Tab
                    icon={
                      <Tooltip title={t('tokensPortfolio.crypto')}>
                        <PaidOutlinedIcon />
                      </Tooltip>
                    }
                    value={ClientTabType.Portfolio}
                    iconPosition="start"
                  />
                  <Tab
                    icon={
                      <Tooltip title={t('wallet.gallery')}>
                        <PhotoLibraryOutlinedIcon />
                      </Tooltip>
                    }
                    value={ClientTabType.Collectibles}
                    iconPosition="start"
                  />
                  {!showMessages && (
                    <Tab
                      icon={
                        <Tooltip title={t('common.domains')}>
                          <LanguageOutlinedIcon />
                        </Tooltip>
                      }
                      value={ClientTabType.Domains}
                      iconPosition="start"
                    />
                  )}
                  <Tab
                    icon={
                      <Tooltip title={t('activity.title')}>
                        <HistoryIcon />
                      </Tooltip>
                    }
                    value={ClientTabType.Transactions}
                    iconPosition="start"
                  />
                  {showMessages && (
                    <Tab
                      icon={
                        <Tooltip title={t('push.chat')}>
                          <ChatOutlinedIcon />
                        </Tooltip>
                      }
                      onClick={handleClickedChat}
                      value={ClientTabType.Messages}
                      iconPosition="start"
                    />
                  )}
                </TabList>
              )}
            </Box>
          </TabContext>
        )}
      </Box>
      {selectedNft && isNftModalOpen && (
        <NftModal
          open={isNftModalOpen}
          nft={selectedNft}
          handleClose={handleCloseNftModal}
          handleTransferNft={handleTransferNft}
        />
      )}
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
      {showMessages && accessToken && (
        <UnstoppableMessaging
          address={address}
          silentOnboard
          hideIcon
          variant="modal"
          disableSupportBubble
          inheritStyle
          onClose={handleCancelAction}
        />
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
  onUseExistingAccount?: (emailAddress: string) => void;
  onLoginInitiated?: (
    emailAddress: string,
    password: string,
    state: TokenRefreshResponse,
  ) => void;
  isHeaderClicked: boolean;
  isWalletLoading?: boolean;
  setShowMessagesInHeader?: (v: boolean) => void;
  setIsHeaderClicked?: (v: boolean) => void;
  externalBanner?: React.ReactNode;
  showMessages?: boolean;
};

export enum ClientTabType {
  Collectibles = 'collectibles',
  Domains = 'domains',
  Messages = 'messages',
  Portfolio = 'portfolio',
  Transactions = 'txns',
}

export const getMinClientHeight = (isMobile: boolean, offset = 0) => {
  return isMobile ? `calc(100dvh - 80px - ${offset}px)` : `${550 + offset}px`;
};
