import CheckIcon from '@mui/icons-material/Check';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {SendCryptoStatusMessage} from '../../actions/fireBlocksActions';
import {useFireblocksState} from '../../hooks';
import {Status, useSubmitTransaction} from '../../hooks/useSubmitTransaction';
import type {TokenEntry} from '../../lib';
import {getBootstrapState, useTranslationContext} from '../../lib';
import type {AccountAsset} from '../../lib/types/fireBlocks';
import {
  getBlockchainDisplaySymbol,
  getBlockchainSymbol,
} from '../Manage/common/verification/types';
import {OperationStatus} from './OperationStatus';
import {TwoFactorPromptModal} from './TwoFactorPromptModal';

const useStyles = makeStyles()((theme: Theme) => ({
  fullWidth: {
    width: '100%',
  },
  sendLoadingContainer: {
    marginTop: theme.spacing(10),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  transactionStatusContainer: {
    color: theme.palette.neutralShades[600],
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '7px',
    marginBottom: theme.spacing(5),
    textAlign: 'center',
  },
  icon: {
    fontSize: '60px',
  },
}));

type Props = {
  onCloseClick: () => void;
  onInvitation: (
    emailAddress: string,
  ) => Promise<Record<string, string> | undefined>;
  accessToken: string;
  asset: AccountAsset;
  token: TokenEntry;
  recipientAddress: string;
  recipientDomain?: string;
  amount: string;
};

export const SubmitTransaction: React.FC<Props> = ({
  onCloseClick,
  onInvitation,
  accessToken,
  asset,
  token,
  recipientAddress,
  recipientDomain,
  amount,
}) => {
  const [t] = useTranslationContext();
  const [state] = useFireblocksState();
  const {classes} = useStyles();
  const [otpToken, setOtpToken] = useState<string>();

  // get the email address from the bootstrap state
  const bootstrapState = getBootstrapState(state);
  const emailAddress = bootstrapState?.userName;

  const {transactionId, status, statusMessage} = useSubmitTransaction({
    accessToken,
    asset,
    token,
    recipientAddress,
    amount,
    otpToken,
    onInvitation,
  });

  const visibleButtonStates = [
    SendCryptoStatusMessage.CREATING_WALLET,
    SendCryptoStatusMessage.CHECKING_QUEUE,
    SendCryptoStatusMessage.STARTING_TRANSACTION,
    SendCryptoStatusMessage.WAITING_FOR_TRANSACTION,
    SendCryptoStatusMessage.TRANSACTION_COMPLETED,
  ];
  const closeButtonStates = [
    SendCryptoStatusMessage.WAITING_FOR_TRANSACTION,
    SendCryptoStatusMessage.TRANSACTION_COMPLETED,
  ];

  return (
    <Box className={classes.sendLoadingContainer}>
      <OperationStatus
        label={
          transactionId
            ? statusMessage
            : `${statusMessage.replace('...', '. ')}${t(
                'wallet.leaveWindowOpen',
              )}`
        }
        icon={
          statusMessage === SendCryptoStatusMessage.WAITING_FOR_TRANSACTION ? (
            <CheckIcon />
          ) : (
            <SendOutlinedIcon />
          )
        }
        success={status === Status.Success}
        error={status === Status.Failed}
      >
        <Box className={classes.transactionStatusContainer} mt={2}>
          {statusMessage ===
            SendCryptoStatusMessage.WAITING_FOR_TRANSACTION && (
            <Typography variant="caption">
              {t('wallet.safeToCloseWindow')}
            </Typography>
          )}
          {[Status.Success, Status.Failed].includes(status) && (
            <Typography variant="caption">
              {t(
                `wallet.sendTransaction${
                  status === Status.Success ? 'Success' : 'Failed'
                }`,
                {
                  amount,
                  sourceSymbol: getBlockchainDisplaySymbol(token.ticker),
                  status,
                  recipientDomain: recipientDomain
                    ? ` ${recipientDomain}`
                    : ` ${recipientAddress}`,
                },
              )}
            </Typography>
          )}
          {transactionId && (
            <Button
              variant="text"
              onClick={() =>
                window.open(
                  `${
                    config.BLOCKCHAINS[
                      getBlockchainSymbol(
                        asset.blockchainAsset.blockchain.id,
                      ) as keyof typeof config.BLOCKCHAINS
                    ].BLOCK_EXPLORER_TX_URL
                  }${transactionId}`,
                  '_blank',
                )
              }
            >
              {t('wallet.viewTransaction')}
            </Button>
          )}
        </Box>
      </OperationStatus>
      {visibleButtonStates.includes(statusMessage) && (
        <Box className={classes.fullWidth}>
          <Button fullWidth onClick={onCloseClick} variant="outlined">
            {closeButtonStates.includes(statusMessage)
              ? t('common.close')
              : t('common.cancel')}
          </Button>
        </Box>
      )}
      {statusMessage === SendCryptoStatusMessage.PROMPT_FOR_MFA && (
        <TwoFactorPromptModal
          message={t('wallet.twoFactorAuthenticationTotpDescription', {
            action: t('common.transaction').toLowerCase(),
          })}
          open={true}
          onClose={onCloseClick}
          onComplete={setOtpToken}
        />
      )}
      {statusMessage === SendCryptoStatusMessage.PROMPT_FOR_EMAIL_OTP && (
        <TwoFactorPromptModal
          message={t('wallet.twoFactorAuthenticationEmailDescription', {
            action: t('common.transaction').toLowerCase(),
            emailAddress: emailAddress || t('common.yourEmailAddress'),
          })}
          open={true}
          onClose={onCloseClick}
          onComplete={setOtpToken}
        />
      )}
    </Box>
  );
};

export default SubmitTransaction;
