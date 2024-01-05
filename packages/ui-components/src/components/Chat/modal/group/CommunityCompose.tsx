/* eslint-disable @typescript-eslint/no-explicit-any */
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import type {IMessageIPFS} from '@pushprotocol/restapi';
import type {DragEvent} from 'react';
import React, {useEffect, useRef, useState} from 'react';

import config from '@unstoppabledomains/config';

import {useFeatureFlags} from '../../../../actions/featureFlagActions';
import {ProfileManager} from '../../../../components/Wallet/ProfileManager';
import {fetchApi} from '../../../../lib';
import {notifyError} from '../../../../lib/error';
import useTranslationContext from '../../../../lib/i18n';
import type {SerializedUserDomainProfileData} from '../../../../lib/types/domain';
import {DomainProfileKeys} from '../../../../lib/types/domain';
import type {Web3Dependencies} from '../../../../lib/types/web3';
import {sendMessage, sendRemoteAttachment} from '../../protocol/push';
import {formatFileSize} from '../../protocol/xmtp';
import {useConversationComposeStyles} from '../styles';

export const CommunityCompose: React.FC<CommunityComposeProps> = ({
  address,
  chatId,
  pushKey,
  storageApiKey: initialStorageApiKey,
  sendCallback,
  setWeb3Deps,
}) => {
  const [t] = useTranslationContext();
  const {data: featureFlags} = useFeatureFlags();
  const [authDomain, setAuthDomain] = useState<string | null>();
  const [storageApiKey, setStorageApiKey] = useState(initialStorageApiKey);
  const [uploadFile, setUploadFile] = useState<File>();
  const [signatureClicked, setSignatureClicked] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [textboxTerm, setTextboxTerm] = useState('');
  const [textboxFocus, setTextboxFocus] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const textboxRef = useRef<HTMLDivElement | null>(null);
  const {cx, classes} = useConversationComposeStyles({
    textboxFocus,
    textboxDrag: isDragging,
  });

  // set the primary domain and wallet address at page load time
  useEffect(() => {
    setAuthDomain(localStorage.getItem(DomainProfileKeys.AuthDomain));
  }, [address]);

  // detect if user clicks outside the compose textbox
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the clicked target is outside of the textbox
      if (
        textboxRef.current &&
        !textboxRef.current.contains(event.target as Node)
      ) {
        setTextboxFocus(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    if (textboxRef.current) {
      textboxRef.current.addEventListener('paste', handlePaste);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (textboxRef.current) {
        textboxRef.current.removeEventListener('paste', handlePaste);
      }
    };
  }, [textboxRef]);

  // start the file upload once a file is selected and storage key has been obtained
  useEffect(() => {
    if (!uploadFile || !storageApiKey) {
      return;
    }
    void handleUploadFile();
  }, [uploadFile, storageApiKey]);

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    // upload the file as an attachment
    event.preventDefault();
    setIsDragging(false);
    const items = Array.from(event.dataTransfer.files);
    if (items && items.length > 0) {
      // ensure storage key is available
      setSignatureClicked(true);

      // set the file to upload
      setUploadFile(items[0]);
    }
  };

  const handlePaste = async (event: ClipboardEvent) => {
    // check the clipboard for data that can be uploaded as an attachment

    const items = event.clipboardData?.items;
    if (items && items.length > 0) {
      if (items[0].type) {
        const fileToUpload = items[0].getAsFile();
        if (fileToUpload) {
          // ensure storage key is available
          event.preventDefault();
          setSignatureClicked(true);

          // set the file to upload
          setUploadFile(fileToUpload);
        }
      }
    }
  };

  const handleSend = async () => {
    if (!textboxTerm?.trim()) {
      return;
    }
    setIsSending(true);
    try {
      sendCallback(await sendMessage(chatId, address, pushKey, textboxTerm));
      setTextboxTerm('');
      setErrorMessage('');
    } catch (e) {
      notifyError(e, {msg: 'error sending message'});
      setErrorMessage(t('push.errorSendingMessage'));
    } finally {
      setIsSending(false);
    }
  };

  // handleUploadClicked remembers the user file upload selection
  const handleUploadClicked = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const {files} = event.target;
    const selectedFiles = files as FileList;
    const selectedFile = selectedFiles?.[0];

    // check attachment size
    if (selectedFile.size > config.XMTP.MAX_ATTACHMENT_BYTES) {
      setErrorMessage(
        t('push.errorAttachmentSize', {
          size: formatFileSize(config.XMTP.MAX_ATTACHMENT_BYTES),
        }),
      );
      return;
    }

    // store reference to file
    setUploadFile(selectedFile);
  };

  // handleUploadCallback fired once the ProfileManager has obtained a primary domain
  // signature and expiration time from the user. The user may be prompted to sign, or
  // a cached signature may be retrieved locally. ProfileManager figure it out.
  const handleUploadCallback = async (signature: string, expiry: string) => {
    try {
      // request the domain's user data from profile API
      if (authDomain && signature && expiry) {
        const userProfile = await fetchApi<SerializedUserDomainProfileData>(
          `/user/${authDomain}?fields=profile`,
          {
            host: config.PROFILE.HOST_URL,
            mode: 'cors',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'x-auth-domain': authDomain,
              'x-auth-expires': expiry,
              'x-auth-signature': signature,
            },
          },
        );

        // set user profile data from result
        if (userProfile?.storage) {
          setStorageApiKey(userProfile.storage.apiKey);
        }
      }
    } catch (e) {
      notifyError(e, {msg: 'unable to load user profile'});
    }
  };

  // handleUploadFile transmits the selected file to remote storage
  const handleUploadFile = async () => {
    // only allow media uploads if feature flag enabled
    if (
      !featureFlags.variations?.ecommerceServiceUsersEnableChatCommunityMedia
    ) {
      setErrorMessage(t('push.unsupportedContent'));
      return;
    }

    if (uploadFile && storageApiKey) {
      try {
        // retrieve the attachment from device
        setIsSending(true);

        // send the attachment
        const sentMessage = await sendRemoteAttachment(
          chatId,
          address,
          pushKey,
          storageApiKey,
          uploadFile,
        );
        sendCallback(sentMessage);
        setErrorMessage('');
      } catch (e) {
        notifyError(e, {msg: 'error uploading file'});
        setErrorMessage(t('push.errorSendingAttachment'));
      } finally {
        setUploadFile(undefined);
        setIsSending(false);
      }
    }
  };

  const handleKeyDown: React.KeyboardEventHandler = event => {
    if (event.key === 'Enter') {
      void handleSend();
    }
  };

  const handleMessageChange: React.ChangeEventHandler<
    HTMLInputElement
  > = event => {
    setTextboxTerm(event.target.value);
  };

  return (
    <Box
      className={classes.textboxContainer}
      ref={textboxRef}
      onDrop={handleDrop}
      onDragOver={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
    >
      {featureFlags.variations
        ?.ecommerceServiceUsersEnableChatCommunityMedia && (
        <IconButton
          disableRipple={true}
          component="label"
          onClick={() => setSignatureClicked(true)}
        >
          <input hidden type="file" onChange={handleUploadClicked} />
          <AddCircleOutlineOutlinedIcon className={classes.attachIcon} />
        </IconButton>
      )}
      <InputBase
        id="textbox-input"
        fullWidth
        className={classes.textboxBase}
        inputProps={{
          className: classes.textboxInput,
        }}
        type="search"
        inputRef={input => input?.focus()}
        disabled={isSending || chatId === undefined}
        value={textboxTerm}
        autoComplete="off"
        autoCorrect="off"
        placeholder={
          isSending
            ? t('push.uploading')
            : isDragging
            ? t('push.dropToUpload')
            : t('push.typeMessage')
        }
        onChange={handleMessageChange}
        onFocus={() => setTextboxFocus(true)}
        onKeyDown={handleKeyDown}
        endAdornment={
          <Box className={classes.actionContainer}>
            {isSending ? (
              <CircularProgress
                size="24px"
                className={classes.sendingProgress}
              />
            ) : (
              <Tooltip title={errorMessage} arrow placement="top">
                <SendOutlinedIcon
                  onClick={handleSend}
                  className={cx(
                    classes.icon,
                    errorMessage ? classes.sendIconError : classes.sendIcon,
                  )}
                />
              </Tooltip>
            )}
          </Box>
        }
      />
      {authDomain && (
        <ProfileManager
          domain={authDomain}
          ownerAddress={address}
          setWeb3Deps={setWeb3Deps}
          saveClicked={signatureClicked && !storageApiKey}
          setSaveClicked={setSignatureClicked}
          onSignature={handleUploadCallback}
        />
      )}
    </Box>
  );
};

export type CommunityComposeProps = {
  address: string;
  chatId: string;
  pushKey: string;
  storageApiKey?: string;
  sendCallback: (message: IMessageIPFS) => void;
  setWeb3Deps: (value: Web3Dependencies | undefined) => void;
};

export default CommunityCompose;
