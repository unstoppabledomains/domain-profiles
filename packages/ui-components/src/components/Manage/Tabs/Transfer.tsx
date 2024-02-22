import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileData} from '../../../actions';
import {
  confirmRecordUpdate,
  getRegistrationMessage,
  initiatePrimaryDomain,
  registerWallet,
} from '../../../actions/pav3Actions';
import {useWeb3Context} from '../../../hooks';
import {DomainFieldTypes, useTranslationContext} from '../../../lib';
import {notifyEvent} from '../../../lib/error';
import {isEthAddress} from '../../Chat/protocol/resolution';
import {ProfileManager} from '../../Wallet/ProfileManager';
import ManageInput from '../common/ManageInput';
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
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(-3),
    },
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  checkboxContainer: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
  checkbox: {
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(0),
    alignSelf: 'flex-start',
  },
  pendingTxContainer: {
    display: 'flex',
    marginTop: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundImage: `linear-gradient(to left, ${theme.palette.primaryShades[400]}, ${theme.palette.primaryShades[600]})`,
    justifyContent: 'center',
    borderRadius: theme.shape.borderRadius,
  },
  pendingTxText: {
    color: theme.palette.white,
  },
  pendingTxIcon: {
    color: theme.palette.white,
    marginRight: theme.spacing(2),
    width: '50px',
    height: '50px',
  },
}));

export const Transfer: React.FC<ManageTabProps> = ({
  address,
  domain,
  setButtonComponent,
}) => {
  const {classes} = useStyles();
  const {web3Deps, setWeb3Deps} = useWeb3Context();
  const [saveClicked, setSaveClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isPendingTx, setIsPendingTx] = useState<boolean>();
  const [recipientAddress, setRecipientAddress] = useState<string>();
  const [invalidAddress, setInvalidAddress] = useState(false);
  const [checkboxMap, setCheckboxMap] = useState<Record<string, boolean>>({});
  const [t] = useTranslationContext();

  useEffect(() => {
    // retrieve records and determine if there are pending transactions
    setButtonComponent(<></>);
    void loadRecords();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    setButtonComponent(
      <LoadingButton
        variant="contained"
        onClick={handleSave}
        loading={isSaving}
        disabled={
          invalidAddress ||
          isPendingTx ||
          !isDirty ||
          !checkboxMap['1'] ||
          !checkboxMap['2'] ||
          !checkboxMap['3']
        }
        fullWidth
      >
        {t('manage.startTransfer')}
      </LoadingButton>,
    );
  }, [isSaving, invalidAddress, isPendingTx, isDirty, isLoading, checkboxMap]);

  const loadRecords = async () => {
    const [profileData] = await Promise.all([
      getProfileData(domain, [
        DomainFieldTypes.Records,
        DomainFieldTypes.CryptoVerifications,
      ]),
    ]);
    if (profileData?.metadata) {
      setIsPendingTx(!!profileData.metadata.pending);
    }
    setIsLoading(false);
  };

  const handleSave = () => {
    setSaveClicked(true);
    setIsSaving(true);
  };

  const handleInputChange = (id: string, value: string) => {
    setIsDirty(true);
    setRecipientAddress(value);

    // validate the IPFS format
    const isValid = value.length > 0 && isEthAddress(value);
    setInvalidAddress(!isValid);
  };

  const handleEnabledChange = (k: string, checked: boolean) => {
    setCheckboxMap({
      ...checkboxMap,
      [k]: checked,
    });
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
      notifyEvent(e, 'warning', 'PROFILE', 'Signature', {
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
      notifyEvent(signError, 'warning', 'PROFILE', 'Signature', {
        msg: 'signature error',
      });
    }
    return undefined;
  };

  return (
    <Box className={classes.container}>
      <TabHeader
        icon={<SendOutlinedIcon />}
        description={t('manage.transferDescription', {domain})}
        learnMoreLink="https://support.unstoppabledomains.com/support/solutions/articles/48001181920-transfer-to-new-owner"
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
          <Box className={classes.contentContainer}>
            <Typography variant="body2" mb={3}>
              {t('manage.transferWarning')}
            </Typography>
            <ManageInput
              id="recipientAddress"
              value={recipientAddress}
              label={t('manage.recipientAddress')}
              placeholder={t('manage.enterRecipientAddress')}
              onChange={handleInputChange}
              disableTextTrimming
              error={invalidAddress}
              errorText={t('manage.enterValidRecipientAddress')}
              stacked={false}
              disabled={isPendingTx}
            />
            <Box className={classes.checkboxContainer}>
              <FormGroup>
                {['1', '2', '3', '4'].map(key => (
                  <FormControlLabel
                    key={`checkbox-${key}`}
                    control={
                      <Checkbox
                        className={classes.checkbox}
                        checked={checkboxMap[key]}
                        onChange={e =>
                          handleEnabledChange(key, e.target.checked)
                        }
                      />
                    }
                    label={
                      <Typography variant="body1">
                        {t(`manage.transferConfirmation${key}`)}
                      </Typography>
                    }
                  />
                ))}
              </FormGroup>
            </Box>
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
        </Box>
      )}
    </Box>
  );
};
