import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import * as isIPFS from 'is-ipfs';
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
import {notifyEvent} from '../../../lib/error';
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
  },
  contentContainer: {
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
  button: {
    marginTop: theme.spacing(2),
  },
}));

// the record key for an IPFS website
const ipfsHashKey = 'ipfs.html.value';

export const Website: React.FC<ManageTabProps> = ({
  address,
  domain,
  setButtonComponent,
}) => {
  const {classes} = useStyles();
  const {web3Deps, setWeb3Deps} = useWeb3Context();
  const [ipfsHash, setIpfsHash] = useState<string>();
  const [saveClicked, setSaveClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPendingTx, setIsPendingTx] = useState<boolean>();
  const [isInvalidHash, setIsInvalidHash] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);
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
      <LoadingButton
        variant="contained"
        onClick={handleSave}
        loading={isSaving}
        disabled={isPendingTx || isInvalidHash || !isDirty}
        className={classes.button}
        color={isLaunched && !ipfsHash ? 'error' : 'primary'}
        fullWidth
      >
        {isLaunched
          ? ipfsHash
            ? t('manage.updateWebsite')
            : t('manage.removeWebsite')
          : t('manage.launchWebsite')}
      </LoadingButton>,
    );
  }, [
    isLoading,
    isSaving,
    isPendingTx,
    isInvalidHash,
    isDirty,
    isLaunched,
    ipfsHash,
  ]);

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
    if (profileData?.records?.[ipfsHashKey]) {
      setIpfsHash(profileData.records[ipfsHashKey]);
      setIsLaunched(true);
    }
    setIsLoading(false);
  };

  const handleSave = () => {
    // submit changes
    setSaveClicked(true);
    setIsSaving(true);
  };

  const handleInputChange = (id: string, value: string) => {
    setIsDirty(true);
    setIpfsHash(value);

    // validate the IPFS format
    const isValid =
      value.length === 0 ||
      isIPFS.multihash(value) ||
      isIPFS.cid(value) ||
      isIPFS.base32cid(value);
    setIsInvalidHash(!isValid);
  };

  const handleRecordUpdate = async (
    signature: string,
    expiry: string,
  ): Promise<void> => {
    // only proceed if IPFS hash is defined
    if (ipfsHash === undefined) {
      return;
    }

    // ensure wallet is registered for making the update
    if (await validateWalletRegistration(signature, expiry)) {
      // initiate a record update
      const updateRequest = await initiateRecordUpdate(
        address,
        domain,
        {[ipfsHashKey]: ipfsHash},
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
        icon={<LanguageOutlinedIcon />}
        description={t('manage.web3WebsiteDescription', {domain})}
        learnMoreLink="https://support.unstoppabledomains.com/support/solutions/articles/48001181925-build-website"
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
            {ipfsHash && isLaunched ? (
              <Box>
                <CloudDoneOutlinedIcon className={classes.iconConfigured} />
                <Typography variant="h5">
                  {t('manage.web3WebsiteLaunched')}
                </Typography>
                <Box>
                  <Typography variant="body1">
                    {t('manage.web3WebsiteLaunchedDescription', {
                      domain,
                    })}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box>
                {isLaunched ? (
                  <CloudOffOutlinedIcon className={classes.iconNotConfigured} />
                ) : (
                  <CloudUploadOutlinedIcon
                    className={classes.iconNotConfigured}
                  />
                )}
                <Typography variant="h5">
                  {isLaunched
                    ? t('manage.web3WebsiteRemove')
                    : t('manage.setupWeb3Website')}
                </Typography>
                <Typography variant="body1">
                  {isLaunched
                    ? t('manage.web3WebsiteRemoveDescription', {
                        domain,
                      })
                    : t('manage.setupWeb3WebsiteDescription', {
                        domain,
                      })}
                </Typography>
              </Box>
            )}
          </Box>
          <ManageInput
            mt={2}
            id="ipfsHash"
            value={ipfsHash}
            label={t('manage.ipfsHash')}
            placeholder={t('manage.enterIpfsHash')}
            onChange={handleInputChange}
            disableTextTrimming
            error={isInvalidHash}
            errorText={t('manage.enterValidIpfsHash')}
            stacked={false}
            disabled={isPendingTx}
          />
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
