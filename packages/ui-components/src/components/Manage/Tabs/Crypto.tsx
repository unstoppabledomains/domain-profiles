import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileData} from '../../../actions';
import {
  confirmRecordUpdate,
  getRegistrationMessage,
  initiateRecordUpdate,
  registerWallet,
} from '../../../actions/pav3Actions';
import {useWeb3Context} from '../../../hooks';
import {DomainFieldTypes, useTranslationContext} from '../../../lib';
import {notifyError} from '../../../lib/error';
import {ProfileManager} from '../../Wallet/ProfileManager';
import ManageInput from './Profile/ManageInput';
import {TabHeader} from './TabHeader';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    justifyItems: 'center',
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(-3),
    },
  },
  pendingTxContainer: {
    display: 'flex',
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    justifyContent: 'center',
  },
  pendingTxText: {
    color: theme.palette.white,
  },
  pendingTxIcon: {
    color: theme.palette.white,
    marginRight: theme.spacing(1),
    width: '50px',
    height: '50px',
  },
  button: {
    marginTop: theme.spacing(2),
  },
  icon: {
    color: theme.palette.neutralShades[600],
    width: '100px',
    height: '100px',
  },
}));

export const Crypto: React.FC<CryptoProps> = ({address, domain}) => {
  const {classes} = useStyles();
  const {web3Deps, setWeb3Deps} = useWeb3Context();
  const [saveClicked, setSaveClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPendingTx, setIsPendingTx] = useState<boolean>();
  const [records, setRecords] = useState<Record<string, string>>({});
  const [t] = useTranslationContext();

  useEffect(() => {
    // retrieve records and determine if there are pending transactions
    void loadRecords();
  }, []);

  const loadRecords = async () => {
    const profileData = await getProfileData(domain, [
      DomainFieldTypes.Records,
      DomainFieldTypes.CryptoVerifications,
    ]);
    if (profileData?.records) {
      setRecords(profileData.records);
      setIsPendingTx(!!profileData?.metadata?.pending);
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
      const updateRequest = await initiateRecordUpdate(
        address,
        domain,
        records,
        {
          expires: expiry,
          signature,
        },
      );
      if (updateRequest) {
        // retrieve confirmation signature
        const txSignature = await getSignature(updateRequest.message);
        if (txSignature) {
          // submit confirmation signature to complete transaction
          if (
            await confirmRecordUpdate(
              domain,
              updateRequest.operationId,
              updateRequest.dependencyId,
              txSignature,
              {
                expires: expiry,
                signature,
              },
            )
          ) {
            // record updates successful
            setIsSaving(false);
            setIsPendingTx(true);
            return;
          }
        }
      }
    }

    // record update was not successful
    setIsSaving(false);
  };

  const handleInputChange = (id: string, value: string) => {
    records[id] = value;
    setRecords({
      ...records,
    });
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
      notifyError(signError, {msg: 'signature error'}, 'warning');
    }
    return undefined;
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
      notifyError(e, {msg: 'error validating wallet'}, 'warning');
    }
    return false;
  };

  const getLabel = (k: string) => {
    return k;
  };

  return (
    <Box className={classes.container}>
      <TabHeader
        icon={<MonetizationOnOutlinedIcon />}
        description={t('manage.cryptoAddressesDescription')}
        learnMoreLink="https://support.unstoppabledomains.com/support/solutions/articles/48001181827-add-crypto-addresses"
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
          <Box mt={2}>
            {Object.keys(records).map(recordKey => (
              <ManageInput
                id={recordKey}
                value={records[recordKey]}
                label={getLabel(recordKey)}
                placeholder={getLabel(recordKey)}
                onChange={handleInputChange}
                disabled={isPendingTx}
                disableTextTrimming
                stacked={false}
              />
            ))}
          </Box>
          <LoadingButton
            variant="contained"
            onClick={handleSave}
            loading={isSaving}
            disabled={isPendingTx}
            className={classes.button}
            fullWidth
          >
            {t('common.save')}
          </LoadingButton>
          <ProfileManager
            domain={domain}
            ownerAddress={address}
            setWeb3Deps={setWeb3Deps}
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

export type CryptoProps = {
  address: string;
  domain: string;
};
