import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import BlockIcon from '@mui/icons-material/Block';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {styled} from '@mui/material/styles';
import type {
  DecodedMessage,
  Conversation as XmtpConversation,
} from '@xmtp/xmtp-js';
import {SortDirection} from '@xmtp/xmtp-js';
import type {MouseEvent} from 'react';
import React, {useEffect, useState} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import truncateEthAddress from 'truncate-eth-address';

import config from '@unstoppabledomains/config';

import {DomainProfileKeys} from '../../../../lib';
import {notifyError} from '../../../../lib/error';
import useTranslationContext from '../../../../lib/i18n';
import type {Web3Dependencies} from '../../../../lib/types/web3';
import {registerClientTopics} from '../../protocol/registration';
import {getAddressMetadata} from '../../protocol/resolution';
import {waitForXmtpMessages} from '../../protocol/xmtp';
import type {AddressResolution} from '../../types';
import {useConversationStyles} from '../styles';
import ConversationBubble from './ConversationBubble';
import Compose from './ConversationCompose';

const CardContentNoPadding = styled(CardContent)(`
  padding: 0;
  &:last-child {
    padding-bottom: 0;
  }
`);

export const Conversation: React.FC<ConversationProps> = ({
  conversation,
  metadata,
  acceptedTopics,
  blockedTopics,
  storageApiKey,
  setAcceptedTopics,
  setBlockedTopics,
  setWeb3Deps,
  onNewMessage,
  onBack,
  onClose,
}) => {
  const [t] = useTranslationContext();
  const [isLoading, setIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [xmtpMessages, setXmtpMessages] = useState<DecodedMessage[]>([]);
  const [incomingMessage, setIncomingMessage] = useState<DecodedMessage>();
  const [avatarLink, setAvatarLink] = useState<string>();
  const [displayName, setDisplayName] = useState<string>();
  const [peerAddress, setPeerAddress] = useState<string>();
  const [authDomain, setAuthDomain] = useState<string | null>();
  const [isChatRequest, setIsChatRequest] = useState<boolean>();
  const {classes} = useConversationStyles({
    isChatRequest,
  });

  useEffect(() => {
    if (!conversation && !metadata) {
      return;
    }
    setAuthDomain(localStorage.getItem(DomainProfileKeys.AuthDomain));
    void loadAddressData();
    void loadConversation();
  }, [conversation, metadata]);

  useEffect(() => {
    if (!incomingMessage) {
      return;
    }
    setXmtpMessages([incomingMessage, ...xmtpMessages]);
    onNewMessage(incomingMessage);
  }, [incomingMessage]);

  const loadAddressData = async () => {
    const address = conversation?.peerAddress || metadata?.address;
    if (address) {
      const addressData =
        metadata?.name && metadata?.avatarUrl
          ? metadata
          : await getAddressMetadata(address);
      if (addressData?.name) setDisplayName(addressData.name);
      setPeerAddress(address);
      setAvatarLink(addressData?.avatarUrl);
    }
  };

  const loadPreviousPage = async () => {
    if (!conversation || xmtpMessages.length === 0) {
      setHasMoreMessages(false);
      return;
    }
    try {
      const previousMessages = await conversation.messages({
        limit: PAGE_SIZE,
        direction: SortDirection.SORT_DIRECTION_DESCENDING,
        endTime: xmtpMessages[xmtpMessages.length - 1].sent,
      });
      if (previousMessages.length < PAGE_SIZE) {
        setHasMoreMessages(false);
      }
      if (previousMessages.length > 0) {
        setXmtpMessages([...xmtpMessages, ...previousMessages.slice(1)]);
      }
    } catch (e) {
      notifyError(e, {msg: 'error fetching previous conversations'});
    }
  };

  const loadConversation = async () => {
    try {
      // render the existing messages if available
      if (conversation) {
        const initialMessages = await conversation.messages({
          limit: PAGE_SIZE,
          direction: SortDirection.SORT_DIRECTION_DESCENDING,
        });
        setHasMoreMessages(initialMessages.length >= PAGE_SIZE);
        setXmtpMessages(initialMessages);

        // determine if this is a new chat
        setIsChatRequest(
          initialMessages.length > 0 &&
            !acceptedTopics.includes(conversation.topic),
        );

        // listen for new messages
        void waitForXmtpMessages(
          conversation.clientAddress,
          (message: DecodedMessage) => setIncomingMessage(message),
          conversation,
        );
      }
    } catch (e) {
      notifyError(e, {msg: 'error loading conversation'});
    } finally {
      // loading complete
      setIsLoading(false);
    }
  };

  const scrollToLatestMessage = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({
      behavior: 'auto',
    });
  };

  const isBlocked = () => {
    return conversation?.topic
      ? blockedTopics.includes(conversation.topic)
      : false;
  };

  const handleSend = async (msg: DecodedMessage) => {
    // callback for sent messages to make UI feel responsive
    setIncomingMessage(msg);

    // add to local accepted topics list if necessary, since the user
    // has engaged with the conversation
    if (!acceptedTopics.includes(msg.conversation.topic)) {
      const updatedAcceptedTopics = [
        ...acceptedTopics.filter(v => v !== msg.conversation.topic),
      ];
      updatedAcceptedTopics.push(msg.conversation.topic);
      setAcceptedTopics(updatedAcceptedTopics);
    }

    // register the topic as accepted, since the user has engaged with
    // the conversation
    await registerClientTopics(msg.conversation.clientAddress, [
      {
        topic: msg.conversation.topic,
        peerAddress: msg.conversation.peerAddress,
        accept: true,
        block: false,
      },
    ]);
  };

  const handleOpenMenu = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenProfile = () => {
    if (displayName) {
      window.open(`${config.UD_ME_BASE_URL}/${displayName}`, '_blank');
    }
  };

  const handleBlockClicked = async (blockedValue: boolean) => {
    // prepare the blocked topics
    if (!authDomain || !conversation) {
      return;
    }

    // updated accepted topics
    const updatedAcceptedTopics = [
      ...acceptedTopics.filter(v => v !== conversation.topic),
    ];
    if (!blockedValue) {
      updatedAcceptedTopics.push(conversation.topic);
      setIsChatRequest(false);
    }

    // update blocked topics
    const updatedBlockedTopics = [
      ...blockedTopics.filter(v => v !== conversation.topic),
    ];
    if (blockedValue) {
      updatedBlockedTopics.push(conversation.topic);
    }

    // update blocking preferences
    await registerClientTopics(conversation.clientAddress, [
      {
        topic: conversation.topic,
        peerAddress: conversation.peerAddress,
        block: updatedBlockedTopics.includes(conversation.topic),
        accept: !updatedBlockedTopics.includes(conversation.topic),
      },
    ]);

    // update the blocked topic state
    setAcceptedTopics(updatedAcceptedTopics);
    setBlockedTopics(updatedBlockedTopics);
    if (updatedBlockedTopics.includes(conversation.topic)) {
      onBack();
    }
  };

  return (
    <Card className={classes.cardContainer} variant="outlined">
      <CardHeader
        title={
          <Box className={classes.headerTitleContainer}>
            <Typography variant="subtitle2">
              {displayName || t('common.wallet')}
            </Typography>
            {peerAddress && (
              <Tooltip title={peerAddress}>
                <Typography variant="caption">
                  {truncateEthAddress(peerAddress)}
                </Typography>
              </Tooltip>
            )}
          </Box>
        }
        avatar={
          <Box className={classes.headerActionContainer}>
            <ArrowBackOutlinedIcon
              className={classes.headerBackIcon}
              onClick={onBack}
            />
            <Avatar className={classes.avatar} src={avatarLink} />
          </Box>
        }
        action={
          <Box className={classes.headerActionContainer}>
            {displayName && (
              <Tooltip title={t('profile.viewProfile')}>
                <InfoOutlinedIcon
                  className={classes.headerCloseIcon}
                  onClick={handleOpenProfile}
                />
              </Tooltip>
            )}
            <Tooltip title={t('common.more')}>
              <IconButton
                onClick={handleOpenMenu}
                className={classes.headerCloseIcon}
              >
                <MoreVertOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              onClose={handleCloseMenu}
              open={Boolean(anchorEl)}
              transformOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
            >
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  void handleBlockClicked(!isBlocked());
                }}
              >
                <ListItemIcon>
                  <BlockOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2">
                  {isBlocked() ? t('manage.unblock') : t('push.blockAndReport')}
                </Typography>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  onClose();
                }}
              >
                <ListItemIcon>
                  <CloseOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2">{t('common.close')}</Typography>
              </MenuItem>
            </Menu>
          </Box>
        }
      />
      <CardContent>
        {isChatRequest && <Box sx={{height: '50px'}} />}
        <Box className={classes.conversationContainer} id="scrollable-div">
          {isLoading ? (
            <Box className={classes.loadingContainer}>
              <CircularProgress className={classes.loadingSpinner} />
              <Typography className={classes.loadingText}>
                {t('push.loadingConversation')}
              </Typography>
            </Box>
          ) : conversation ? (
            conversation.clientAddress.toLowerCase() ===
            conversation.peerAddress.toLowerCase() ? (
              <Box className={classes.unavailableContainer}>
                <BlockIcon className={classes.unavailableIcon} />
                <Typography variant="body2" className={classes.unavailableText}>
                  {t('push.chatWithSelf', {
                    address: truncateEthAddress(conversation.clientAddress),
                  })}
                </Typography>
              </Box>
            ) : xmtpMessages.length === 0 ? (
              <Box className={classes.unavailableContainer}>
                <ForumOutlinedIcon className={classes.unavailableIcon} />
                <Typography variant="h6" className={classes.unavailableText}>
                  {t('push.newConversation')}
                </Typography>
                <Typography variant="body2" className={classes.unavailableText}>
                  {t('push.chatSecure')}
                </Typography>
              </Box>
            ) : (
              <Box>
                <InfiniteScroll
                  inverse={true}
                  style={{display: 'flex', flexDirection: 'column-reverse'}}
                  className={classes.infiniteScroll}
                  scrollableTarget="scrollable-div"
                  hasMore={hasMoreMessages}
                  next={loadPreviousPage}
                  dataLength={xmtpMessages.length}
                  loader={
                    <Box className={classes.ininiteScrollLoading}>
                      <CircularProgress className={classes.loadingSpinner} />
                    </Box>
                  }
                  scrollThreshold={0.9}
                >
                  {xmtpMessages
                    .filter(
                      (message, index) =>
                        xmtpMessages.findIndex(
                          item => item.id === message.id,
                        ) === index,
                    )
                    .map(message => (
                      <ConversationBubble
                        address={conversation.clientAddress}
                        message={message}
                        key={message.id}
                        onBlockTopic={() => handleBlockClicked(!isBlocked())}
                        renderCallback={
                          xmtpMessages.length > 0 &&
                          message.sent >= xmtpMessages[0].sent
                            ? scrollToLatestMessage
                            : undefined
                        }
                      />
                    ))}
                </InfiniteScroll>
                {isChatRequest && (
                  <Box className={classes.acceptContainer}>
                    <Typography variant="body2" className={classes.acceptText}>
                      {t('push.acceptWarning')}
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      className={classes.acceptButton}
                      onClick={() => handleBlockClicked(false)}
                    >
                      {t('push.accept')}
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      color="warning"
                      className={classes.acceptButton}
                      onClick={() => handleBlockClicked(true)}
                    >
                      {t('push.blockAndReport')}
                    </Button>
                  </Box>
                )}
              </Box>
            )
          ) : (
            <Box className={classes.unavailableContainer}>
              <CloudOffIcon className={classes.unavailableIcon} />
              <Typography variant="body2" className={classes.unavailableText}>
                {t('push.chatNotReady')}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
      {!isLoading && !isChatRequest && (
        <CardContentNoPadding className={classes.composeContainer}>
          <Compose
            conversation={conversation}
            storageApiKey={storageApiKey}
            sendCallback={handleSend}
            setWeb3Deps={setWeb3Deps}
          />
        </CardContentNoPadding>
      )}
    </Card>
  );
};

const PAGE_SIZE = 10;

export type ConversationProps = {
  conversation?: XmtpConversation;
  metadata?: AddressResolution;
  acceptedTopics: string[];
  blockedTopics: string[];
  storageApiKey?: string;
  setAcceptedTopics: (v: string[]) => void;
  setBlockedTopics: (v: string[]) => void;
  setWeb3Deps: (value: Web3Dependencies | undefined) => void;
  onNewMessage: (msg: DecodedMessage) => void;
  onBack: () => void;
  onClose: () => void;
};

export default Conversation;
