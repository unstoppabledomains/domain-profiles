import CheckIcon from '@mui/icons-material/Check';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {utils} from 'ethers';
import {round} from 'lodash';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getTransactionGasEstimate} from '../../actions/fireBlocksActions';
import {useFireblocksState, useWeb3Context} from '../../hooks';
import useFireblocksAccessToken from '../../hooks/useFireblocksAccessToken';
import useFireblocksTxSigner from '../../hooks/useFireblocksTxSigner';
import {getBootstrapState, useTranslationContext} from '../../lib';
import {notifyEvent} from '../../lib/error';
import type {GetEstimateTransactionResponse} from '../../lib/types/fireBlocks';
import {getAsset} from '../../lib/wallet/asset';
import {getBlockchainSymbol} from '../Manage/common/verification/types';
import {Header} from './Header';
import {OperationStatus} from './OperationStatus';
import {SignForDappHeader} from './SignForDappHeader';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    width: '100%',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    textAlign: 'center',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  button: {
    marginTop: theme.spacing(1),
  },
}));

const MAX_DISPLAY_LENGTH = 12;

export const SignTx: React.FC<SignTxProps> = ({
  hideHeader,
  chainId,
  contractAddress,
  data,
  value,
  onComplete,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const {web3Deps} = useWeb3Context({enforcePin: true});
  const [state] = useFireblocksState();
  const getAccessToken = useFireblocksAccessToken();
  const [isSigning, setIsSigning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [accessToken, setAccessToken] = useState<string>();
  const [gasEstimate, setGasEstimate] =
    useState<GetEstimateTransactionResponse>();
  const fireblocksSigner = useFireblocksTxSigner();

  // is recipient a smart contract or user?
  const valueAmt = value
    ? utils.isHexString(value)
      ? parseFloat(utils.formatEther(value))
      : parseFloat(value)
    : 0;
  const isSmartContract = data && data.length > 2;

  // retrieve and validate key state
  const clientState = getBootstrapState(state);
  if (!clientState) {
    throw new Error('invalid configuration');
  }

  // find asset by provided chain ID
  const asset = getAsset(clientState.assets, {chainId});
  if (!asset) {
    throw new Error(
      `asset not found to display Tx for signing. ${JSON.stringify({
        chainId,
        assets: clientState.assets,
      })}`,
    );
  }

  const maxDisplayLength = asset.balance?.decimals
    ? Math.min(MAX_DISPLAY_LENGTH, asset.balance.decimals)
    : MAX_DISPLAY_LENGTH;

  useEffect(() => {
    const loadAccessToken = async () => {
      setAccessToken(await getAccessToken());
    };
    void loadAccessToken();
  }, []);

  // load the transaction estimate
  useEffect(() => {
    if (!asset || !accessToken) {
      return;
    }

    const loadEstimate = async () => {
      const estimate = await getTransactionGasEstimate(asset, accessToken, {
        chainId,
        to: contractAddress,
        data,
        value,
      });
      setGasEstimate(
        estimate || {
          '@type': 'unstoppabledomains.com/wallets.v1.TransactionEstimate',
          priority: 'medium',
          status: 'ERROR',
        },
      );
    };
    void loadEstimate();
  }, [accessToken]);

  // sign requested tx when button is clicked and the Fireblocks
  // client has been properly initialized
  useEffect(() => {
    if (!isSigning) {
      return;
    }
    void handleSignature();
  }, [isSigning]);

  // clear the success flag for new tx
  useEffect(() => {
    setIsSuccess(false);
    setErrorMessage(undefined);
  }, [contractAddress]);

  const handleSignature = async () => {
    if (!fireblocksSigner) {
      return;
    }

    // sign with fireblocks client
    let signatureResult: string | undefined;
    try {
      signatureResult = await fireblocksSigner(
        chainId,
        contractAddress,
        data,
        value,
      );
      onComplete(signatureResult);
      setIsSuccess(true);
      return;
    } catch (e) {
      notifyEvent(e, 'error', 'Wallet', 'Signature', {
        msg: 'error signing message',
      });
    }

    // show error message
    setErrorMessage(t('wallet.errorConfirming'));
  };

  const handleClickApprove = () => {
    // set the signing state flag
    setIsSigning(true);
  };

  const handleClickReject = () => {
    // indicate complete with undefined signature result
    onComplete(undefined);
  };

  return (
    <Box className={classes.container}>
      <Box className={classes.contentContainer}>
        {hideHeader ? (
          <Box mt={2} />
        ) : (
          <Header mode="basic" address={asset.address} isLoaded={true} />
        )}
        {isSigning ? (
          <Box className={classes.contentContainer}>
            <OperationStatus
              label={errorMessage || t('manage.signing')}
              icon={<LockOutlinedIcon />}
              error={errorMessage !== undefined}
            />
          </Box>
        ) : gasEstimate ? (
          <Box className={classes.contentContainer}>
            <Typography variant="h4">{t('wallet.signMessage')}</Typography>
            {web3Deps?.unstoppableWallet?.connectedApp ? (
              <SignForDappHeader
                name={web3Deps.unstoppableWallet.connectedApp.name}
                hostUrl={web3Deps.unstoppableWallet.connectedApp.hostUrl}
                iconUrl={web3Deps.unstoppableWallet.connectedApp.iconUrl}
                actionText={t('wallet.signTxAction')}
              />
            ) : (
              <Typography mt={3} variant="body2">
                {t('wallet.signMessageDescription')}
              </Typography>
            )}
            <Typography mt={3} variant="body1">
              {isSmartContract
                ? t('common.smartContract')
                : t('wallet.recipient')}
              :
            </Typography>
            <Typography mt={1} variant="body2">
              <b>{contractAddress}</b>
            </Typography>
            <Typography mt={3} variant="body1">
              {valueAmt
                ? t('wallet.amountWithNetworkFees')
                : t('wallet.networkFee')}
              :{' '}
            </Typography>
            <Typography mt={1} variant="body2">
              <b>
                {gasEstimate.status === 'VALID' && gasEstimate?.networkFee
                  ? `${round(
                      valueAmt + parseFloat(gasEstimate.networkFee.amount),
                      maxDisplayLength,
                    )} ${getBlockchainSymbol(
                      asset.blockchainAsset.blockchain.id,
                    )}`
                  : gasEstimate.status === 'INSUFFICIENT_FUNDS'
                  ? t('wallet.txInsufficientFunds')
                  : t('wallet.txEstimateError')}
              </b>
            </Typography>
          </Box>
        ) : (
          <Box className={classes.contentContainer}>
            <OperationStatus
              label={t('wallet.retrievingGasPrice', {
                blockchain: asset.blockchainAsset.blockchain.name || '',
              })}
              icon={<MonitorHeartOutlinedIcon />}
            />
          </Box>
        )}
      </Box>
      {!isSigning && (
        <Box className={classes.buttonContainer}>
          <LoadingButton
            className={classes.button}
            fullWidth
            loading={isSigning}
            loadingIndicator={
              <Box display="flex" alignItems="center">
                <CircularProgress color="inherit" size={16} />
                <Box ml={1}>{t('manage.signing')}...</Box>
              </Box>
            }
            disabled={isSuccess || !gasEstimate?.status}
            variant="contained"
            onClick={handleClickApprove}
            startIcon={isSuccess ? <CheckIcon /> : undefined}
          >
            {isSuccess ? t('common.success') : t('wallet.approve')}
          </LoadingButton>
          <Button
            className={classes.button}
            fullWidth
            disabled={isSigning}
            variant="outlined"
            onClick={handleClickReject}
          >
            {t('wallet.reject')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export interface SignTxProps {
  hideHeader?: boolean;
  chainId: number;
  contractAddress: string;
  data: string;
  value?: string;
  onComplete: (txHash?: string) => void;
}
