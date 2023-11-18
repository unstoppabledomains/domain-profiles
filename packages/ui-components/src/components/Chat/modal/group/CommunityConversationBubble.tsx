/* eslint-disable @typescript-eslint/no-explicit-any */
import DownloadIcon from '@mui/icons-material/Download';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {IMessageIPFS} from '@pushprotocol/restapi';
import React, {useEffect, useRef, useState} from 'react';
import Emoji from 'react-emoji-render';
import Linkify from 'react-linkify';
import Zoom from 'react-medium-image-zoom';

import {useFeatureFlags} from '../../../../actions/featureFlagActions';
import {notifyError} from '../../../../lib/error';
import useTranslationContext from '../../../../lib/i18n';
import {MessageType, PUSH_DECRYPT_ERROR_MESSAGE} from '../../protocol/push';
import {getAddressMetadata} from '../../protocol/resolution';
import {formatFileSize} from '../../protocol/xmtp';
import LinkWarningModal from '../LinkWarningModal';
import {useConversationBubbleStyles} from '../styles';

export const CommunityConversationBubble: React.FC<
  CommunityConversationBubbleProps
> = ({address, hideAvatar, message, onBlockTopic, renderCallback}) => {
  const [t] = useTranslationContext();
  const {data: featureFlags} = useFeatureFlags();
  const messageRef = useRef<HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [peerAvatarLink, setPeerAvatarLink] = useState<string>();
  const [peerDisplayName, setPeerDisplayName] = useState<string>();
  const [isAttachment, setIsAttachment] = useState(false);
  const [renderedContent, setRenderedContent] = useState<React.ReactElement>();
  const [clickedUrl, setClickedUrl] = useState<string>();
  const {cx, classes} = useConversationBubbleStyles({isAttachment});

  useEffect(() => {
    if (renderCallback) {
      renderCallback(messageRef);
    }
    try {
      void renderContent();
    } catch (e) {
      notifyError(e, {msg: 'error loading message'});
      setRenderedContent(<Box>{t('push.errorLoadingMessage')}</Box>);
    }
  }, []);

  const renderPeerAvatar = async () => {
    const peerAddress = message.fromCAIP10.replace('eip155:', '');
    if (peerAddress.toLowerCase().includes(address.toLowerCase())) {
      return;
    }
    const addressData = await getAddressMetadata(peerAddress);
    setPeerDisplayName(addressData?.name || peerAddress);
    setPeerAvatarLink(addressData?.avatarUrl);
  };

  const renderContent = async () => {
    // build message object if required from deprecated client
    if (!message.messageObj) {
      message.messageObj = {
        content:
          message.messageType === 'Text'
            ? message.messageContent
            : t('push.unsupportedContent'),
      };
    }

    // build message text to render
    const messageToRender =
      typeof message.messageObj === 'string'
        ? (message.messageObj as string)
        : (message.messageObj.content as string);

    // return early if the message is not decrypted
    if (
      messageToRender.toLowerCase() === PUSH_DECRYPT_ERROR_MESSAGE.toLowerCase()
    ) {
      return;
    }

    // load the peer avatar
    if (!hideAvatar) {
      await renderPeerAvatar();
    }

    // decorator for links
    const componentDecorator = (href: string, text: string, key: number) => (
      <div
        key={key}
        className={classes.chatLink}
        onClick={() => setClickedUrl(href)}
      >
        {text}
      </div>
    );

    // handling for text content type
    if (message.messageType === MessageType.Text) {
      setRenderedContent(
        <Box>
          <Linkify componentDecorator={componentDecorator}>
            <Emoji>{messageToRender}</Emoji>
          </Linkify>
        </Box>,
      );
      // handling for remote attachments
    } else if (
      message.messageType === MessageType.Media &&
      featureFlags.variations?.ecommerceServiceUsersEnableChatCommunityMedia
    ) {
      setIsLoading(true);

      // fetch the remote media
      const mediaUrl =
        typeof message.messageObj === 'string'
          ? message.messageObj
          : (message.messageObj.content as string);
      const fetchResponse = await fetch(mediaUrl);

      // process the media response
      if (fetchResponse) {
        // create a file reference for download
        const mediaBlob = await fetchResponse.blob();
        const objectURL = URL.createObjectURL(mediaBlob);

        // handling for image attachment types
        if (mediaUrl.toLowerCase().includes('image/')) {
          // show the image content
          setRenderedContent(
            <Box>
              <Zoom>
                <img
                  className={
                    message.fromCAIP10
                      .toLowerCase()
                      .includes(address.toLowerCase())
                      ? classes.imageAttachmentRight
                      : classes.imageAttachmentLeft
                  }
                  src={objectURL}
                />
              </Zoom>
            </Box>,
          );
        }
        // handling for non-image attachment types
        else {
          // show generic download icon
          setRenderedContent(
            <a
              className={classes.genericAttachment}
              href={objectURL}
              download={t('common.download')}
              target="_blank"
              rel="noreferrer"
            >
              <DownloadIcon className={classes.downloadIcon} />
              <Typography variant="body2">
                {t('common.download')} ({formatFileSize(mediaBlob.size)})
              </Typography>
            </a>,
          );
        }

        // set the attachment styling
        setIsAttachment(true);
      }
      setIsLoading(false);
    } else {
      setRenderedContent(
        <Typography className={classes.unsupportedMediaText} variant="caption">
          {t('push.unsupportedContent')}
        </Typography>,
      );
    }
  };

  return renderedContent ? (
    <Box
      ref={messageRef}
      className={cx(
        message.fromCAIP10.toLowerCase().includes(address.toLowerCase())
          ? classes.rightRow
          : classes.leftRow,
        message.fromCAIP10.toLowerCase().includes(address.toLowerCase())
          ? classes.rightMargin
          : classes.leftMargin,
      )}
    >
      <Box
        className={
          message.fromCAIP10.toLowerCase().includes(address.toLowerCase())
            ? undefined
            : classes.avatarContainer
        }
      >
        {peerAvatarLink && peerDisplayName && (
          <Tooltip title={peerDisplayName}>
            <Avatar src={peerAvatarLink} className={classes.avatar} />
          </Tooltip>
        )}
        <Box
          className={cx(
            message.fromCAIP10.toLowerCase().includes(address.toLowerCase())
              ? classes.rightRow
              : classes.leftRow,
          )}
        >
          <Box className={cx(classes.msgContainer)}>
            {peerDisplayName && (
              <Typography variant="caption" className={classes.chatDisplayName}>
                {peerDisplayName}
              </Typography>
            )}
            <Typography
              variant="body2"
              className={cx(
                classes.msg,
                message.fromCAIP10.toLowerCase().includes(address.toLowerCase())
                  ? classes.right
                  : classes.left,
                message.fromCAIP10.toLowerCase().includes(address.toLowerCase())
                  ? classes.rightFirst
                  : classes.leftFirst,
              )}
            >
              {isLoading ? (
                <Box
                  className={
                    message.fromCAIP10
                      .toLowerCase()
                      .includes(address.toLowerCase())
                      ? classes.loadingContainerRight
                      : classes.loadingContainerLeft
                  }
                >
                  <CircularProgress className={classes.loadingIcon} />
                  <Typography variant="caption">
                    {t('push.loadingAttachment')}
                  </Typography>
                </Box>
              ) : (
                renderedContent
              )}
            </Typography>
            {message.timestamp && (
              <Typography variant="caption" className={classes.chatTimestamp}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      {clickedUrl && (
        <LinkWarningModal
          url={clickedUrl}
          onBlockTopic={onBlockTopic}
          onClose={() => setClickedUrl(undefined)}
        />
      )}
    </Box>
  ) : null;
};

export type CommunityConversationBubbleProps = {
  address: string;
  hideAvatar?: string;
  message: IMessageIPFS;
  onBlockTopic: () => void;
  renderCallback?: (ref: React.RefObject<HTMLElement>) => void;
};

export default CommunityConversationBubble;
