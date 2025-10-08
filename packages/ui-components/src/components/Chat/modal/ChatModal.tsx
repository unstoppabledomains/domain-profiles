/* eslint-disable @typescript-eslint/no-explicit-any */
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import AddHomeOutlinedIcon from '@mui/icons-material/AddHomeOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ChatIcon from '@mui/icons-material/ChatOutlined';
import CloseIcon from '@mui/icons-material/Close';
import GroupsIcon from '@mui/icons-material/GroupOutlined';
import AppsIcon from '@mui/icons-material/NotificationsActiveOutlined';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import type {BadgeProps} from '@mui/material/Badge';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {styled, useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import type {IMessageIPFS} from '@pushprotocol/restapi';
import type {
  DecodedMessage,
  Conversation as XmtpConversation,
} from '@xmtp/browser-sdk';
import {ConsentState} from '@xmtp/browser-sdk';
import {ContentTypeText} from '@xmtp/content-type-text';
import Bluebird from 'bluebird';
import {ethers} from 'ethers';
import React, {useEffect, useState} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import useAsyncEffect from 'use-async-effect';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useFeatureFlags} from '../../../actions/featureFlagActions';
import useFetchNotifications from '../../../hooks/useFetchNotification';
import {fetchApi, isDomainValidForManagement} from '../../../lib';
import {notifyEvent} from '../../../lib/error';
import useTranslationContext from '../../../lib/i18n';
import type {SerializedCryptoWalletBadge} from '../../../lib/types/badge';
import {
  getDomainSignatureExpiryKey,
  getDomainSignatureValueKey,
} from '../../../lib/types/domain';
import type {
  SerializedRecommendation,
  SerializedUserDomainProfileData,
} from '../../../lib/types/domain';
import type {Web3Dependencies} from '../../../lib/types/web3';
import Modal from '../../Modal';
import {registerClientTopics} from '../protocol/registration';
import {getAddressMetadata} from '../protocol/resolution';
import type {ConversationMeta} from '../protocol/xmtp';
import {
  getConversation,
  getConversationById,
  getConversationPeerAddress,
  getConversations,
  getXmtpInboxId,
  isAllowListed,
} from '../protocol/xmtp';
import {localStorageWrapper} from '../storage';
import type {AddressResolution, PayloadData} from '../types';
import {TabType, getCaip10Address} from '../types';
import CallToAction from './CallToAction';
import Search from './Search';
import Conversation from './dm/Conversation';
import ConversationPreview from './dm/ConversationPreview';
import ConversationStart from './dm/ConversationStart';
import ConversationSuggestions from './dm/ConversationSuggestions';
import Community from './group/Community';
import CommunityList from './group/CommunityList';
import NotificationPreview from './notification/NotificationPreview';

const useStyles = makeStyles<{fullScreen?: boolean}>()(
  (theme: Theme, {fullScreen}) => ({
    chatModalContainer: {
      position: 'fixed',
      bottom: '15px',
      right: '10px',
      width: '450px',
      height: '600px',
      margin: theme.spacing(1),
      boxShadow: theme.shadows[6],
      zIndex: 200,
    },
    chatModalContentContainer: {
      padding: fullScreen ? 0 : theme.spacing(1),
      border: 'none',
      backgroundColor: 'transparent',
    },
    chatMobileContainer: {
      width: '100%',
      height: '100%',
      margin: 0,
      backgroundColor: 'transparent',
    },
    chatMobilePaper: {
      minHeight: '600px',
      width: '520px',
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      alignItems: 'center',
      textAlign: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing(10),
      color: theme.palette.neutralShades[400],
    },
    loadingTab: {
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      marginTop: theme.spacing(-3),
    },
    loadingText: {
      marginTop: theme.spacing(1),
      color: 'inherit',
    },
    loadingSpinner: {
      color: 'inherit',
    },
    headerActionContainer: {
      display: 'flex',
      color: theme.palette.neutralShades[600],
      marginRight: theme.spacing(1),
    },
    headerTitleContainer: {
      display: 'flex',
      width: '100%',
      alignItems: 'center',
    },
    newChatIcon: {
      color: theme.palette.primary.main,
      transform: 'rotateY(180deg)',
      marginTop: '2px',
    },
    headerActionIcon: {
      marginLeft: theme.spacing(1),
      cursor: 'pointer',
    },
    tabHeaderContainer: {
      marginTop: theme.spacing(-3),
      width: '100%',
    },
    tabContentContainer: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
      overscrollBehavior: 'contain',
      height: fullScreen ? 'calc(100vh - 175px)' : '425px',
    },
    tabList: {
      marginRight: theme.spacing(-4),
    },
    tabContentItem: {
      marginLeft: theme.spacing(-3),
      marginRight: theme.spacing(-3),
    },
    searchContainer: {
      marginTop: theme.spacing(2),
    },
    infiniteScroll: {
      margin: 0,
      padding: 0,
    },
    viewRequestsButton: {
      marginTop: theme.spacing(-1),
      marginBottom: theme.spacing(3),
    },
  }),
);

const StyledTabBadge = styled(Badge)<BadgeProps>(({theme}) => ({
  '& .MuiBadge-badge': {
    right: -1,
  },
}));

export const ChatModal: React.FC<ChatModalProps> = ({
  authDomain,
  pushAccount,
  pushKey,
  xmtpAddress,
  xmtpKey,
  open,
  activeChat,
  activeCommunity,
  activeTab,
  incomingGroup,
  incomingMessage,
  incomingNotification,
  tabRefresh,
  blockedTopics,
  setBlockedTopics,
  setWeb3Deps,
  onClose,
  onInitPushAccount,
  onPopoutClick,
  setActiveChat,
  setActiveCommunity,
  fullScreen,
  variant = 'docked',
}) => {
  // mobile behavior flags
  const theme = useTheme();
  const fullScreenModal =
    useMediaQuery(theme.breakpoints.down('sm')) || fullScreen;

  const {cx, classes} = useStyles({fullScreen: fullScreenModal});
  const [t] = useTranslationContext();
  const {data: featureFlags} = useFeatureFlags(false, authDomain);
  const [loadingText, setLoadingText] = useState<string>();
  const [lastRefresh, setLastRefresh] = useState<Record<TabType, number>>({
    chat: 0,
    communities: 0,
    notification: 0,
    loading: 0,
  });
  const [tabUnreadDot, setTabUnreadDot] = useState<Record<TabType, boolean>>({
    chat: false,
    communities: false,
    notification: false,
    loading: false,
  });
  const [searchValue, setSearchValue] = useState<string>();
  const [tabValue, setTabValue] = useState(TabType.Chat);
  const [acceptedTopics, setAcceptedTopics] = useState<string[]>([]);
  const [activeChatHandled, setActiveChatHandled] = useState(false);
  const [conversationSearch, setConversationSearch] = useState<boolean>(false);
  const [conversationPeer, setConversationPeer] = useState<XmtpConversation>();
  const [conversationMetadata, setConversationMetadata] =
    useState<AddressResolution>();
  const [conversations, setConversations] = useState<ConversationMeta[]>();
  const [visibleConversations, setVisibleConversations] =
    useState<ConversationMeta[]>();
  const [conversationRequestView, setConversationRequestView] =
    useState<boolean>();
  const [notifications, setNotifications] = useState<PayloadData[]>([]);
  const [notificationsAvailable, setNotificationsAvailable] = useState(true);
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [suggestions, setSuggestions] = useState<SerializedRecommendation[]>();
  const [userProfile, setUserProfile] =
    useState<SerializedUserDomainProfileData>();
  const {fetchNotifications, loading: notificationsLoading} =
    useFetchNotifications(getCaip10Address(pushAccount));

  useAsyncEffect(async () => {
    if (open) {
      await Promise.all([
        // browser settings check
        checkBrowserSettings(),
        // load user settings
        loadUserProfile(),
      ]);

      // tab handling
      if (tabValue === TabType.Chat) {
        if (conversationSearch) {
          return;
        }
        if (activeChat && activeChatHandled) {
          return;
        }
        if (activeChat) {
          setActiveChatHandled(true);
          await handleOpenChatFromName(activeChat);
        } else {
          await loadConversations(false);
        }
      } else if (tabValue === TabType.Notification) {
        await loadNotifications(true);
      }
    } else if (conversations === undefined) {
      // preload conversations to improve perceived performance
      await loadConversations(false);
    }
  }, [activeChat, activeChatHandled, open, tabValue]);

  useEffect(() => {
    if (!incomingMessage) {
      return;
    }
    void loadNewMessage(incomingMessage);
  }, [incomingMessage]);

  useEffect(() => {
    if (!incomingNotification) {
      return;
    }
    void loadNewNotification(incomingNotification);
  }, [incomingNotification]);

  useEffect(() => {
    if (!incomingGroup) {
      return;
    }
    void loadNewCommunityMessage();
  }, [incomingGroup]);

  useEffect(() => {
    if (!activeTab) {
      return;
    }
    setTabValue(activeTab);
    setTabUnreadDot({
      ...tabUnreadDot,
      [activeTab]: false,
    });
  }, [activeTab]);

  useEffect(() => {
    if (getRequestCount() === 0) {
      setConversationRequestView(false);
    }
  }, [acceptedTopics, blockedTopics]);

  useAsyncEffect(async () => {
    if (!conversations || conversations.length === 0) {
      return;
    }

    // set initial topic consent values
    if (acceptedTopics.length === 0 && blockedTopics.length === 0) {
      setAcceptedTopics(
        (
          await Bluebird.filter(conversations, async c => {
            const peerAddress = await getConversationPeerAddress(
              c.conversation,
            );
            if (!peerAddress) {
              return false;
            }
            return (
              c.consentState === ConsentState.Allowed ||
              isAllowListed(peerAddress)
            );
          })
        ).map(c => c.conversation.id),
      );
      setBlockedTopics(
        (
          await Bluebird.filter(conversations, async c => {
            const peerAddress = await getConversationPeerAddress(
              c.conversation,
            );
            if (!peerAddress) {
              return false;
            }
            return (
              c.consentState === ConsentState.Denied &&
              !isAllowListed(peerAddress)
            );
          })
        ).map(c => c.conversation.id),
      );
    }
  }, [conversations]);

  useAsyncEffect(async () => {
    if (!conversations || conversations.length === 0) {
      return;
    }

    // conversations to display in the current inbox view
    setVisibleConversations(
      await Bluebird.filter(conversations, async c => {
        const peerAddress = await getConversationPeerAddress(c.conversation);
        if (!peerAddress) {
          return false;
        }
        return conversationRequestView
          ? !acceptedTopics.includes(c.conversation.id) &&
              !blockedTopics.includes(c.conversation.id)
          : acceptedTopics.includes(c.conversation.id);
      }),
    );
  }, [conversations, acceptedTopics, blockedTopics, conversationRequestView]);

  useEffect(() => {
    // disable search panel if not on the chat tab
    if (tabValue !== TabType.Chat) {
      setConversationSearch(false);
      return;
    }

    // enable search panel if no conversations are visible
    if (searchValue !== '') {
      const visibleNonFilteredConversations = (
        visibleConversations || []
      ).filter(c => c.visible);
      setConversationSearch(visibleNonFilteredConversations.length === 0);
    }
  }, [visibleConversations, searchValue, tabValue]);

  const checkBrowserSettings = async () => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }
    }
  };

  const loadConversations = async (forceRefresh?: boolean) => {
    // retrieve conversations if required
    if (
      xmtpAddress &&
      xmtpKey &&
      (forceRefresh || !conversations || conversations.length === 0)
    ) {
      const isAlreadyLoading = loadingText !== undefined;
      if (!isAlreadyLoading) {
        setLoadingText(t('push.loadingConversations'));
      }
      try {
        // load conversations from XMTP
        const localConversations = await getConversations(xmtpAddress);
        setConversations(localConversations);
        setLastRefresh({
          chat: Date.now(),
          communities: lastRefresh.communities,
          notification: lastRefresh.notification,
          loading: lastRefresh.loading,
        });
        return localConversations;
      } catch (e) {
        notifyEvent(e, 'warning', 'Messaging', 'XMTP', {
          msg: 'error loading conversations',
        });
      } finally {
        if (!isAlreadyLoading) {
          setLoadingText(undefined);
        }
      }
    }
    return;
  };

  const loadNotifications = async (checkLastRefresh: boolean) => {
    if (
      checkLastRefresh &&
      tabRefresh[TabType.Notification] <= lastRefresh[TabType.Notification]
    ) {
      // skip refresh if enforcing the check
      return;
    }
    const pageSize = 10;
    const data =
      (await fetchNotifications({
        page: notificationsPage,
        limit: pageSize,
        spam: false,
      })) || [];
    setNotificationsAvailable(data.length >= pageSize);
    setNotificationsPage(notificationsPage + 1);
    setNotifications([...notifications, ...data]);
    setLastRefresh({
      notification: tabRefresh[TabType.Notification],
      communities: lastRefresh.communities,
      chat: lastRefresh.chat,
      loading: lastRefresh.loading,
    });
  };

  // loadUserProfile authenticates with user token to retrieve private data about the
  // user such as user-specific storage API key
  const loadUserProfile = async () => {
    // skip if already loaded
    if (userProfile) {
      return;
    }

    try {
      // retrieve optional signature data
      const authExpiry = await localStorageWrapper.getItem(
        getDomainSignatureExpiryKey(authDomain!),
      );
      const authSignature = await localStorageWrapper.getItem(
        getDomainSignatureValueKey(authDomain!),
      );

      // request the domain's user data from profile API if signature is available
      if (authDomain && authExpiry && authSignature) {
        const responseJSON = await fetchApi<SerializedUserDomainProfileData>(
          `/user/${authDomain}?fields=profile`,
          {
            host: config.PROFILE.HOST_URL,
            mode: 'cors',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'x-auth-domain': authDomain,
              'x-auth-expires': authExpiry,
              'x-auth-signature': authSignature,
            },
          },
        );

        // set user profile data from result
        if (responseJSON?.storage) {
          setUserProfile(responseJSON);
        }
      }
    } catch (e) {
      notifyEvent(e, 'warning', 'Messaging', 'Fetch', {
        msg: 'unable to load user profile',
      });
    }
  };

  const loadNewNotification = async (msg: PayloadData) => {
    // load all notifications for the first time
    if (notifications.length === 0) {
      void loadNotifications(false);
    }
    // insert the new notification
    else {
      setNotifications([msg, ...notifications]);
      setLastRefresh({
        notification: Date.now(),
        communities: lastRefresh.communities,
        chat: lastRefresh.chat,
        loading: lastRefresh.loading,
      });
    }

    // set notification dot if needed
    if (tabValue !== TabType.Notification) {
      setTabUnreadDot({
        ...tabUnreadDot,
        notification: true,
      });
    }
  };

  const loadNewCommunityMessage = () => {
    setLastRefresh({
      notification: lastRefresh.notification,
      chat: lastRefresh.chat,
      communities: Date.now(),
      loading: lastRefresh.loading,
    });

    // set notification dot if needed
    if (tabValue !== TabType.Communities) {
      setTabUnreadDot({
        ...tabUnreadDot,
        communities: true,
      });
    }
  };

  const loadNewMessage = async (msg: DecodedMessage) => {
    // retrieve the existing conversations or attempt to get a fresh list
    const localConversations =
      conversations && conversations.length > 0
        ? conversations
        : await loadConversations();

    // find an existing conversation and update it in the timeline
    const conversationIndex = localConversations?.findIndex(
      item =>
        item.conversation.id.toLowerCase() === msg.conversationId.toLowerCase(),
    );

    // manage timeline depending on state
    if (
      localConversations &&
      conversationIndex !== undefined &&
      conversationIndex >= 0
    ) {
      // update the existing entry
      localConversations[conversationIndex].preview =
        await getMessagePreview(msg);
      localConversations[conversationIndex].timestamp = Number(
        msg.sentAtNs / 1000000n,
      );

      // resort the timeline
      setConversations([
        ...localConversations.sort((a, b): number => {
          return b.timestamp - a.timestamp;
        }),
      ]);
    }
    // insert a new conversation into the existing timeline
    else if (localConversations) {
      // create new conversation
      const newConversation: ConversationMeta = {
        conversation: await getConversationById(msg.conversationId),
        preview: await getMessagePreview(msg),
        timestamp: Number(msg.sentAtNs / 1000000n),
        consentState:
          msg.senderInboxId === (await getXmtpInboxId())
            ? ConsentState.Allowed // messages sent by client are allowed by default
            : ConsentState.Unknown, // messages received by client are unknown by default
        visible: true,
      };

      // insert and resort the timeline
      setConversations([
        newConversation,
        ...localConversations.sort((a, b): number => {
          return b.timestamp - a.timestamp;
        }),
      ]);

      // associate the new conversation with the wallet address
      const peerAddress = await getConversationPeerAddress(
        newConversation.conversation,
      );
      if (peerAddress) {
        await registerClientTopics(await getXmtpInboxId(), [
          {
            topic: msg.conversationId,
            peerAddress,
          },
        ]);
      }
    }
    // initialize a new timeline
    else {
      // create new conversation
      const newConversation: ConversationMeta = {
        conversation: await getConversationById(msg.conversationId),
        preview: await getMessagePreview(msg),
        timestamp: Number(msg.sentAtNs / 1000000n),
        consentState:
          msg.senderInboxId === (await getXmtpInboxId())
            ? ConsentState.Allowed // messages sent by client are allowed by default
            : ConsentState.Unknown, // messages received by client are unknown by default
        visible: true,
      };

      // initialize the timeline
      setConversations([newConversation]);

      // associate the new conversation with the wallet address
      const peerAddress = await getConversationPeerAddress(
        newConversation.conversation,
      );
      if (peerAddress) {
        await registerClientTopics(await getXmtpInboxId(), [
          {
            topic: msg.conversationId,
            peerAddress,
          },
        ]);
      }
    }

    // set notification dot if needed
    if (tabValue !== TabType.Chat) {
      setTabUnreadDot({
        ...tabUnreadDot,
        chat: true,
      });
    }
  };

  const getMessagePreview = async (msg: DecodedMessage): Promise<string> => {
    return `${
      msg.senderInboxId === (await getXmtpInboxId())
        ? `${t('common.you')}: `
        : ''
    }${
      msg.contentType.sameAs(ContentTypeText)
        ? msg.content
        : t('push.attachment')
    }`;
  };

  const handleNewChat = () => {
    setTabValue(TabType.Chat);
    setSearchValue('');
    setConversationSearch(true);
  };

  const handleIdentityClick = async () => {
    window.open(`${config.UNSTOPPABLE_WEBSITE_URL}/search`, '_blank');
  };

  const handleOpenChatFromName = async (name: string) => {
    setLoadingText(t('push.loadingUser', {user: name}));
    try {
      const peer = await getAddressMetadata(name);
      if (peer) {
        return await handleOpenChatFromAddress(peer);
      }
    } catch (e) {
      notifyEvent(e, 'warning', 'Messaging', 'Resolution', {
        msg: 'error opening chat for user',
      });
    } finally {
      setLoadingText(undefined);
    }
  };

  const handleOpenChatFromAddress = async (peer: AddressResolution) => {
    try {
      // open the chat using direct lookup
      const conversationLower = await getConversation(
        peer.address.toLowerCase(),
      );
      if (conversationLower) {
        try {
          const conversationNormalized = await getConversation(
            ethers.utils.getAddress(peer.address),
          );
          if (conversationNormalized) {
            handleOpenChat(conversationNormalized);
          }
        } catch (e) {
          handleOpenChat(conversationLower);
        }
      }
    } catch (e) {
      notifyEvent(e, 'warning', 'Messaging', 'XMTP', {
        msg: 'error opening chat from address',
      });
    } finally {
      setConversationMetadata(peer);
      setLoadingText(undefined);
    }
  };

  const handleOpenChat = (conversation: XmtpConversation) => {
    if (tabValue !== TabType.Chat) {
      setTabValue(TabType.Chat);
    }
    setConversationPeer(conversation);
    handleCloseSearch();
  };

  const handleCloseSearch = () => {
    setSearchValue('');
    setConversationSearch(false);
  };

  const handleCloseChat = () => {
    handleCloseSearch();
    setConversationPeer(undefined);
    setConversationMetadata(undefined);
    setActiveChat(undefined);
    setActiveChatHandled(false);
    setActiveCommunity(undefined);
  };

  const handleConversationMessage = async (
    msg: DecodedMessage,
    conversation?: XmtpConversation,
  ) => {
    if (!conversation || !conversations) return;
    const conversationIndex = conversations.findIndex(
      item =>
        item.conversation.id.toLowerCase() === conversation.id.toLowerCase(),
    );
    if (conversationIndex >= 0 && conversations[conversationIndex]) {
      conversations[conversationIndex].preview = await getMessagePreview(msg);
      conversations[conversationIndex].timestamp = Number(
        msg.sentAtNs / 1000000n,
      );
      setConversations([
        ...conversations.sort((a, b): number => {
          return b.timestamp - a.timestamp;
        }),
      ]);
    } else {
      setConversations([
        {
          conversation,
          preview: await getMessagePreview(msg),
          timestamp: Number(msg.sentAtNs / 1000000n),
          consentState:
            msg.senderInboxId === (await getXmtpInboxId())
              ? ConsentState.Allowed // messages sent by client are allowed by default
              : ConsentState.Unknown, // messages received by client are unknown by default
          visible: true,
        },
        ...conversations.sort((a, b): number => {
          return b.timestamp - a.timestamp;
        }),
      ]);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    const tv = newValue as TabType;
    setTabValue(tv);
    setTabUnreadDot({
      ...tabUnreadDot,
      [tv]: false,
    });
  };

  const handleSearch = (v: string) => {
    setSearchValue(v);
  };

  const handleSearchCallback = (
    conversation: ConversationMeta,
    visible: boolean,
  ) => {
    // set conversation visibility
    conversation.visible = visible;
  };

  const handleAddDomain = () => {
    window.open(`${config.UNSTOPPABLE_WEBSITE_URL}/search`, '_blank');
  };

  const handleAppSubscribe = () => {
    window.open(`${config.PUSH.APP_URL}/channels`, '_blank');
  };

  const getRequestCount = () => {
    return (
      conversations?.filter(
        c =>
          !acceptedTopics.includes(c.conversation.id) &&
          !blockedTopics.includes(c.conversation.id),
      ).length || 0
    );
  };

  // number of chat requests
  const requestCount = getRequestCount();

  // display wrapper element
  const wrapChatComponent = (children: React.ReactNode) => {
    return variant === 'modal' || fullScreenModal ? (
      <Modal
        open={open}
        onClose={onClose}
        noModalHeader={true}
        noContentMargin={true}
        noContentPadding={true}
        fullScreen={fullScreenModal}
        dialogPaperStyle={classes.chatMobilePaper}
      >
        <Box className={classes.chatMobileContainer}>{children}</Box>
      </Modal>
    ) : (
      <Card
        className={classes.chatModalContainer}
        sx={{display: open ? '' : 'none'}}
        variant="elevation"
      >
        {children}
      </Card>
    );
  };

  return wrapChatComponent(
    conversationSearch ? (
      <ConversationStart
        address={xmtpAddress}
        conversations={conversations}
        onClose={onClose}
        onBack={handleCloseSearch}
        selectedCallback={handleOpenChatFromAddress}
        initialSearch={searchValue}
      />
    ) : conversationPeer || conversationMetadata ? (
      <Conversation
        authDomain={authDomain}
        conversation={conversationPeer}
        metadata={conversationMetadata}
        acceptedTopics={acceptedTopics}
        blockedTopics={blockedTopics}
        storageApiKey={userProfile?.storage?.apiKey}
        fullScreen={fullScreenModal}
        setAcceptedTopics={setAcceptedTopics}
        setBlockedTopics={setBlockedTopics}
        setWeb3Deps={setWeb3Deps}
        onNewMessage={(msg: DecodedMessage) =>
          handleConversationMessage(msg, conversationPeer)
        }
        onBack={handleCloseChat}
        onClose={onClose}
        onPopoutClick={onPopoutClick}
      />
    ) : pushAccount && pushKey && activeCommunity?.groupChatId ? (
      <Community
        address={xmtpAddress}
        authDomain={authDomain}
        badge={activeCommunity}
        pushKey={pushKey}
        incomingMessage={incomingGroup}
        storageApiKey={userProfile?.storage?.apiKey}
        fullScreen={fullScreenModal}
        setWeb3Deps={setWeb3Deps}
        onBack={handleCloseChat}
        onClose={onClose}
      />
    ) : tabValue === TabType.Loading ? (
      <Box className={classes.loadingTab}>
        <CallToAction
          icon="ForumOutlinedIcon"
          title={t('push.loadingYourChat')}
          subTitle={t('push.loadingYourChatDescription')}
          loading={true}
        />
      </Box>
    ) : (
      <Card
        className={classes.chatModalContentContainer}
        style={{border: 'none', boxShadow: 'none'}}
        variant="outlined"
      >
        <CardHeader
          title={
            fullScreenModal ? (
              <Box className={classes.headerTitleContainer}>
                <IconButton onClick={onClose}>
                  <ArrowBackOutlinedIcon />
                </IconButton>
                <Box ml={1}>{t('push.messages')}</Box>
              </Box>
            ) : (
              t('push.messages')
            )
          }
          action={
            <Box className={classes.headerActionContainer}>
              <Tooltip title={t('push.chatNew')}>
                <AddCommentOutlinedIcon
                  className={cx(classes.headerActionIcon, classes.newChatIcon)}
                  onClick={handleNewChat}
                />
              </Tooltip>
              {(!authDomain || !isDomainValidForManagement(authDomain)) && (
                <Tooltip title={t('push.getAnIdentity')}>
                  <AddHomeOutlinedIcon
                    className={classes.headerActionIcon}
                    onClick={handleIdentityClick}
                    color="warning"
                    id="identity-button"
                  />
                </Tooltip>
              )}
              {!fullScreenModal && (
                <Tooltip title={t('common.close')}>
                  <CloseIcon
                    className={classes.headerActionIcon}
                    onClick={onClose}
                  />
                </Tooltip>
              )}
            </Box>
          }
        />
        <CardContent>
          <TabContext value={tabValue}>
            <Box className={classes.tabHeaderContainer}>
              <TabList
                onChange={handleTabChange}
                variant="fullWidth"
                className={classes.tabList}
              >
                <Tab
                  icon={<ChatIcon />}
                  label={
                    <StyledTabBadge
                      color="primary"
                      variant="dot"
                      invisible={!tabUnreadDot[TabType.Chat]}
                    >
                      {t('push.chat')}
                    </StyledTabBadge>
                  }
                  value={TabType.Chat}
                />
                {featureFlags.variations
                  ?.ecommerceServiceUsersEnableChatCommunity && (
                  <Tab
                    icon={<GroupsIcon />}
                    label={
                      <StyledTabBadge
                        color="primary"
                        variant="dot"
                        invisible={
                          !tabUnreadDot[TabType.Communities] &&
                          pushKey !== undefined
                        }
                      >
                        {t('push.communities')}
                      </StyledTabBadge>
                    }
                    value={TabType.Communities}
                  />
                )}
                <Tab
                  icon={<AppsIcon />}
                  label={
                    <StyledTabBadge
                      color="primary"
                      variant="dot"
                      invisible={
                        !tabUnreadDot[TabType.Notification] &&
                        pushKey !== undefined
                      }
                    >
                      {featureFlags.variations
                        ?.ecommerceServiceUsersEnableChatCommunity
                        ? t('push.notificationsShort')
                        : t('push.notifications')}
                    </StyledTabBadge>
                  }
                  value={TabType.Notification}
                />
              </TabList>
            </Box>
            <Box className={classes.searchContainer}>
              <Search handleSearch={handleSearch} tab={tabValue} />
            </Box>
            <Box className={classes.tabContentContainer} id="scrollable-div">
              <TabPanel value={TabType.Chat} className={classes.tabContentItem}>
                {loadingText ? (
                  <Box className={classes.loadingContainer}>
                    <CircularProgress className={classes.loadingSpinner} />
                    <Typography className={classes.loadingText}>
                      {loadingText}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {!conversationRequestView && getRequestCount() > 0 && (
                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        className={classes.viewRequestsButton}
                        onClick={() => setConversationRequestView(true)}
                      >
                        {t('push.showRequests', {
                          count: getRequestCount(),
                        })}
                      </Button>
                    )}
                    {conversationRequestView && (
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.viewRequestsButton}
                        onClick={() => setConversationRequestView(false)}
                      >
                        {t('push.backToInbox')}
                      </Button>
                    )}
                    {visibleConversations && visibleConversations.length > 0 ? (
                      visibleConversations.map(c => (
                        <ConversationPreview
                          key={c.conversation.id}
                          selectedCallback={handleOpenChat}
                          searchTermCallback={(visible: boolean) =>
                            handleSearchCallback(c, visible)
                          }
                          searchTerm={searchValue}
                          acceptedTopics={acceptedTopics}
                          skipObserver={fullScreenModal}
                          conversation={c}
                        />
                      ))
                    ) : (
                      <CallToAction
                        icon="ForumOutlinedIcon"
                        title={
                          requestCount === 0
                            ? suggestions
                              ? `${t('common.recommended')} ${t(
                                  'common.connections',
                                )}`
                              : t('push.chatNew')
                            : t('push.chatNewRequest')
                        }
                        subTitle={
                          requestCount === 0
                            ? suggestions
                              ? t('push.chatNewRecommendations')
                              : t('push.chatNewDescription')
                            : t('push.chatNewRequestDescription')
                        }
                      >
                        {requestCount === 0 && (
                          <ConversationSuggestions
                            address={xmtpAddress}
                            conversations={visibleConversations}
                            onSelect={handleOpenChatFromAddress}
                            onSuggestionsLoaded={setSuggestions}
                          />
                        )}
                      </CallToAction>
                    )}
                  </Box>
                )}
              </TabPanel>
              <TabPanel
                value={TabType.Communities}
                className={classes.tabContentItem}
              >
                {pushAccount &&
                pushKey &&
                authDomain &&
                isDomainValidForManagement(authDomain) ? (
                  <CommunityList
                    address={xmtpAddress}
                    domain={authDomain}
                    pushKey={pushKey}
                    searchTerm={searchValue}
                    incomingMessage={incomingGroup}
                    setActiveCommunity={setActiveCommunity}
                  />
                ) : (
                  <CallToAction
                    icon={'GroupsIcon'}
                    title={t('push.communitiesNotReady')}
                    subTitle={`${t('push.communitiesNotReadyDescription')} ${
                      authDomain && isDomainValidForManagement(authDomain)
                        ? ''
                        : t('push.communitiesRequireADomain')
                    }`}
                    buttonText={
                      authDomain && isDomainValidForManagement(authDomain)
                        ? t('manage.enable')
                        : t('push.communitiesGetADomain')
                    }
                    handleButtonClick={
                      authDomain && isDomainValidForManagement(authDomain)
                        ? onInitPushAccount
                        : handleAddDomain
                    }
                  />
                )}
              </TabPanel>
              <TabPanel
                value={TabType.Notification}
                className={classes.tabContentItem}
              >
                {pushKey && notificationsLoading && notificationsPage === 1 ? (
                  <Box className={classes.loadingContainer}>
                    <CircularProgress className={classes.loadingSpinner} />
                    <Typography className={classes.loadingText}>
                      {t('push.loadingNotifications')}
                    </Typography>
                  </Box>
                ) : pushKey && notifications?.length > 0 ? (
                  <InfiniteScroll
                    className={classes.infiniteScroll}
                    scrollableTarget="scrollable-div"
                    hasMore={notificationsAvailable}
                    next={() => loadNotifications(false)}
                    dataLength={notifications.length}
                    loader={<div></div>}
                    scrollThreshold={0.9}
                  >
                    {notifications.map(notification => (
                      <NotificationPreview
                        key={notification.sid}
                        notification={notification}
                        searchTerm={searchValue}
                      />
                    ))}
                  </InfiniteScroll>
                ) : pushKey ? (
                  <CallToAction
                    icon="NotificationsActiveOutlinedIcon"
                    title={t('push.emptyNotifications')}
                    subTitle={t('push.emptyNotificationsDescription')}
                    buttonText={t('push.findChannel')}
                    handleButtonClick={handleAppSubscribe}
                  />
                ) : (
                  <CallToAction
                    icon={'NotificationsActiveOutlinedIcon'}
                    title={t('push.notificationsNotReady')}
                    subTitle={t('push.notificationsNotReadyDescription')}
                    buttonText={t('manage.enable')}
                    handleButtonClick={onInitPushAccount}
                  />
                )}
              </TabPanel>
            </Box>
          </TabContext>
        </CardContent>
      </Card>
    ),
  );
};

export type ChatModalProps = {
  authDomain?: string;
  pushAccount: string;
  pushKey?: string;
  xmtpAddress: string;
  xmtpKey: Uint8Array;
  open: boolean;
  activeChat?: string;
  activeCommunity?: SerializedCryptoWalletBadge;
  activeTab?: TabType;
  incomingGroup?: IMessageIPFS;
  incomingMessage?: DecodedMessage;
  incomingNotification?: PayloadData;
  tabRefresh: Record<TabType, number>;
  blockedTopics: string[];
  setBlockedTopics: (v: string[]) => void;
  setWeb3Deps: (value: Web3Dependencies | undefined) => void;
  onClose(): void;
  onInitPushAccount(): void;
  onPopoutClick?: (address?: string) => void;
  setActiveChat: (v?: string) => void;
  setActiveCommunity: (v?: SerializedCryptoWalletBadge) => void;
  fullScreen?: boolean;
  variant?: ChatModalVariant;
};

export type ChatModalVariant = 'modal' | 'docked';

export default ChatModal;
