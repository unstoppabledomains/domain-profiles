/* eslint-disable @typescript-eslint/no-explicit-any */
import BlockIcon from '@mui/icons-material/Block';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {IMessageIPFS} from '@pushprotocol/restapi';
import React, {useEffect, useRef, useState} from 'react';
import type {MouseEvent} from 'react';
import Emoji from 'react-emoji-render';
import Linkify from 'react-linkify';
import Zoom from 'react-medium-image-zoom';

import config from '@unstoppabledomains/config';

import {useFeatureFlags} from '../../../../actions/featureFlagActions';
import {notifyError} from '../../../../lib/error';
import useTranslationContext from '../../../../lib/i18n';
import {
  MessageType,
  PUSH_DECRYPT_ERROR_MESSAGE,
  decryptMessage,
} from '../../protocol/push';
import {getAddressMetadata} from '../../protocol/resolution';
import {formatFileSize} from '../../protocol/xmtp';
import LinkWarningModal from '../LinkWarningModal';
import {useConversationBubbleStyles} from '../styles';

export const CommunityConversationBubble: React.FC<
  CommunityConversationBubbleProps
> = ({
  address,
  hideAvatar,
  message: encryptedMessage,
  pushKey,
  blocked,
  onBlockUser,
  onUnblockUser,
  renderCallback,
}) => {
  const [t] = useTranslationContext();
  const {data: featureFlags} = useFeatureFlags();
  const messageRef = useRef<HTMLElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [isDecryptionError, setIsDecryptionError] = useState(false);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [peerAvatarLink, setPeerAvatarLink] = useState<string>();
  const [peerDisplayName, setPeerDisplayName] = useState<string>();
  const [isAttachment, setIsAttachment] = useState(false);
  const [renderedContent, setRenderedContent] = useState<React.ReactElement>();
  const [clickedUrl, setClickedUrl] = useState<string>();
  const {cx, classes} = useConversationBubbleStyles({isAttachment});

  useEffect(() => {
    void renderContent();
  }, []);

  const handleOpenMenu = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleBlockUser = async () => {
    setIsBlocking(true);
    const blockFn = blocked ? onUnblockUser : onBlockUser;
    await blockFn();
    setIsBlocking(false);
  };

  const renderPeerAvatar = async (peerAddress: string) => {
    if (peerAddress.toLowerCase().includes(address.toLowerCase())) {
      return;
    }
    const addressData = await getAddressMetadata(peerAddress);
    setPeerDisplayName(addressData?.name || peerAddress);
    setPeerAvatarLink(addressData?.avatarUrl);
  };

  const renderContent = async () => {
    try {
      // decrypt the message if needed
      const message = await decryptMessage(address, pushKey, encryptedMessage);
      if (!message) {
        setIsDecryptionError(true);
        return;
      }

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
        messageToRender.toLowerCase() ===
        PUSH_DECRYPT_ERROR_MESSAGE.toLowerCase()
      ) {
        setIsDecryptionError(true);
        return;
      }

      // load the peer avatar
      if (!hideAvatar) {
        await renderPeerAvatar(
          MessageType.Meta && (message.messageObj as any)?.info?.affected
            ? (message.messageObj as any).info.affected[0]
            : message.fromCAIP10.replace('eip155:', ''),
        );
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
        if (renderCallback) {
          renderCallback(messageRef);
        }
      } else if (message.messageType === MessageType.Meta) {
        // handling of meta message
        const metaData = message.messageObj as any;
        setRenderedContent(
          <Typography variant="caption">
            {metaData.content === 'REMOVE_MEMBER'
              ? t('common.left')
              : t('common.joined')}
            {message.timestamp &&
              ` @ ${new Date(message.timestamp).toLocaleTimeString()}`}
          </Typography>,
        );
      } else if (
        // handling for remote attachments
        message.messageType === MessageType.Media &&
        featureFlags.variations?.ecommerceServiceUsersEnableChatCommunityMedia
      ) {
        setIsMediaLoading(true);

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
        setIsMediaLoading(false);
        if (renderCallback) {
          renderCallback(messageRef);
        }
      } else {
        setRenderedContent(
          <Typography
            className={classes.unsupportedMediaText}
            variant="caption"
          >
            {t('push.unsupportedContent')}
          </Typography>,
        );
      }
    } catch (e) {
      notifyError(e, {msg: 'error loading message'});
    } finally {
      setIsDecrypting(false);
    }
  };

  return renderedContent ? (
    blocked ? null : encryptedMessage.messageType === MessageType.Meta ? (
      <Box ref={messageRef} className={classes.metadata}>
        <Typography mr={0.5} variant="caption">
          -- {peerDisplayName}
        </Typography>
        {renderedContent}
        <Typography ml={0.5} variant="caption">
          --
        </Typography>
      </Box>
    ) : (
      <Box
        ref={messageRef}
        className={cx(
          encryptedMessage.fromCAIP10
            .toLowerCase()
            .includes(address.toLowerCase())
            ? classes.rightRow
            : classes.leftRow,
          encryptedMessage.fromCAIP10
            .toLowerCase()
            .includes(address.toLowerCase())
            ? classes.rightMargin
            : classes.leftMargin,
        )}
      >
        <Box
          className={
            encryptedMessage.fromCAIP10
              .toLowerCase()
              .includes(address.toLowerCase())
              ? undefined
              : classes.avatarContainer
          }
        >
          {peerAvatarLink && peerDisplayName && (
            <Box>
              <Tooltip title={peerDisplayName}>
                <Avatar
                  onClick={handleOpenMenu}
                  src={peerAvatarLink}
                  className={classes.avatar}
                />
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                onClose={handleCloseMenu}
                open={Boolean(anchorEl)}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
              >
                <MenuItem
                  onClick={() =>
                    window.open(
                      `${config.UD_ME_BASE_URL}/${peerDisplayName}`,
                      '_blank',
                    )
                  }
                >
                  <ListItemIcon>
                    <InfoOutlinedIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="body2">
                    {t('profile.viewProfile')}
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleBlockUser}>
                  <ListItemIcon>
                    {isBlocking ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <BlockIcon fontSize="small" />
                    )}
                  </ListItemIcon>
                  <Typography variant="body2">
                    {blocked ? t('manage.unblock') : t('push.blockAndReport')}
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}
          <Box
            className={cx(
              encryptedMessage.fromCAIP10
                .toLowerCase()
                .includes(address.toLowerCase())
                ? classes.rightRow
                : classes.leftRow,
            )}
          >
            <Box className={cx(classes.msgContainer)}>
              {peerDisplayName && (
                <Typography
                  variant="caption"
                  className={classes.chatDisplayName}
                >
                  {peerDisplayName}
                </Typography>
              )}
              <Typography
                variant="body2"
                className={cx(
                  classes.msg,
                  encryptedMessage.fromCAIP10
                    .toLowerCase()
                    .includes(address.toLowerCase())
                    ? classes.right
                    : classes.left,
                  encryptedMessage.fromCAIP10
                    .toLowerCase()
                    .includes(address.toLowerCase())
                    ? classes.rightFirst
                    : classes.leftFirst,
                )}
              >
                {isMediaLoading ? (
                  <Box
                    className={
                      encryptedMessage.fromCAIP10
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
              {encryptedMessage.timestamp && (
                <Tooltip
                  title={new Date(encryptedMessage.timestamp).toLocaleString()}
                >
                  <Typography
                    variant="caption"
                    className={classes.chatTimestamp}
                  >
                    {new Date(encryptedMessage.timestamp).toLocaleTimeString()}
                  </Typography>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>
        {clickedUrl && (
          <LinkWarningModal
            url={clickedUrl}
            onBlockTopic={onBlockUser}
            onClose={() => setClickedUrl(undefined)}
          />
        )}
      </Box>
    )
  ) : (
    <Box ref={messageRef} className={classes.metadata}>
      <Tooltip title={isDecryptionError ? t('push.encryptedDescription') : ''}>
        <Typography variant="caption">
          <Box
            className={cx(classes.metadata, {
              [classes.encryptedStateWarning]: isDecryptionError,
            })}
          >
            --
            {isDecrypting ? (
              <CircularProgress
                size={10}
                className={classes.encryptStateIcon}
              />
            ) : (
              isDecryptionError && (
                <LockOutlinedIcon
                  className={cx(
                    classes.encryptStateIcon,
                    classes.encryptedStateWarning,
                  )}
                />
              )
            )}
            {isDecrypting
              ? t('push.decrypting')
              : isDecryptionError && t('push.encrypted')}{' '}
            --
          </Box>
        </Typography>
      </Tooltip>
    </Box>
  );
};

export type CommunityConversationBubbleProps = {
  address: string;
  hideAvatar?: string;
  message: IMessageIPFS;
  pushKey: string;
  blocked?: boolean;
  onBlockUser: () => Promise<void>;
  onUnblockUser: () => Promise<void>;
  renderCallback?: (ref: React.RefObject<HTMLElement>) => void;
};

export default CommunityConversationBubble;
