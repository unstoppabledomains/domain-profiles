import CheckIcon from '@mui/icons-material/Check';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {round} from 'lodash';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getTransactionGasEstimate} from '../../actions/fireBlocksActions';
import {useFireblocksState} from '../../hooks';
import useFireblocksAccessToken from '../../hooks/useFireblocksAccessToken';
import useFireblocksTxSigner from '../../hooks/useFireblocksTxSigner';
import {getBootstrapState, useTranslationContext} from '../../lib';
import {notifyEvent} from '../../lib/error';
import {GetEstimateTransactionResponse} from '../../lib/types/fireBlocks';
import {getBlockchainSymbol} from '../Manage/common/verification/types';
import {Header} from './Header';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  messageContainer: {
    backgroundColor: theme.palette.neutralShades[100],
    border: `1px solid ${theme.palette.neutralShades[400]}`,
    borderRadius: theme.shape.borderRadius,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
    marginLeft: '1px',
    marginRight: '1px',
    fontFamily: 'monospace',
    fontSize: '12px',
    wordWrap: 'break-word',
    maxWidth: '500px',
    textAlign: 'left',
    width: '100%',
    overflowWrap: 'break-word',
    [theme.breakpoints.down('sm')]: {
      maxWidth: 'calc(100vw - 50px)',
    },
  },
  button: {
    marginTop: theme.spacing(1),
  },
}));

const MAX_DISPLAY_LENGTH = 12;

export const SignTx: React.FC<SignTxProps> = ({
  chainId,
  contractAddress,
  data,
  value,
  onComplete,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [state] = useFireblocksState();
  const getAccessToken = useFireblocksAccessToken();
  const [isSigning, setIsSigning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState<string>();
  const [gasEstimate, setGasEstimate] =
    useState<GetEstimateTransactionResponse>();
  const fireblocksSigner = useFireblocksTxSigner();

  // retrieve and validate key state
  const clientState = getBootstrapState(state);
  if (!clientState) {
    throw new Error('invalid configuration');
  }

  // find asset by provided chain ID
  const asset = clientState.assets.find(
    a => a.blockchainAsset.blockchain.networkId === chainId,
  );
  if (!asset?.accountId) {
    throw new Error('asset not found to sign Tx');
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
      setGasEstimate(
        await getTransactionGasEstimate(asset, accessToken, {
          chainId,
          contractAddress,
          data,
          value,
        }),
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
    } catch (e) {
      notifyEvent(e, 'error', 'Wallet', 'Signature', {
        msg: 'error signing message',
      });
    }

    onComplete(signatureResult);
    setIsSuccess(true);
    setIsSigning(false);
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
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        alignContent="center"
        justifyContent="center"
        textAlign="center"
      >
        <Header mode="basic" address={asset.address} isLoaded={true} />
        {gasEstimate ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            alignContent="center"
            justifyContent="center"
            textAlign="center"
          >
            <Typography variant="h4">{t('wallet.signMessage')}</Typography>
            <Typography mt={3} variant="body2">
              {t('wallet.signMessageDescription')}
            </Typography>
            <Typography mt={3} variant="body1">
              {t('common.smartContract')}
            </Typography>
            <Typography mt={1} variant="body1">
              <b>{contractAddress}</b>
            </Typography>
            <Typography mt={3} variant="body1">
              {t('wallet.networkFee')}:{' '}
            </Typography>
            <Typography mt={1} variant="body1">
              <b>{`${round(
                parseFloat(gasEstimate.networkFee.amount),
                maxDisplayLength,
              )} ${getBlockchainSymbol(
                asset.blockchainAsset.blockchain.id,
              )}`}</b>
            </Typography>
          </Box>
        ) : (
          <CircularProgress />
        )}
      </Box>
      <Box display="flex" flexDirection="column">
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
          disabled={isSuccess || gasEstimate?.status !== 'VALID'}
          variant="contained"
          onClick={handleClickApprove}
          startIcon={isSuccess ? <CheckIcon /> : undefined}
        >
          {gasEstimate && gasEstimate.status !== 'VALID'
            ? t('wallet.insufficientBalance')
            : isSuccess
            ? t('common.success')
            : t('wallet.approve')}
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
    </Box>
  );
};

export interface SignTxProps {
  chainId: number;
  contractAddress: string;
  data: string;
  value?: string;
  onComplete: (txHash?: string) => void;
}
