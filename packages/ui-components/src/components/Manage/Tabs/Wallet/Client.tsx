import type {IFireblocksNCW} from '@fireblocks/ncw-js-sdk';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SendIcon from '@mui/icons-material/Send';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';
import {useLocalStorage, useSessionStorage} from 'usehooks-ts';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {sendCrypto} from '../../../../actions/fireBlocksActions';
import type {SerializedWalletBalance} from '../../../../lib';
import {useTranslationContext} from '../../../../lib';
import {getFireBlocksClient} from '../../../../lib/fireBlocks/client';
import {getState} from '../../../../lib/fireBlocks/storage/state';
import {FireblocksStateKey} from '../../../../lib/types/fireBlocks';
import {TokensPortfolio} from '../../../Wallet/TokensPortfolio';
import ManageInput from '../../common/ManageInput';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  walletContainer: {
    display: 'flex',
    flexDirection: 'column',
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
    marginBottom: theme.spacing(-2),
  },
  actionIcon: {
    color: theme.palette.primary.main,
    width: '50px',
    height: '50px',
  },
  actionText: {
    color: theme.palette.primary.main,
  },
}));

export const Client: React.FC<ClientProps> = ({accessToken, wallets}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  // wallet state variables
  const [client, setClient] = useState<IFireblocksNCW>();
  const [sessionKeyState, setSessionKeyState] = useSessionStorage<
    Record<string, Record<string, string>>
  >(FireblocksStateKey, {});
  const [persistentKeyState, setPersistentKeyState] = useLocalStorage<
    Record<string, Record<string, string>>
  >(FireblocksStateKey, {});

  // component state variables
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSend, setIsSend] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // crypto send variables
  const [sourceAddress, setSourceAddress] = useState<string>();
  const [sourceSymbol, setSourceSymbol] = useState<string>();
  const [destinationAddress, setDestinationAddress] = useState<string>();
  const [amount, setAmount] = useState<string>();
  const [successfulTxId, setSuccessfulTxId] = useState<string>();

  useEffect(() => {
    void handleLoadClient();
  }, []);

  const handleLoadClient = async () => {
    // retrieve and validate key state
    const sessionState = getState(sessionKeyState);
    const persistentState = getState(persistentKeyState);
    const state = sessionState || persistentState;
    if (!state) {
      throw new Error('invalid configuration');
    }

    // initialize and set the client
    setClient(
      await getFireBlocksClient(state.deviceId, accessToken, {
        state: sessionState ? sessionKeyState : persistentKeyState,
        saveState: sessionState ? setSessionKeyState : setPersistentKeyState,
      }),
    );

    // loading complete
    setIsLoaded(true);
  };

  const handleSendCrypto = async () => {
    if (
      !client ||
      !amount ||
      !sourceAddress ||
      !sourceSymbol ||
      !destinationAddress
    ) {
      return;
    }

    // turn on the spinning and submit the tx
    setIsLoaded(false);
    setSuccessfulTxId(
      await sendCrypto(
        accessToken,
        sourceAddress,
        sourceSymbol,
        destinationAddress,
        {
          type: 'native',
          amount: parseFloat(amount),
        },
        async (internalTxId: string) => {
          await client.signTransaction(internalTxId);
        },
      ),
    );

    // turn off the spinner
    setIsLoaded(true);
  };

  const handleInputChange = (id: string, value: string) => {
    setIsDirty(true);
    if (id === 'sourceAddress') {
      setSourceAddress(value);
    } else if (id === 'sourceSymbol') {
      setSourceSymbol(value);
    } else if (id === 'destinationAddress') {
      setDestinationAddress(value);
    } else if (id === 'amount') {
      setAmount(value);
    }
  };

  const handleClickedSend = () => {
    setIsSend(true);
  };

  const handleClickedReceive = () => {
    // TODO
    alert('switch view to QR code list for available addresses');
  };

  const handleClickedBuy = () => {
    // TODO
    alert(
      'select wallet, then redirect to e-commerce buy/sell crypto page with this wallet preselected',
    );
  };

  return (
    <Box className={classes.container}>
      {isLoaded ? (
        <Box className={classes.walletContainer}>
          {isSend ? (
            successfulTxId ? (
              <>
                <Typography variant="h3">{t('common.success')}</Typography>
                <Typography variant="body1">
                  {t('wallet.transactionId', {id: successfulTxId})}
                </Typography>
              </>
            ) : (
              <>
                <ManageInput
                  id="sourceAddress"
                  value={sourceAddress}
                  label={'Source address'}
                  placeholder={'Enter source address'}
                  onChange={handleInputChange}
                  stacked={true}
                />
                <ManageInput
                  id="sourceSymbol"
                  value={sourceSymbol}
                  label={'Source blockchain symbol'}
                  placeholder={'Enter source blockchain symbol'}
                  onChange={handleInputChange}
                  stacked={true}
                />
                <ManageInput
                  id="destinationAddress"
                  value={destinationAddress}
                  label={'Destination address'}
                  placeholder={'Enter destination address'}
                  onChange={handleInputChange}
                  stacked={true}
                />
                <ManageInput
                  id="amount"
                  value={amount}
                  label={'Amount'}
                  placeholder={'Enter amount'}
                  onChange={handleInputChange}
                  stacked={true}
                />
                <Box display="flex" mt={1}>
                  <Button
                    fullWidth
                    onClick={handleSendCrypto}
                    disabled={!isDirty}
                    variant="contained"
                  >
                    {t('common.send')}
                  </Button>
                </Box>
                <Box display="flex" mt={1}>
                  <Button
                    fullWidth
                    onClick={() => setIsSend(false)}
                    variant="outlined"
                  >
                    {t('common.cancel')}
                  </Button>
                </Box>
              </>
            )
          ) : (
            <>
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
              <Box className={classes.portfolioContainer}>
                <TokensPortfolio wallets={wallets} isOwner={true} />
              </Box>
            </>
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
};
