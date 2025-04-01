import AddHomeOutlinedIcon from '@mui/icons-material/AddHomeOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LaunchIcon from '@mui/icons-material/Launch';
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
} from '@xmtp/browser-sdk';
import {ConsentState, ContentType, SortDirection} from '@xmtp/browser-sdk';
import type {MouseEvent} from 'react';
import React, {useEffect, useState} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import truncateEthAddress from 'truncate-eth-address';
import useAsyncEffect from 'use-async-effect';

import config from '@unstoppabledomains/config';

import type {CurrenciesType} from '../../../../lib';
import {getBlockScanUrl, isDomainValidForManagement} from '../../../../lib';
import {notifyEvent} from '../../../../lib/error';
import useTranslationContext from '../../../../lib/i18n';
import type {Web3Dependencies} from '../../../../lib/types/web3';
import {registerClientTopics} from '../../protocol/registration';
import {getAddressMetadata} from '../../protocol/resolution';
import {
  getConversationPeerAddress,
  getXmtpInboxId,
  getXmtpWalletAddress,
  isAllowListed,
  waitForXmtpMessages,
} from '../../protocol/xmtp';
import type {AddressResolution} from '../../types';
import CallToAction from '../CallToAction';
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
  authDomain,
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
  onPopoutClick,
}) => {
  const [t] = useTranslationContext();
  const [isLoading, setIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [xmtpMessages, setXmtpMessages] = useState<DecodedMessage[]>([]);
  const [incomingMessage, setIncomingMessage] = useState<DecodedMessage>();
  const [avatarLink, setAvatarLink] = useState<string>();
  const [displayName, setDisplayName] = useState<string>();
  const [clientAddress, setClientAddress] = useState<string>();
  const [peerAddress, setPeerAddress] = useState<string>();
  const [isChatRequest, setIsChatRequest] = useState<boolean>();
  const {classes} = useConversationStyles({
    isChatRequest,
  });

  useAsyncEffect(async () => {
    if (!conversation && !metadata) {
      return;
    }
    await loadAddressData();
  }, [conversation, metadata]);

  useAsyncEffect(async () => {
    if (clientAddress) {
      await loadConversation();
    }
  }, [clientAddress]);

  useEffect(() => {
    if (!incomingMessage) {
      return;
    }
    setXmtpMessages([incomingMessage, ...xmtpMessages]);
    onNewMessage(incomingMessage);
  }, [incomingMessage]);

  const loadAddressData = async () => {
    const conversationPeerAddress = conversation
      ? await getConversationPeerAddress(conversation)
      : undefined;
    const address = conversationPeerAddress || metadata?.address;
    if (address) {
      const addressData =
        metadata?.name && metadata?.avatarUrl
          ? metadata
          : await getAddressMetadata(address);
      if (addressData?.name) setDisplayName(addressData.name);
      setPeerAddress(address);
      setClientAddress(await getXmtpWalletAddress());
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
        limit: BigInt(PAGE_SIZE),
        direction: SortDirection.Descending,
        sentBeforeNs: xmtpMessages[xmtpMessages.length - 1].sentAtNs,
        contentTypes: [ContentType.Text, ContentType.RemoteAttachment],
      });
      if (previousMessages.length < PAGE_SIZE) {
        setHasMoreMessages(false);
      }
      if (previousMessages.length > 0) {
        setXmtpMessages([
          ...xmtpMessages,
          ...previousMessages.filter(filterMessage),
        ]);
      }
    } catch (e) {
      notifyEvent(e, 'error', 'Messaging', 'XMTP', {
        msg: 'error fetching previous conversations',
      });
    }
  };

  const loadConversation = async () => {
    try {
      // render the existing messages if available
      if (conversation) {
        // retrieve all messages
        const initialMessages = await conversation.messages({
          limit: BigInt(PAGE_SIZE),
          direction: SortDirection.Descending,
          contentTypes: [ContentType.Text, ContentType.RemoteAttachment],
        });
        setHasMoreMessages(initialMessages.length >= PAGE_SIZE);

        // filter to the types of messages we want to display
        const filteredMessages = initialMessages.filter(filterMessage);
        setXmtpMessages(filteredMessages);

        // determine if this is a new chat
        setIsChatRequest(
          (await conversation.consentState()) !== ConsentState.Allowed &&
            filteredMessages.length > 0 &&
            !acceptedTopics.includes(conversation.id),
        );

        // listen for new messages
        if (clientAddress) {
          void waitForXmtpMessages(
            (message: DecodedMessage) => setIncomingMessage(message),
            conversation,
          );
        }
      }
    } catch (e) {
      notifyEvent(e, 'error', 'Messaging', 'XMTP', {
        msg: 'error loading conversation',
      });
    } finally {
      // loading complete
      setIsLoading(false);
    }
  };

  const filterMessage = (message: DecodedMessage) => {
    return (
      message.contentType.typeId === 'text' ||
      message.contentType.typeId === 'remoteAttachment'
    );
  };

  const scrollToLatestMessage = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({
      behavior: 'auto',
    });
  };

  const isBlocked = () => {
    return conversation?.id ? blockedTopics.includes(conversation.id) : false;
  };

  const handleSend = async (msg: DecodedMessage) => {
    // callback for sent messages to make UI feel responsive
    setIncomingMessage(msg);

    // add to local accepted topics list if necessary, since the user
    // has engaged with the conversation
    if (!acceptedTopics.includes(msg.conversationId)) {
      const updatedAcceptedTopics = [
        ...acceptedTopics.filter(v => v !== msg.conversationId),
      ];
      updatedAcceptedTopics.push(msg.conversationId);
      setAcceptedTopics(updatedAcceptedTopics);
    }

    // register the topic as accepted, since the user has engaged with
    // the conversation
    if (conversation && peerAddress) {
      await registerClientTopics(await getXmtpInboxId(), [
        {
          topic: msg.conversationId,
          peerAddress,
          accept: true,
          block: false,
        },
      ]);
    }
  };

  const handleIdentityClick = async () => {
    window.open(`${config.UNSTOPPABLE_WEBSITE_URL}/search`, '_blank');
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

  const handleOpenExplorer = async () => {
    if (conversation && peerAddress) {
      const url = getBlockScanUrl('MATIC' as CurrenciesType, peerAddress);
      window.open(url, '_blank');
    }
  };

  const handleBlockClicked = async (blockedValue: boolean) => {
    // prepare the blocked topics
    if (!authDomain || !conversation) {
      return;
    }

    // updated accepted topics
    const updatedAcceptedTopics = [
      ...acceptedTopics.filter(v => v !== conversation.id),
    ];
    if (!blockedValue) {
      updatedAcceptedTopics.push(conversation.id);
      setIsChatRequest(false);
    }

    // update blocked topics
    const updatedBlockedTopics = [
      ...blockedTopics.filter(v => v !== conversation.id),
    ];
    if (blockedValue) {
      updatedBlockedTopics.push(conversation.id);
    }

    // update blocking preferences
    if (peerAddress) {
      await registerClientTopics(await getXmtpInboxId(), [
        {
          topic: conversation.id,
          peerAddress,
          block: updatedBlockedTopics.includes(conversation.id),
          accept: !updatedBlockedTopics.includes(conversation.id),
        },
      ]);
    }

    // update the blocked topic state
    setAcceptedTopics(updatedAcceptedTopics);
    setBlockedTopics(updatedBlockedTopics);
    if (updatedBlockedTopics.includes(conversation.id)) {
      onBack();
    }
  };

  // wait for conversation address to load
  if (!clientAddress || !peerAddress) {
    return null;
  }

  // render the conversation
  return (
    <Card
      className={classes.cardContainer}
      style={{border: 'none', boxShadow: 'none'}}
      variant="outlined"
    >
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
            <Box display="flex" alignItems="center" mr={-1}>
              <Tooltip
                title={t(
                  displayName
                    ? 'profile.viewProfile'
                    : 'verifiedWallets.viewExplorer',
                )}
              >
                <InfoOutlinedIcon
                  className={classes.headerCloseIcon}
                  onClick={displayName ? handleOpenProfile : handleOpenExplorer}
                />
              </Tooltip>
              {!authDomain ||
                (!isDomainValidForManagement(authDomain) && (
                  <Tooltip title={t('push.getAnIdentity')}>
                    <AddHomeOutlinedIcon
                      className={classes.headerCloseIcon}
                      onClick={handleIdentityClick}
                      color="warning"
                      id="identity-button"
                    />
                  </Tooltip>
                ))}
            </Box>
            <Tooltip title={t('common.options')}>
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
              {onPopoutClick && (
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    onPopoutClick(peerAddress);
                  }}
                >
                  <ListItemIcon>
                    <LaunchIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="body2">{t('common.popOut')}</Typography>
                </MenuItem>
              )}
              {authDomain &&
                peerAddress &&
                isDomainValidForManagement(authDomain) &&
                !isAllowListed(peerAddress) && (
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
                      {isBlocked()
                        ? t('manage.unblock')
                        : t('push.blockAndReport')}
                    </Typography>
                  </MenuItem>
                )}
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
            clientAddress?.toLowerCase() === peerAddress?.toLowerCase() ? (
              <CallToAction
                icon="BlockIcon"
                title={t('push.chatWithSelf')}
                subTitle={truncateEthAddress(clientAddress)}
              />
            ) : xmtpMessages.length === 0 ? (
              <CallToAction
                icon="ForumOutlinedIcon"
                title={t('push.newConversation')}
                subTitle={t('push.chatSecure')}
              />
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
                    <Box className={classes.infiniteScrollLoading}>
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
                        address={clientAddress}
                        message={message}
                        key={message.id}
                        onBlockTopic={() => handleBlockClicked(!isBlocked())}
                        renderCallback={
                          xmtpMessages.length > 0 &&
                          message.sentAtNs >= xmtpMessages[0].sentAtNs
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
            <CallToAction icon="CloudOffIcon" title={t('push.chatNotReady')} />
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
  authDomain?: string;
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
  onPopoutClick?: (address?: string) => void;
};

export default Conversation;
