import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HistoryIcon from '@mui/icons-material/History';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import SendIcon from '@mui/icons-material/Send';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import useFireblocksState from '../../../../hooks/useFireblocksState';
import type {SerializedWalletBalance} from '../../../../lib';
import {useTranslationContext} from '../../../../lib';
import {getFireBlocksClient} from '../../../../lib/fireBlocks/client';
import {getBootstrapState} from '../../../../lib/fireBlocks/storage/state';
import {DomainWalletTransactions} from '../../../Wallet';
import {TokensPortfolio} from '../../../Wallet/TokensPortfolio';
import Buy from './Buy';
import Receive from './Receive';
import Send from './Send';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  walletContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
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
    marginTop: theme.spacing(-1),
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
  },
  actionText: {
    color: theme.palette.primary.main,
  },
  tabList: {
    marginTop: theme.spacing(-3),
    marginRight: theme.spacing(-4),
  },
  tabContentItem: {
    marginLeft: theme.spacing(-3),
    marginRight: theme.spacing(-3),
  },
}));

export const Client: React.FC<ClientProps> = ({
  accessToken,
  wallets,
  onRefresh,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  // wallet state variables
  const [client, setClient] = useState<IFireblocksNCW>();
  const [state, saveState] = useFireblocksState();

  // component state variables
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSend, setIsSend] = useState(false);
  const [isReceive, setIsReceive] = useState(false);
  const [isBuy, setIsBuy] = useState(false);
  const [tabValue, setTabValue] = useState(ClientTabType.Portfolio);

  useEffect(() => {
    void handleLoadClient();
  }, []);

  const handleLoadClient = async () => {
    // retrieve client state
    const clientState = getBootstrapState(state);
    if (!clientState) {
      throw new Error('invalid configuration');
    }

    // initialize and set the client
    setClient(
      await getFireBlocksClient(clientState.deviceId, accessToken, {
        state,
        saveState,
      }),
    );

    // loading complete
    setIsLoaded(true);
  };

  const handleTabChange = async (
    _event: React.SyntheticEvent,
    newValue: string,
  ) => {
    const tv = newValue as ClientTabType;
    setTabValue(tv);
    await onRefresh();
  };

  const handleClickedSend = () => {
    setIsSend(true);
  };

  const handleClickedBuy = () => {
    setIsBuy(true);
  };

  const handleClickedReceive = () => {
    setIsReceive(true);
  };

  const handleCancel = () => {
    setIsSend(false);
    setIsReceive(false);
    setIsBuy(false);
  };

  return (
    <Box className={classes.container}>
      {isLoaded ? (
        <Box className={classes.walletContainer}>
          {isSend ? (
            <Send
              client={client!}
              accessToken={accessToken}
              onCancelClick={handleCancel}
              wallets={wallets}
            />
          ) : isReceive ? (
            <Receive onCancelClick={handleCancel} wallets={wallets} />
          ) : isBuy ? (
            <Buy onCancelClick={handleCancel} wallets={wallets} />
          ) : (
            <TabContext value={tabValue as ClientTabType}>
              <Box className={classes.balanceContainer}>
                <Typography variant="h3">
                  {wallets
                    .map(w => w.totalValueUsdAmt || 0)
                    .reduce((p, c) => p + c, 0)
                    .toLocaleString('en-US', {
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
                  <Typography variant="body1" className={classes.actionText}>
                    {t('common.send')}
                  </Typography>
                </Box>
                <Box
                  className={classes.actionContainer}
                  onClick={handleClickedReceive}
                >
                  <AddOutlinedIcon className={classes.actionIcon} />
                  <Typography variant="body1" className={classes.actionText}>
                    {t('common.receive')}
                  </Typography>
                </Box>
                <Box
                  className={classes.actionContainer}
                  onClick={handleClickedBuy}
                >
                  <AttachMoneyIcon className={classes.actionIcon} />
                  <Typography variant="body1" className={classes.actionText}>
                    {t('common.buy')}
                  </Typography>
                </Box>
              </Box>
              <Grid container className={classes.portfolioContainer}>
                <Grid item xs={12}>
                  <TabPanel
                    value={ClientTabType.Portfolio}
                    className={classes.tabContentItem}
                  >
                    <TokensPortfolio wallets={wallets} isOwner={true} />
                  </TabPanel>
                  <TabPanel
                    value={ClientTabType.Transactions}
                    className={classes.tabContentItem}
                  >
                    <DomainWalletTransactions
                      id="unstoppable-wallet"
                      wallets={wallets}
                      isOwner={true}
                      accessToken={accessToken}
                    />
                  </TabPanel>
                </Grid>
              </Grid>
              <TabList
                orientation="horizontal"
                onChange={handleTabChange}
                variant="fullWidth"
                className={classes.tabList}
              >
                <Tab
                  icon={<PaidOutlinedIcon />}
                  value={ClientTabType.Portfolio}
                  label={t('tokensPortfolio.title')}
                  iconPosition="start"
                />
                <Tab
                  icon={<HistoryIcon />}
                  value={ClientTabType.Transactions}
                  label={t('activity.title')}
                  iconPosition="start"
                />
              </TabList>
            </TabContext>
          )}
        </Box>
      ) : (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export type ClientProps = {
  accessToken: string;
  wallets: SerializedWalletBalance[];
  onRefresh: () => Promise<void>;
};

export enum ClientTabType {
  Portfolio = 'portfolio',
  Transactions = 'txns',
}