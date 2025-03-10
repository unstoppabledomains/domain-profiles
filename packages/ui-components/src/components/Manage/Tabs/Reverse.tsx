import AddHomeOutlinedIcon from '@mui/icons-material/AddHomeOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';
import truncateEthAddress from 'truncate-eth-address';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileData, getStrictReverseResolution} from '../../../actions';
import {
  confirmRecordUpdate,
  getRegistrationMessage,
  initiatePrimaryDomain,
  registerWallet,
} from '../../../actions/pav3Actions';
import {useWeb3Context} from '../../../hooks';
import {DomainFieldTypes, useTranslationContext} from '../../../lib';
import {notifyEvent} from '../../../lib/error';
import {ProfileManager} from '../../Wallet/ProfileManager';
import {TabHeader} from '../common/TabHeader';
import type {ManageTabProps} from '../common/types';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    justifyItems: 'center',
  },
  reverseContainer: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  title: {
    marginTop: theme.spacing(2),
    color: theme.palette.neutralShades[400],
  },
  iconConfigured: {
    color: theme.palette.success.main,
    width: '75px',
    height: '75px',
  },
  iconNotConfigured: {
    color: theme.palette.neutralShades[400],
    width: '75px',
    height: '75px',
  },
  pendingTxContainer: {
    display: 'flex',
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    background: theme.palette.heroText,
    justifyContent: 'center',
    borderRadius: theme.shape.borderRadius,
  },
  pendingTxText: {
    color: theme.palette.background.paper,
  },
  pendingTxIcon: {
    color: theme.palette.background.paper,
    marginRight: theme.spacing(2),
    width: '50px',
    height: '50px',
  },
}));

export const Reverse: React.FC<ManageTabProps> = ({
  address,
  domain,
  setButtonComponent,
}) => {
  const {classes} = useStyles();
  const {web3Deps, setWeb3Deps} = useWeb3Context();
  const [saveClicked, setSaveClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPendingTx, setIsPendingTx] = useState<boolean>();
  const [isReverse, setIsReverse] = useState(false);
  const [existingReverse, setExistingReverse] = useState<string>();
  const [t] = useTranslationContext();

  useEffect(() => {
    // retrieve records and determine if there are pending transactions
    setIsLoading(true);
    setButtonComponent(<></>);
    void loadRecords();
  }, [domain]);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    setButtonComponent(
      isReverse ? (
        <></>
      ) : (
        <LoadingButton
          variant="contained"
          onClick={handleSave}
          loading={isSaving}
          disabled={isPendingTx || isReverse}
          fullWidth
        >
          {t('manage.startRecordUpdate')}
        </LoadingButton>
      ),
    );
  }, [isSaving, isPendingTx, isReverse, isLoading]);

  const loadRecords = async () => {
    const [profileData, resolutionData] = await Promise.all([
      getProfileData(domain, [
        DomainFieldTypes.Records,
        DomainFieldTypes.CryptoVerifications,
      ]),
      getStrictReverseResolution(address),
    ]);
    if (profileData?.metadata) {
      setIsReverse(!!profileData.metadata.reverse);
      setIsPendingTx(!!profileData.metadata.pending);
    }
    if (resolutionData) {
      setExistingReverse(resolutionData);
    }
    setIsLoading(false);
  };

  const handleSave = () => {
    setSaveClicked(true);
    setIsSaving(true);
  };

  const handleRecordUpdate = async (
    signature: string,
    expiry: string,
  ): Promise<void> => {
    if (await validateWalletRegistration(signature, expiry)) {
      // initiate a record update
      const updateRequest = await initiatePrimaryDomain(address, domain, {
        expires: expiry,
        signature,
      });
      if (updateRequest?.transaction.messageToSign) {
        // retrieve confirmation signature
        const txSignature = await getSignature(
          updateRequest.transaction.messageToSign,
        );
        if (txSignature) {
          // submit confirmation signature to complete transaction
          if (
            await confirmRecordUpdate(
              domain,
              updateRequest.operationId,
              updateRequest.dependencyId,
              {signature: txSignature},
              {
                expires: expiry,
                signature,
              },
            )
          ) {
            // record updates successful
            setIsSaving(false);
            setIsPendingTx(true);
            setIsReverse(true);
            return;
          }
        }
      }
    }

    // record update was not successful
    setIsSaving(false);
  };

  const validateWalletRegistration = async (
    signature: string,
    expiry: string,
  ): Promise<boolean> => {
    try {
      const msgToSign = await getRegistrationMessage(domain, {
        expires: expiry,
        signature,
      });
      if (msgToSign) {
        // request message to be signed by domain owner
        const registrationSignature = await getSignature(msgToSign);

        // submit wallet verification if signature is valid
        if (registrationSignature) {
          await registerWallet(
            address,
            domain,
            msgToSign,
            registrationSignature,
            {
              expires: expiry,
              signature,
            },
          );
        }
      }
      return true;
    } catch (e) {
      notifyEvent(e, 'warning', 'Profile', 'Signature', {
        msg: 'error validating wallet',
      });
    }
    return false;
  };

  // getSignature prompts the user to sign a message to authorize management of
  // the domain profile.
  const getSignature = async (msg: string): Promise<string | undefined> => {
    try {
      if (!web3Deps) {
        return undefined;
      }

      // sign a message linking the domain and secondary wallet address
      return await web3Deps.signer.signMessage(msg);
    } catch (signError) {
      notifyEvent(signError, 'warning', 'Profile', 'Signature', {
        msg: 'signature error',
      });
    }
    return undefined;
  };

  return (
    <Box className={classes.container}>
      <TabHeader
        icon={<SwapHorizOutlinedIcon />}
        description={t('manage.reverseResolutionDescription', {domain})}
        learnMoreLink="https://support.unstoppabledomains.com/support/solutions/articles/48001217257-what-is-and-how-to-setup-reverse-resolution"
      />
      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={1}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {isPendingTx && (
            <Box className={classes.pendingTxContainer}>
              <UpdateOutlinedIcon className={classes.pendingTxIcon} />
              <Box display="flex" flexDirection="column">
                <Typography variant="h6" className={classes.pendingTxText}>
                  {t('manage.pendingChanges')}
                </Typography>
                <Typography variant="body2" className={classes.pendingTxText}>
                  {t('manage.pendingChangesDescription')}
                </Typography>
              </Box>
            </Box>
          )}
          <Box className={classes.reverseContainer}>
            {isReverse ? (
              <Box>
                <CheckCircleOutlinedIcon className={classes.iconConfigured} />
                <Typography variant="h5">{t('manage.allSet')}</Typography>
                <Box>
                  <Typography variant="body1">
                    {t('manage.reverseResolutionDomain', {
                      domain,
                      address: truncateEthAddress(address),
                    })}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box>
                <AddHomeOutlinedIcon className={classes.iconNotConfigured} />
                <Typography variant="h5">
                  {t('manage.setupReverseResolution')}
                </Typography>
                <Typography variant="body1">
                  {t('manage.setReverseResolutionDomain', {
                    domain,
                    address: truncateEthAddress(address),
                  })}{' '}
                  {existingReverse &&
                    t('manage.overwriteExistingReverseResolution', {
                      domain: existingReverse,
                    })}
                </Typography>
              </Box>
            )}
          </Box>

          <ProfileManager
            domain={domain}
            ownerAddress={address}
            setWeb3Deps={setWeb3Deps}
            saveComplete={!isSaving}
            saveClicked={saveClicked}
            setSaveClicked={setSaveClicked}
            onSignature={handleRecordUpdate}
            forceWalletConnected={true}
          />
        </Box>
      )}
    </Box>
  );
};
