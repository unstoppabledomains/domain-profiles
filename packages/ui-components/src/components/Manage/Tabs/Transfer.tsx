import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
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
import {useDebounce} from 'usehooks-ts';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileData} from '../../../actions';
import {
  confirmRecordUpdate,
  getRegistrationMessage,
  initiateTransferDomain,
  registerWallet,
} from '../../../actions/pav3Actions';
import {useWeb3Context} from '../../../hooks';
import type {CreateTransaction} from '../../../lib';
import {
  DomainFieldTypes,
  isExternalDomain,
  useTranslationContext,
} from '../../../lib';
import {notifyEvent} from '../../../lib/error';
import type {RecordUpdateResponse} from '../../../lib/types/pav3';
import {getAddressMetadata, isEthAddress} from '../../Chat/protocol/resolution';
import {ProfileManager} from '../../Wallet/ProfileManager';
import ManageInput from '../common/ManageInput';
import {TabHeader} from '../common/TabHeader';
import type {ManageTabProps} from '../common/types';
import {getBlockchainName} from '../common/verification/types';

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
  icon: {
    color: theme.palette.success.main,
    marginRight: theme.spacing(1),
    height: '15px',
    width: '15px',
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

export const Transfer: React.FC<TransferTabProps> = ({
  address,
  domain,
  metadata,
  setButtonComponent,
}) => {
  const {classes} = useStyles();
  const {web3Deps, setWeb3Deps} = useWeb3Context();
  const [saveClicked, setSaveClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isPendingTx, setIsPendingTx] = useState<boolean>();
  const [recipientAddressInput, setRecipientAddressInput] =
    useState<string>('');
  const debouncedRecipientAddressInput = useDebounce<string>(
    recipientAddressInput,
    500,
  );
  const [recipientAddress, setRecipientAddress] = useState<string>();
  const [invalidAddress, setInvalidAddress] = useState(false);
  const [checkboxMap, setCheckboxMap] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string>();
  const [t] = useTranslationContext();

  // blockchain to display for transfer warning
  const chainName = getBlockchainName(metadata.blockchain as string);
  const isEns = (metadata.type as string)?.toLowerCase() === 'ens';
  const isErc1155 = (metadata.tokenType as string)?.toLowerCase() === 'erc1155';

  useEffect(() => {
    // set page to initial loading state
    setIsLoading(true);
    setButtonComponent(<></>);

    // determine if page is enabled
    if (isEns && !isErc1155) {
      setIsDisabled(true);
      setErrorMessage(t('manage.transferDisabledForErc721'));
    }

    // check for pending records
    if (metadata) {
      setIsPendingTx(!!metadata.pending);
    }

    // loading completed
    setIsLoading(false);
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
        disabled={
          errorMessage !== undefined ||
          invalidAddress ||
          isPendingTx ||
          isDisabled ||
          !isDirty ||
          !checkboxMap['1'] ||
          !checkboxMap['2'] ||
          !checkboxMap['3']
        }
        fullWidth
      >
        {errorMessage || t('manage.startTransfer')}
      </LoadingButton>,
    );
  }, [
    isSaving,
    invalidAddress,
    isPendingTx,
    isDirty,
    isDisabled,
    isLoading,
    checkboxMap,
    errorMessage,
  ]);

  useEffect(() => {
    void validateRecipientAddress(debouncedRecipientAddressInput);
  }, [debouncedRecipientAddressInput]);

  const handleSave = () => {
    setSaveClicked(true);
    setIsSaving(true);
  };

  const validateRecipientAddress = async (v: string) => {
    if (!v) {
      return;
    }

    // lookup address resolution
    const resolutionData = await getAddressMetadata(v);
    if (resolutionData?.address) {
      setRecipientAddress(resolutionData.address);
      setInvalidAddress(false);
      return;
    }

    // validate the EVM address format
    const isValid = v.length > 0 && isEthAddress(v);
    setRecipientAddress(isValid ? v : undefined);
    setInvalidAddress(!isValid);
  };

  const handleInputChange = async (_id: string, value: string) => {
    setIsDirty(true);
    setRecipientAddress('');
    setRecipientAddressInput(value);
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
      // validate recipient address
      if (!recipientAddress) {
        setInvalidAddress(true);
        return;
      }

      // initiate a record update
      const updateRequest = await initiateTransferDomain(
        address,
        domain,
        recipientAddress,
        checkboxMap['4'] || false,
        {
          expires: expiry,
          signature,
        },
      );
      if (updateRequest) {
        // transfer the domain using the required handler
        const txResult = isEns
          ? await handleEnsTransferRequest(updateRequest, signature, expiry)
          : await handleUnsTransferRequest(updateRequest, signature, expiry);
        if (!txResult) {
          setErrorMessage(t('manage.recordSignatureError'));
        }
      } else {
        setErrorMessage(t('manage.transferRequestError'));
      }
    }

    // record update was not successful
    setIsSaving(false);
  };

  // handle transfer for UNS domains
  const handleUnsTransferRequest = async (
    updateRequest: RecordUpdateResponse,
    signature: string,
    expiry: string,
  ): Promise<string | undefined> => {
    if (updateRequest.transaction.messageToSign) {
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
          return txSignature;
        } else {
          setErrorMessage(t('manage.recordSignatureError'));
        }
      }
    }
    return undefined;
  };

  // handle transfer for ENS domains
  const handleEnsTransferRequest = async (
    updateRequest: RecordUpdateResponse,
    signature: string,
    expiry: string,
  ): Promise<string | undefined> => {
    if (
      updateRequest.transaction.contractAddress &&
      updateRequest.transaction.data
    ) {
      const txSignature = await getTransaction(
        updateRequest.transaction.contractAddress,
        updateRequest.transaction.data,
      );
      if (txSignature) {
        // submit confirmation signature to complete transaction
        if (
          await confirmRecordUpdate(
            domain,
            updateRequest.operationId,
            updateRequest.dependencyId,
            {txHash: txSignature},
            {
              expires: expiry,
              signature,
            },
          )
        ) {
          // record updates successful
          setIsSaving(false);
          setIsPendingTx(true);
          return txSignature;
        } else {
          setErrorMessage(t('manage.recordSignatureError'));
        }
      }
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

  // getTransaction prompts the user to sign a transaction
  const getTransaction = async (
    contractAddress: string,
    data: string,
  ): Promise<string | undefined> => {
    try {
      if (!web3Deps) {
        return undefined;
      }

      // sign a message linking the domain and secondary wallet address
      const txRequest: CreateTransaction = {
        chainId: metadata.networkId as unknown as number,
        to: contractAddress,
        data,
        value: '0',
      };
      return await web3Deps.signer.signTransaction(txRequest);
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
              mt={2}
              id="recipientAddress"
              value={recipientAddressInput}
              label={t('manage.recipientAddress')}
              placeholder={t('manage.enterRecipientAddress')}
              onChange={handleInputChange}
              disableTextTrimming
              error={invalidAddress}
              errorText={t('manage.enterValidRecipientAddress')}
              stacked={false}
              disabled={isPendingTx || isDisabled}
            />
            {recipientAddress && !invalidAddress && (
              <Box display="flex" alignItems="center" mt={1} ml={16}>
                <CheckOutlinedIcon className={classes.icon} />
                <Typography variant="caption">{recipientAddress}</Typography>
              </Box>
            )}
            <Box className={classes.checkboxContainer}>
              <FormGroup>
                {['1', '2', '3', '4'].map(key => {
                  if (isExternalDomain(domain) && key === '4') {
                    return;
                  }
                  return (
                    <FormControlLabel
                      key={`checkbox-${key}`}
                      disabled={isPendingTx || isDisabled}
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
                          {t(`manage.transferConfirmation${key}`, {chainName})}
                        </Typography>
                      }
                    />
                  );
                })}
              </FormGroup>
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
        </Box>
      )}
    </Box>
  );
};

export type TransferTabProps = ManageTabProps & {
  metadata: Record<string, string | boolean>;
};
