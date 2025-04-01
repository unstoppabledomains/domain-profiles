/* eslint-disable @typescript-eslint/no-explicit-any */
import DownloadIcon from '@mui/icons-material/Download';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {DecodedMessage} from '@xmtp/browser-sdk';
import {ContentTypeRemoteAttachment} from '@xmtp/content-type-remote-attachment';
import {ContentTypeText} from '@xmtp/content-type-text';
import React, {useRef, useState} from 'react';
import Emoji from 'react-emoji-render';
import Linkify from 'react-linkify';
import Zoom from 'react-medium-image-zoom';
import useAsyncEffect from 'use-async-effect';

import {notifyEvent} from '../../../../lib/error';
import useTranslationContext from '../../../../lib/i18n';
import {
  formatFileSize,
  getRemoteAttachment,
  getXmtpInboxId,
} from '../../protocol/xmtp';
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
  const [clientInboxId, setClientInboxId] = useState<string>();

  useAsyncEffect(async () => {
    if (renderCallback) {
      renderCallback(messageRef);
    }
    try {
      setClientInboxId(await getXmtpInboxId());
      await renderContent();
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
                    message.senderInboxId === clientInboxId
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
          <Box>{message.fallback || t('push.attachment')}</Box>,
        );
      }
      setIsLoading(false);
    }
  };

  return (
    <Box
      ref={messageRef}
      className={cx(
        message.senderInboxId === clientInboxId
          ? classes.rightRow
          : classes.leftRow,
        message.senderInboxId === clientInboxId
          ? classes.rightMargin
          : classes.leftMargin,
      )}
    >
      <Box
        className={cx(
          message.senderInboxId === clientInboxId
            ? classes.rightRow
            : classes.leftRow,
        )}
      >
        <Box className={cx(classes.msgContainer)}>
          <Typography
            variant="body2"
            className={cx(
              classes.msg,
              message.senderInboxId === clientInboxId
                ? classes.right
                : classes.left,
              message.senderInboxId === clientInboxId
                ? classes.rightFirst
                : classes.leftFirst,
            )}
          >
            {isLoading ? (
              <Box
                className={
                  message.senderInboxId === clientInboxId
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
          <Tooltip
            title={new Date(
              Number(message.sentAtNs / 1000000n),
            ).toLocaleTimeString()}
          >
            <Typography variant="caption" className={classes.chatTimestamp}>
              {new Date(
                Number(message.sentAtNs / 1000000n),
              ).toLocaleTimeString()}
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
