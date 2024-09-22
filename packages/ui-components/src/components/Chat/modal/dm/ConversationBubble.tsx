/* eslint-disable @typescript-eslint/no-explicit-any */
import DownloadIcon from '@mui/icons-material/Download';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {ContentTypeRemoteAttachment} from '@xmtp/content-type-remote-attachment';
import {ContentTypeText} from '@xmtp/content-type-text';
import type {DecodedMessage} from '@xmtp/xmtp-js';
import React, {useEffect, useRef, useState} from 'react';
import Emoji from 'react-emoji-render';
import Linkify from 'react-linkify';
import Zoom from 'react-medium-image-zoom';

import {notifyEvent} from '../../../../lib/error';
import useTranslationContext from '../../../../lib/i18n';
import {formatFileSize, getRemoteAttachment} from '../../protocol/xmtp';
import LinkWarningModal from '../LinkWarningModal';
import {useConversationBubbleStyles} from '../styles';

export const ConversationBubble: React.FC<ConversationBubbleProps> = ({
  address,
  message,
  onBlockTopic,
  renderCallback,
}) => {
  const [t] = useTranslationContext();
  const messageRef = useRef<HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      notifyEvent(e, 'error', 'Messaging', 'XMTP', {
        msg: 'error loading message',
      });
      setRenderedContent(<Box>{t('push.errorLoadingMessage')}</Box>);
    }
  }, []);

  const renderContent = async () => {
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
    if (message.contentType.sameAs(ContentTypeText)) {
      setRenderedContent(
        <Box>
          <Linkify componentDecorator={componentDecorator}>
            <Emoji>{message.content}</Emoji>
          </Linkify>
        </Box>,
      );
      // handling for remote attachments
    } else if (message.contentType.sameAs(ContentTypeRemoteAttachment)) {
      // decrypt the attachment data
      setIsLoading(true);
      const attachment = await getRemoteAttachment(message);
      if (attachment) {
        // create a file reference for download
        const objectURL = URL.createObjectURL(
          new Blob([Buffer.from(attachment.data)], {
            type: attachment.mimeType,
          }),
        );

        // handling for image attachment types
        if (attachment.mimeType.toLowerCase().includes('image')) {
          // show the image content
          setRenderedContent(
            <Box>
              <Zoom>
                <img
                  className={
                    message.senderAddress.toLowerCase() ===
                    address.toLowerCase()
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
              download={attachment.filename}
              target="_blank"
              rel="noreferrer"
            >
              <DownloadIcon className={classes.downloadIcon} />
              <Typography variant="body2">
                {attachment.filename} (
                {formatFileSize(attachment.data.byteLength)})
              </Typography>
            </a>,
          );
        }

        // set the attachment styling
        setIsAttachment(true);
      } else {
        // show the fallback message if there was a problem getting attachment
        setRenderedContent(
          <Box>{message.contentFallback || t('push.attachment')}</Box>,
        );
      }
      setIsLoading(false);
    }
  };

  return (
    <Box
      ref={messageRef}
      className={cx(
        message.senderAddress.toLowerCase() === address.toLowerCase()
          ? classes.rightRow
          : classes.leftRow,
        message.senderAddress.toLowerCase() === address.toLowerCase()
          ? classes.rightMargin
          : classes.leftMargin,
      )}
    >
      <Box
        className={cx(
          message.senderAddress.toLowerCase() === address.toLowerCase()
            ? classes.rightRow
            : classes.leftRow,
        )}
      >
        <Box className={cx(classes.msgContainer)}>
          <Typography
            variant="body2"
            className={cx(
              classes.msg,
              message.senderAddress.toLowerCase() === address.toLowerCase()
                ? classes.right
                : classes.left,
              message.senderAddress.toLowerCase() === address.toLowerCase()
                ? classes.rightFirst
                : classes.leftFirst,
            )}
          >
            {isLoading ? (
              <Box
                className={
                  message.senderAddress.toLowerCase() === address.toLowerCase()
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
          <Tooltip title={message.sent.toLocaleString()}>
            <Typography variant="caption" className={classes.chatTimestamp}>
              {message.sent.toLocaleTimeString()}
            </Typography>
          </Tooltip>
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
  );
};

export type ConversationBubbleProps = {
  address: string;
  message: DecodedMessage;
  onBlockTopic: () => void;
  renderCallback?: (ref: React.RefObject<HTMLElement>) => void;
};

export default ConversationBubble;
