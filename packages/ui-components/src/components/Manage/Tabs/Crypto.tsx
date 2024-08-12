import AddIcon from '@mui/icons-material/Add';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
import useResolverKeys from '../../../hooks/useResolverKeys';
import type {
  CurrenciesType,
  NewAddressRecord,
  SerializedPublicDomainProfileData,
} from '../../../lib';
import {DomainFieldTypes, useTranslationContext} from '../../../lib';
import {notifyEvent} from '../../../lib/error';
import {ProfileManager} from '../../Wallet/ProfileManager';
import AddCurrencyModal from '../common/AddCurrencyModal';
import CurrencyInput from '../common/CurrencyInput';
import MultiChainInput from '../common/MultiChainInput';
import {TabHeader} from '../common/TabHeader';
import {
  getMultichainAddressRecords,
  getSingleChainAddressRecords,
} from '../common/currencyRecords';
import type {ManageTabProps} from '../common/types';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    justifyItems: 'center',
    width: '100%',
  },
  pendingTxContainer: {
    display: 'flex',
    width: '100%',
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
    marginBottom: theme.spacing(1),
  },
  icon: {
    color: theme.palette.neutralShades[600],
    width: '100px',
    height: '100px',
  },
  title: {
    marginTop: theme.spacing(2),
    color: theme.palette.neutralShades[400],
  },
}));

export const Crypto: React.FC<CryptoProps> = ({
  address,
  domain,
  setButtonComponent,
  filterFn,
  updateFn,
  hideHeader,
  hideVerifyButtons,
}) => {
  const {classes} = useStyles();
  const {web3Deps, setWeb3Deps} = useWeb3Context();
  const {unsResolverKeys: resolverKeys, loading: resolverKeysLoading} =
    useResolverKeys();
  const [saveClicked, setSaveClicked] = useState(false);
  const [isSignatureSuccess, setIsSignatureSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPendingTx, setIsPendingTx] = useState<boolean>();
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [records, setRecords] = useState<Record<string, string>>({});
  const [profileData, setProfileData] =
    useState<SerializedPublicDomainProfileData>();
  const [t] = useTranslationContext();
  const deletedRecords: string[] = [];

  useEffect(() => {
    if (resolverKeysLoading) {
      return;
    }

    // retrieve records and determine if there are pending transactions
    setIsLoading(true);
    void loadRecords();
  }, [resolverKeysLoading, domain]);

  useEffect(() => {
    setButtonComponent(<></>);
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    setButtonComponent(
      <Box display="flex" flexDirection="column" width="100%">
        <Button
          variant="outlined"
          onClick={handleOpenModal}
          disabled={isPendingTx}
          className={classes.button}
          startIcon={<AddIcon />}
          fullWidth
        >
          {t('manage.addCurrency')}
        </Button>
        <LoadingButton
          variant="contained"
          onClick={handleSave}
          loading={isSaving}
          disabled={isPendingTx}
          fullWidth
        >
          {t('manage.startRecordUpdate')}
        </LoadingButton>
      </Box>,
    );
  }, [isPendingTx, isSaving, isLoading, records]);

  const loadRecords = async () => {
    const data = await getProfileData(domain, [
      DomainFieldTypes.Records,
      DomainFieldTypes.CryptoVerifications,
    ]);
    if (data?.records) {
      setFilteredRecords(data.records);
      setIsPendingTx(!!data?.metadata?.pending);
    }
    setProfileData(data);
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    if (updateFn) {
      // request the update function
      await updateFn(records);

      // update page state and return
      setIsPendingTx(true);
      setIsSaving(false);
      return;
    }
    setSaveClicked(true);
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
            setIsSignatureSuccess(true);
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
    setFilteredRecords({
      ...records,
    });
  };

  const handleInputDelete = (ids: string[]) => {
    ids.map(id => {
      deletedRecords.push(id);
      handleInputChange(id, '');
    });
  };

  const handleAddNewAddress = ({versions}: NewAddressRecord) => {
    const newValidAddresses = versions.filter(v => !v.deprecated);
    const newValidKeys = newValidAddresses.map(v => v.key);
    const newAddressRecords = newValidKeys.reduce(
      (acc, key) => ({...acc, [key]: ''}), // Adding new address records with empty values
      {},
    );
    setFilteredRecords({
      ...records,
      ...newAddressRecords,
    });
  };

  const handleOpenModal = () => {
    setIsModalOpened(true);
  };

  const handleCloseModal = () => {
    setIsModalOpened(false);
  };

  const setFilteredRecords = (allRecords: Record<string, string>) => {
    const filteredRecords: Record<string, string> = {};
    Object.keys(allRecords)
      .filter(k => !deletedRecords.includes(k) && (!filterFn || filterFn(k)))
      .sort((a, b) => a.localeCompare(b))
      .map(k => {
        filteredRecords[k] = allRecords[k];
      });
    setRecords({
      ...filteredRecords,
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
      notifyEvent(signError, 'warning', 'Profile', 'Signature', {
        msg: 'signature error',
      });
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
      notifyEvent(e, 'warning', 'Profile', 'Signature', {
        msg: 'error validating wallet',
      });
    }
    return false;
  };

  const renderMultiChainAddresses = () => {
    const recordsToRender = getMultichainAddressRecords(records, resolverKeys);

    return recordsToRender.map(multiChainRecord => (
      <MultiChainInput
        key={multiChainRecord.currency}
        versions={multiChainRecord.versions}
        currency={multiChainRecord.currency as CurrenciesType}
        domain={domain}
        ownerAddress={address}
        onDelete={handleInputDelete}
        onChange={handleInputChange}
        profileData={profileData}
        uiDisabled={!!isPendingTx}
        setWeb3Deps={setWeb3Deps}
        saveClicked={isSignatureSuccess}
        hideEndAdornment={hideVerifyButtons}
      />
    ));
  };

  const renderSingleChainAddresses = () => {
    const recordsToRender = getSingleChainAddressRecords(records, resolverKeys);
    return recordsToRender.map(singleChainAddressRecord => {
      const {currency, key, value} = singleChainAddressRecord;
      return (
        <CurrencyInput
          key={key}
          currency={currency}
          domain={domain}
          ownerAddress={address}
          value={value}
          recordKey={key}
          onDelete={handleInputDelete}
          onChange={handleInputChange}
          uiDisabled={!!isPendingTx}
          profileData={profileData}
          setWeb3Deps={setWeb3Deps}
          saveClicked={isSignatureSuccess}
          hideEndAdornment={hideVerifyButtons}
        />
      );
    });
  };

  return (
    <Box className={classes.container}>
      {!hideHeader && (
        <TabHeader
          icon={<MonetizationOnOutlinedIcon />}
          description={t('manage.cryptoAddressesDescription')}
          learnMoreLink="https://support.unstoppabledomains.com/support/solutions/articles/48001181827-add-crypto-addresses"
        />
      )}
      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={1}>
          <CircularProgress />
        </Box>
      ) : (
        <>
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
          <Box mt={2} width="100%">
            {renderSingleChainAddresses()}
            {renderMultiChainAddresses()}
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
          {isModalOpened && (
            <AddCurrencyModal
              open={isModalOpened}
              onClose={handleCloseModal}
              onAddNewAddress={handleAddNewAddress}
              isEns={false}
            />
          )}
        </>
      )}
    </Box>
  );
};

export type CryptoProps = ManageTabProps & {
  filterFn?: (k: string) => boolean;
  updateFn?: (records: Record<string, string>) => Promise<void>;
  hideHeader?: boolean;
  hideVerifyButtons?: boolean;
};
