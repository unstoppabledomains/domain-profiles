/* eslint-disable @typescript-eslint/no-explicit-any */
import BlockIcon from '@mui/icons-material/Block';
import DownloadIcon from '@mui/icons-material/Download';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
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
  sendReaction,
} from '../../protocol/push';
import {getAddressMetadata} from '../../protocol/resolution';
import type {Reaction} from '../../protocol/types';
import {formatFileSize} from '../../protocol/xmtp';
import {fromCaip10Address} from '../../types';
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
  emojiReactions,
  setEmojiReactions,
  onBlockUser,
  onUnblockUser,
  renderCallback,
}) => {
  const [t] = useTranslationContext();
  const {data: featureFlags} = useFeatureFlags();
  const messageRef = useRef<HTMLElement>(null);
  const [message, setMessage] = useState<IMessageIPFS>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isMouseOver, setIsMouseOver] = useState(false);
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

  const handleOpenEmojiPicker = () => {
    setIsEmojiPickerOpen(true);
  };

  const handleCloseEmojiPicker = () => {
    setIsEmojiPickerOpen(false);
  };

  const handleSendEmoji = async (e: string) => {
    setIsEmojiPickerOpen(false);
    if (!message?.link) {
      return;
    }
    await sendReaction(message.toCAIP10, address, pushKey, message.link, e);
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

  const handleMouseOver = () => {
    setIsMouseOver(true);
  };

  const handleMouseOut = () => {
    setIsMouseOver(false);
  };

  const renderPeerAvatar = async (peerAddress: string) => {
    if (peerAddress.toLowerCase().includes(address.toLowerCase())) {
      return;
    }
    const addressData = await getAddressMetadata(peerAddress);
    setPeerDisplayName(addressData?.name || peerAddress);
    setPeerAvatarLink(addressData?.avatarUrl);
    return addressData?.name || peerAddress;
  };

  const renderContent = async () => {
    try {
      // decrypt the message if needed
      const decryptedMessage = await decryptMessage(
        address,
        pushKey,
        encryptedMessage,
      );
      if (!decryptedMessage) {
        setIsDecryptionError(true);
        return;
      }

      // build message object if required from deprecated client
      setMessage(decryptedMessage);
      if (!decryptedMessage.messageObj) {
        decryptedMessage.messageObj = {
          content:
            decryptedMessage.messageType === 'Text'
              ? decryptedMessage.messageContent
              : t('push.unsupportedContent'),
        };
      }

      // build message text to render
      const messageToRender =
        typeof decryptedMessage.messageObj === 'string'
          ? (decryptedMessage.messageObj as string)
          : (decryptedMessage.messageObj.content as string);

      // return early if the message is not decrypted
      if (
        messageToRender.toLowerCase() ===
        PUSH_DECRYPT_ERROR_MESSAGE.toLowerCase()
      ) {
        setIsDecryptionError(true);
        return;
      }

      // load the peer avatar
      const peerAddress =
        MessageType.Meta && (decryptedMessage.messageObj as any)?.info?.affected
          ? (decryptedMessage.messageObj as any).info.affected[0]
          : decryptedMessage.fromCAIP10.replace('eip155:', '');
      const displayName = hideAvatar ? '' : await renderPeerAvatar(peerAddress);

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
      if (decryptedMessage.messageType === MessageType.Text) {
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
      } else if (decryptedMessage.messageType === MessageType.Reaction) {
        if (decryptedMessage.link) {
          emojiReactions.push({
            messageId: (decryptedMessage.messageObj as any)?.reference,
            senderAddress: fromCaip10Address(decryptedMessage.fromCAIP10) || '',
            displayName: peerAddress
              .toLowerCase()
              .includes(address.toLowerCase())
              ? t('common.you')
              : displayName,
            content: messageToRender,
          });
          setEmojiReactions([...emojiReactions]);
        }
        setRenderedContent(<Emoji>{messageToRender}</Emoji>);
      } else if (decryptedMessage.messageType === MessageType.Meta) {
        // handling of meta message
        const metaData = decryptedMessage.messageObj as any;
        setRenderedContent(
          <Typography variant="caption">
            {metaData.content === 'REMOVE_MEMBER'
              ? t('common.left')
              : t('common.joined')}
            {decryptedMessage.timestamp &&
              ` @ ${new Date(decryptedMessage.timestamp).toLocaleTimeString()}`}
          </Typography>,
        );
      } else if (
        // handling for remote attachments
        decryptedMessage.messageType === MessageType.Media &&
        featureFlags.variations?.ecommerceServiceUsersEnableChatCommunityMedia
      ) {
        setIsMediaLoading(true);

        // fetch the remote media
        const mediaUrl =
          typeof decryptedMessage.messageObj === 'string'
            ? decryptedMessage.messageObj
            : (decryptedMessage.messageObj.content as string);
        const fetchResponse = await fetch(mediaUrl);

        // process the media response
        if (fetchResponse) {
          // create a file reference for download
          const mediaBlob = await fetchResponse.blob();
          const objectURL = URL.createObjectURL(mediaBlob);

          // handling for image attachment types
          if (mediaBlob.type.toLowerCase().includes('image/')) {
            // show the image content
            setRenderedContent(
              <Box>
                <Zoom>
                  <img
                    className={
                      decryptedMessage.fromCAIP10
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
          -- {peerDisplayName || t('common.you')}
        </Typography>
        {renderedContent}
        <Typography ml={0.5} variant="caption">
          --
        </Typography>
      </Box>
    ) : encryptedMessage.messageType === MessageType.Reaction ? (
      <Box ref={messageRef} className={classes.metadata}>
        <Typography mr={0.5} variant="caption">
          -- {peerDisplayName || t('common.you')}{' '}
        </Typography>
        <Typography variant="caption">
          {t('push.reacted')} @{' '}
          {new Date(message?.timestamp || 0).toLocaleTimeString()}
        </Typography>
        <Typography ml={0.5} variant="caption">
          --
        </Typography>
      </Box>
    ) : (
      <Box
        onMouseOver={
          encryptedMessage.fromCAIP10
            .toLowerCase()
            .includes(address.toLowerCase())
            ? undefined
            : handleMouseOver
        }
        onMouseOut={
          encryptedMessage.fromCAIP10
            .toLowerCase()
            .includes(address.toLowerCase())
            ? undefined
            : handleMouseOut
        }
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
          {peerDisplayName && (
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
                      <CircularProgress size={16} color="error" />
                    ) : (
                      <BlockIcon color="error" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <Typography variant="body2" className={classes.blockColor}>
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
              <Box className={classes.reactionContainer}>
                {emojiReactions
                  .filter(r => r.messageId === message?.link)
                  .sort((a, b) => a.content.localeCompare(b.content))
                  .map(r => (
                    <Tooltip title={r.displayName || r.senderAddress}>
                      <Box className={classes.reaction}>
                        <Typography variant="body2">{r.content}</Typography>
                      </Box>
                    </Tooltip>
                  ))}
              </Box>
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
        <Box onMouseOver={handleMouseOver} className={classes.optionsContainer}>
          <IconButton onClick={handleOpenEmojiPicker}>
            <EmojiEmotionsOutlinedIcon
              className={
                isMouseOver || isEmojiPickerOpen
                  ? classes.optionsIconOn
                  : classes.optionsIconOff
              }
              fontSize="small"
            />
          </IconButton>
          <IconButton onClick={handleOpenMenu}>
            <MoreHorizIcon
              className={
                isMouseOver || isEmojiPickerOpen
                  ? classes.optionsIconOn
                  : classes.optionsIconOff
              }
              fontSize="small"
            />
          </IconButton>
          {isEmojiPickerOpen && (
            <ClickAwayListener onClickAway={handleCloseEmojiPicker}>
              <Box className={classes.emojiContainer}>
                <Typography
                  className={classes.emoji}
                  onClick={() => handleSendEmoji('👍')}
                  variant="body2"
                >
                  👍
                </Typography>
                <Typography
                  className={classes.emoji}
                  onClick={() => handleSendEmoji('👎')}
                  variant="body2"
                >
                  👎
                </Typography>
                <Typography
                  className={classes.emoji}
                  onClick={() => handleSendEmoji('❤️')}
                  variant="body2"
                >
                  ❤️
                </Typography>
                <Typography
                  className={classes.emoji}
                  onClick={() => handleSendEmoji('👏')}
                  variant="body2"
                >
                  👏
                </Typography>
                <Typography
                  className={classes.emoji}
                  onClick={() => handleSendEmoji('😂')}
                  variant="body2"
                >
                  😂
                </Typography>
                <Typography
                  className={classes.emoji}
                  onClick={() => handleSendEmoji('😢')}
                  variant="body2"
                >
                  😢
                </Typography>
                <Typography
                  className={classes.emoji}
                  onClick={() => handleSendEmoji('😡')}
                  variant="body2"
                >
                  😡
                </Typography>
                <Typography
                  className={classes.emoji}
                  onClick={() => handleSendEmoji('😲')}
                  variant="body2"
                >
                  😲
                </Typography>
                <Typography
                  className={classes.emoji}
                  onClick={() => handleSendEmoji('🔥')}
                  variant="body2"
                >
                  🔥
                </Typography>
              </Box>
            </ClickAwayListener>
          )}
        </Box>
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
  emojiReactions: Reaction[];
  setEmojiReactions: (v: Reaction[]) => void;
  onBlockUser: () => Promise<void>;
  onUnblockUser: () => Promise<void>;
  renderCallback?: (ref: React.RefObject<HTMLElement>) => void;
};

export default CommunityConversationBubble;
