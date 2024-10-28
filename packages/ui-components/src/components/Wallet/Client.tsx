import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HistoryIcon from '@mui/icons-material/History';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import SendIcon from '@mui/icons-material/Send';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Markdown from 'markdown-to-jsx';
import {useSnackbar} from 'notistack';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {DomainWalletTransactions} from '.';
import {
  DOMAIN_LIST_PAGE_SIZE,
  getOwnerDomains,
  getProfileData,
} from '../../actions';
import {useWeb3Context} from '../../hooks';
import useFireblocksState from '../../hooks/useFireblocksState';
import type {SerializedWalletBalance} from '../../lib';
import {
  DomainFieldTypes,
  WALLET_CARD_HEIGHT,
  WalletPaletteOwner,
  useTranslationContext,
} from '../../lib';
import {notifyEvent} from '../../lib/error';
import {getFireBlocksClient} from '../../lib/fireBlocks/client';
import {getBootstrapState} from '../../lib/fireBlocks/storage/state';
import type {SerializedIdentityResponse} from '../../lib/types/identity';
import {isEthAddress} from '../Chat/protocol/resolution';
import {DomainProfileList} from '../Domain';
import {DomainProfileModal} from '../Manage';
import Modal from '../Modal';
import Buy from './Buy';
import Receive from './Receive';
import ReceiveDomainModal from './ReceiveDomainModal';
import Send from './Send';
import {TokensPortfolio} from './TokensPortfolio';

const useStyles = makeStyles<{isMobile: boolean}>()(
  (theme: Theme, {isMobile}) => ({
    container: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: `${getMinClientHeight(isMobile)}px`,
    },
    walletContainer: {
      display: 'flex',
      flexDirection: 'column',
      width: '375px',
      [theme.breakpoints.down('sm')]: {
        width: '330px',
      },
      height: '100%',
    },
    mainActionsContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(2),
    },
    balanceContainer: {
      display: 'flex',
      justifyContent: 'center',
    },
    actionContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.palette.primaryShades[100],
      padding: theme.spacing(1),
      borderRadius: theme.shape.borderRadius,
      marginRight: theme.spacing(2),
      width: '100px',
      cursor: 'pointer',
      [theme.breakpoints.down('sm')]: {
        width: '70px',
      },
    },
    domainListContainer: {
      color: WalletPaletteOwner.text.primary,
      display: 'flex',
      backgroundImage: `linear-gradient(${WalletPaletteOwner.background.gradient.start}, ${WalletPaletteOwner.background.gradient.end})`,
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(2),
      height: `${WALLET_CARD_HEIGHT + 2}px`,
      marginBottom: theme.spacing(2),
      marginTop: '15px',
    },
    domainRow: {
      display: 'flex',
      justifyContent: 'space-between',
      textDecoration: 'none !important',
      alignItems: 'center',
      cursor: 'pointer',
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      color: WalletPaletteOwner.text.primary,
      '&:visited': {
        color: WalletPaletteOwner.text.primary,
      },
      '&:hover': {
        '& p': {
          color: WalletPaletteOwner.text.primary,
        },
        '& svg': {
          color: WalletPaletteOwner.text.primary,
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
    },
    actionIcon: {
      color: theme.palette.primary.main,
      width: '50px',
      height: '50px',
      [theme.breakpoints.down('sm')]: {
        width: '35px',
        height: '35px',
      },
    },
    actionText: {
      color: theme.palette.primary.main,
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
      [theme.breakpoints.down('sm')]: {
        marginLeft: theme.spacing(-4),
        marginRight: theme.spacing(-4),
      },
    },
    footer: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
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
  }),
);

export const Client: React.FC<ClientProps> = ({
  accessToken,
  wallets,
  paymentConfigStatus,
  fullScreenModals,
  onRefresh,
  setIsHeaderClicked,
  isHeaderClicked,
}) => {
  // mobile behavior flag
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // style and translation
  const {classes} = useStyles({isMobile});
  const [t] = useTranslationContext();
  const {enqueueSnackbar} = useSnackbar();

  // wallet state variables
  const [state, saveState] = useFireblocksState();
  const {setWeb3Deps} = useWeb3Context();
  const cryptoValue = wallets
    .map(w => w.totalValueUsdAmt || 0)
    .reduce((p, c) => p + c, 0);
  const isSellEnabled = cryptoValue >= 15;

  // component state variables
  const [isSend, setIsSend] = useState(false);
  const [isReceive, setIsReceive] = useState(false);
  const [isBuy, setIsBuy] = useState(false);
  const [tabValue, setTabValue] = useState(ClientTabType.Portfolio);

  // domain list state
  const [domains, setDomains] = useState<string[]>([]);
  const [domainsValue, setDomainsValue] = useState<number>(0);
  const [cursor, setCursor] = useState<number | string>();
  const [isLoading, setIsLoading] = useState(true);
  const [retrievedAll, setRetrievedAll] = useState(false);
  const [domainToManage, setDomainToManage] = useState<string>();

  // owner address
  const address = wallets.find(w => isEthAddress(w.address))?.address;

  useEffect(() => {
    if (!isHeaderClicked || !setIsHeaderClicked) {
      return;
    }
    if (address) {
      void handleLoadDomains(true);
    }
    setIsHeaderClicked(false);
    void handleCancel();
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

  const getClient = async () => {
    // retrieve client state
    const clientState = getBootstrapState(state);
    if (!clientState) {
      throw new Error('invalid configuration');
    }

    // initialize and set the client
    return await getFireBlocksClient(clientState.deviceId, accessToken, {
      state,
      saveState,
    });
  };

  const handleTabChange = async (
    _event: React.SyntheticEvent,
    newValue: string,
  ) => {
    const tv = newValue as ClientTabType;
    setTabValue(tv);
    if (address && tv === ClientTabType.Domains) {
      void handleLoadDomains(true);
    }
    await onRefresh();
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
    setIsLoading(true);
    const resp = await handleRetrieveOwnerDomains(address, reload);
    if (resp.domains.length) {
      if (reload) {
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
    setIsLoading(false);
  };

  const handleDomainClick = (v: string) => {
    setDomainToManage(v);
  };

  const handleDomainUpdate = () => {
    void handleLoadDomains(true);
    enqueueSnackbar(t('manage.updatedDomainSuccess'), {variant: 'success'});
  };

  const handleClickedSend = () => {
    setIsSend(true);
    setIsReceive(false);
    setIsBuy(false);
  };

  const handleClickedBuy = () => {
    setIsBuy(true);
    setIsSend(false);
    setIsReceive(false);
  };

  const handleClickedReceive = () => {
    setIsReceive(true);
    setIsSend(false);
    setIsBuy(false);
  };

  const handleCancel = async () => {
    // restore the wallet home screen
    setIsSend(false);
    setIsReceive(false);
    setIsBuy(false);

    // refresh portfolio data
    await onRefresh();
  };

  return (
    <Box className={classes.container}>
      <Box className={classes.walletContainer}>
        {isSend ? (
          <Box className={classes.panelContainer}>
            <Send
              getClient={getClient}
              accessToken={accessToken}
              onCancelClick={handleCancel}
              onClickBuy={handleClickedBuy}
              onClickReceive={handleClickedReceive}
              wallets={wallets}
            />
          </Box>
        ) : isReceive ? (
          <Box className={classes.panelContainer}>
            <Receive onCancelClick={handleCancel} wallets={wallets} />
          </Box>
        ) : isBuy ? (
          <Box className={classes.panelContainer}>
            <Buy
              onCancelClick={handleCancel}
              isSellEnabled={isSellEnabled}
              wallets={wallets}
            />
          </Box>
        ) : (
          <TabContext value={tabValue as ClientTabType}>
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
            <Box className={classes.mainActionsContainer}>
              <Box
                className={classes.actionContainer}
                onClick={handleClickedSend}
              >
                <SendIcon className={classes.actionIcon} />
                <Typography
                  variant={isMobile ? 'caption' : 'body1'}
                  className={classes.actionText}
                >
                  {t('common.send')}
                </Typography>
              </Box>
              <Box
                className={classes.actionContainer}
                onClick={handleClickedReceive}
              >
                <AddOutlinedIcon className={classes.actionIcon} />
                <Typography
                  variant={isMobile ? 'caption' : 'body1'}
                  className={classes.actionText}
                >
                  {t('common.receive')}
                </Typography>
              </Box>
              <Box mr={-2}>
                <Box
                  className={classes.actionContainer}
                  onClick={handleClickedBuy}
                >
                  <AttachMoneyIcon className={classes.actionIcon} />
                  <Typography
                    variant={isMobile ? 'caption' : 'body1'}
                    className={classes.actionText}
                  >
                    {t(isSellEnabled ? 'common.buySell' : 'common.buy')}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Grid container className={classes.portfolioContainer}>
              <Grid item xs={12}>
                <TabPanel
                  value={ClientTabType.Portfolio}
                  className={classes.tabContentItem}
                >
                  <TokensPortfolio
                    wallets={wallets}
                    isOwner={true}
                    verified={true}
                  />
                </TabPanel>
                <TabPanel
                  value={ClientTabType.Domains}
                  className={classes.tabContentItem}
                >
                  {domains.length > 0 ? (
                    <Box className={classes.domainListContainer}>
                      <DomainProfileList
                        id={'wallet-domain-list'}
                        domains={domains}
                        isLoading={isLoading}
                        withInfiniteScroll={true}
                        setWeb3Deps={setWeb3Deps}
                        onLastPage={handleLoadDomains}
                        hasMore={!retrievedAll}
                        onClick={handleDomainClick}
                        rowStyle={classes.domainRow}
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
                  <DomainWalletTransactions
                    id="unstoppable-wallet"
                    wallets={wallets}
                    isOwner={true}
                    verified={true}
                    fullScreenModals={fullScreenModals}
                    accessToken={accessToken}
                    onBack={() => setTabValue(ClientTabType.Portfolio)}
                    onBuyClicked={handleClickedBuy}
                    onReceiveClicked={handleClickedReceive}
                  />
                </TabPanel>
              </Grid>
            </Grid>
            <Box className={classes.footer}>
              <Box />
              <TabList
                orientation="horizontal"
                onChange={handleTabChange}
                variant="fullWidth"
                className={classes.tabList}
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
    </Box>
  );
};

export type ClientProps = {
  accessToken: string;
  wallets: SerializedWalletBalance[];
  paymentConfigStatus?: SerializedIdentityResponse;
  fullScreenModals?: boolean;
  onRefresh: () => Promise<void>;
  isHeaderClicked: boolean;
  setIsHeaderClicked?: (v: boolean) => void;
};

export enum ClientTabType {
  Domains = 'domains',
  Portfolio = 'portfolio',
  Transactions = 'txns',
}

export const getMinClientHeight = (isMobile: boolean) => {
  return isMobile ? 515 : 550;
};
