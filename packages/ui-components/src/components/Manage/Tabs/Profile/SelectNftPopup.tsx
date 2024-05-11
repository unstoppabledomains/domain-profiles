import CloseIcon from '@mui/icons-material/Close';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Markdown from 'markdown-to-jsx';
import React, {useState} from 'react';
import truncateEthAddress from 'truncate-eth-address';

import {
  confirmRecordUpdate,
  getRegistrationMessage,
  initiateRecordUpdate,
  registerWallet,
} from '../../../../actions/pav3Actions';
import {useWeb3Context} from '../../../../hooks';
import {useTranslationContext} from '../../../../lib';
import {notifyEvent} from '../../../../lib/error';
import useStyles from '../../../../styles/components/SelectUrlPopup.styles';
import {ProfileManager} from '../../../Wallet/ProfileManager';
import FormError from '../../common/FormError';

export type SelectNftPopupProps = {
  domain: string;
  address: string;
  popupOpen: boolean;
  handlePopupClose: () => void;
  handleSelectNftClick: (nftSpec: string) => void;
};

const isValidNftSpec = (nftSpec: string) => {
  if (!nftSpec) {
    return false;
  }
  if (!nftSpec.match(/(\d+)\/(erc721|erc1155):0x[a-fA-F0-9]{40}\/(\d+)/)) {
    return false;
  }
  return true;
};

const SelectNftPopup: React.FC<SelectNftPopupProps> = ({
  domain,
  address,
  popupOpen,
  handlePopupClose,
  handleSelectNftClick,
}) => {
  const [t] = useTranslationContext();
  const {classes} = useStyles();
  const [nftSpec, setNftSpec] = useState<string>('');
  const [blurred, setBlurred] = useState<boolean>(false);
  const [saveClicked, setSaveClicked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const {web3Deps, setWeb3Deps} = useWeb3Context();

  const isValid = isValidNftSpec(nftSpec);
  const isError = blurred && !isValidNftSpec(nftSpec);

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
        {
          'social.picture.value': nftSpec,
        },
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
            handleSelectNftClick(nftSpec);
            handlePopupClose();
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
    <Dialog
      open={popupOpen}
      onClose={handlePopupClose}
      classes={{paper: classes.dialogRoot}}
    >
      <Typography variant="h5" className={classes.dialogHeader}>
        {t('manage.enterAvatarNft')}
        <IconButton data-testid="nft-close-button" onClick={handlePopupClose}>
          <CloseIcon />
        </IconButton>
      </Typography>
      <DialogContent className={classes.dialogContent}>
        <Typography
          variant="body2"
          component="div"
          className={classes.dialogSubheader}
        >
          <Markdown>
            {t('manage.avatarNftRequirements', {
              address: truncateEthAddress(address),
            })}
          </Markdown>
        </Typography>
        <TextField
          fullWidth
          value={nftSpec}
          label={t('manage.avatarNft')}
          onChange={event => {
            setBlurred(false);
            setNftSpec(event.target.value);
          }}
          onBlur={() => {
            setBlurred(true);
          }}
          error={isError}
        />
        {isError && (
          <Box mt={1}>
            <FormError message={t('manage.enterValidNft')} />
          </Box>
        )}
      </DialogContent>
      <Divider />
      <DialogActions className={classes.dialogActions}>
        <LoadingButton
          disabled={nftSpec === '' || !isValid}
          variant="contained"
          color="primary"
          onClick={handleSave}
          loading={isSaving}
          className={classes.dialogConfirmButton}
          disableElevation
        >
          {t('common.done')}
        </LoadingButton>
      </DialogActions>
      <ProfileManager
        domain={domain}
        ownerAddress={address}
        setWeb3Deps={setWeb3Deps}
        saveClicked={saveClicked}
        setSaveClicked={setSaveClicked}
        onSignature={handleRecordUpdate}
        forceWalletConnected={true}
      />
    </Dialog>
  );
};

export default SelectNftPopup;
