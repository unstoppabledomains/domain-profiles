/* eslint-disable @typescript-eslint/no-explicit-any */
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
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
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {styled} from '@mui/material/styles';
import type {IMessageIPFS} from '@pushprotocol/restapi';
import type {
  DecodedMessage,
  Conversation as XmtpConversation,
} from '@xmtp/xmtp-js';
import {ContentTypeText} from '@xmtp/xmtp-js';
import React, {useEffect, useState} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useFeatureFlags} from '../../../actions/featureFlagActions';
import {
  getDomainSignatureExpiryKey,
  getDomainSignatureValueKey,
} from '../../../components/Wallet/ProfileManager';
import {notifyError} from '../../../lib/error';
import useTranslationContext from '../../../lib/i18n';
import type {SerializedCryptoWalletBadge} from '../../../lib/types/badge';
import type {SerializedUserDomainProfileData} from '../../../lib/types/domain';
import {DomainProfileKeys} from '../../../lib/types/domain';
import type {Web3Dependencies} from '../../../lib/types/web3';
import useFetchNotifications from '../hooks/useFetchNotification';
import {registerClientTopics} from '../protocol/registration';
import {getAddressMetadata} from '../protocol/resolution';
import type {ConversationMeta} from '../protocol/xmtp';
import {getConversation, getConversations} from '../protocol/xmtp';
import type {AddressResolution, PayloadData} from '../types';
import {TabType, getCaip10Address} from '../types';
import Search from './Search';
import Conversation from './dm/Conversation';
import ConversationPreview from './dm/ConversationPreview';
import ConversationStart from './dm/ConversationStart';
import Community from './group/Community';
import CommunityList from './group/CommunityList';
import NotificationPreview from './notification/NotificationPreview';

const useStyles = makeStyles()((theme: Theme) => ({
  chatModalContainer: {
    position: 'fixed',
    bottom: '15px',
    right: '10px',
    width: '450px',
    height: '600px',
    margin: theme.spacing(1),
    zIndex: 200,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      height: '100%',
      bottom: '0px',
      right: '0px',
      margin: 0,
    },
  },
  chatModalContentContainer: {
    padding: theme.spacing(1),
    border: 'none',
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
  },
  newChatIcon: {
    marginRight: theme.spacing(0.7),
    color: theme.palette.primary.main,
    transform: 'scaleX(-1)',
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
    height: '425px',
    [theme.breakpoints.down('sm')]: {
      height: 'calc(100vh - 200px)',
    },
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
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(5),
    color: theme.palette.neutralShades[400],
  },
  emptyIcon: {
    width: 100,
    height: 100,
  },
  configureButton: {
    marginTop: theme.spacing(2),
  },
  viewRequestsButton: {
    marginTop: theme.spacing(-1),
    marginBottom: theme.spacing(3),
  },
}));

const StyledTabBadge = styled(Badge)<BadgeProps>(({theme}) => ({
  '& .MuiBadge-badge': {
    right: -1,
  },
}));

export const ChatModal: React.FC<ChatModalProps> = ({
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
  setActiveChat,
  setActiveCommunity,
}) => {
  const {cx, classes} = useStyles();
  const [t] = useTranslationContext();
  const {data: featureFlags} = useFeatureFlags();
  const [loadingText, setLoadingText] = useState<string>();
  const [lastRefresh, setLastRefresh] = useState<Record<TabType, number>>({
    chat: 0,
    communities: 0,
    notification: 0,
  });
  const [tabUnreadDot, setTabUnreadDot] = useState<Record<TabType, boolean>>({
    chat: false,
    communities: false,
    notification: false,
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
  const [conversationRequestView, setConversationRequestView] =
    useState<boolean>();
  const [notifications, setNotifications] = useState<PayloadData[]>([]);
  const [notificationsAvailable, setNotificationsAvailable] = useState(true);
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [domain, setDomain] = useState<string>();
  const [userProfile, setUserProfile] =
    useState<SerializedUserDomainProfileData>();
  const {fetchNotifications, loading: notificationsLoading} =
    useFetchNotifications(getCaip10Address(pushAccount));

  useEffect(() => {
    if (open) {
      // browser settings check
      void checkBrowserSettings();

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
          void handleOpenChatFromName(activeChat);
        } else {
          void loadConversations(false);
        }
      } else if (tabValue === TabType.Notification) {
        void loadNotifications(true);
      }
    } else if (conversations === undefined) {
      // preload conversations to improve perceived performance
      void loadConversations(false);
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

  const checkBrowserSettings = async () => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted') {
        const result = await Notification.requestPermission();
      }
    }
  };

  const loadConversations = async (forceRefresh?: boolean) => {
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
        // load blocked topics and user data from profile service
        await Promise.all([loadBlockedTopics(), loadUserProfile()]);

        // load conversations from XMTP
        const localConversations = await getConversations(xmtpAddress);
        setConversations(localConversations);
        setLastRefresh({
          chat: Date.now(),
          communities: lastRefresh.communities,
          notification: lastRefresh.notification,
        });
        return localConversations;
      } catch (e) {
        notifyError(e, {msg: 'error loading conversations'}, 'info');
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
    });
  };

  const loadBlockedTopics = async () => {
    try {
      // request the domain's blocked topics from profile API
      const authDomain = localStorage.getItem(DomainProfileKeys.AuthDomain);
      const response = await fetch(
        `${config.PROFILE.HOST_URL}/user/${authDomain}/notifications/preferences`,
      );
      const responseJSON = await response.json();

      // set blocked topics from result
      if (responseJSON?.blocked_topics) {
        setBlockedTopics(responseJSON.blocked_topics);
      }
      if (responseJSON?.accepted_topics) {
        setAcceptedTopics(responseJSON.accepted_topics);
      }
    } catch (e) {
      notifyError(e, {msg: 'unable to load blocked topics'}, 'warning');
    }
  };

  // loadUserProfile authenticates with user token to retrieve private data about the
  // user such as user-specific storage API key
  const loadUserProfile = async () => {
    try {
      // retrieve domain being used for messaging
      const authDomain = localStorage.getItem(DomainProfileKeys.AuthDomain);
      if (authDomain) {
        setDomain(authDomain);
      }

      // retrieve optional signature data
      const authExpiry = localStorage.getItem(
        getDomainSignatureExpiryKey(authDomain!),
      );
      const authSignature = localStorage.getItem(
        getDomainSignatureValueKey(authDomain!),
      );

      // request the domain's user data from profile API if signature is available
      if (authDomain && authExpiry && authSignature) {
        const response = await fetch(
          `${config.PROFILE.HOST_URL}/user/${authDomain}?fields=profile`,
          {
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
        const responseJSON: SerializedUserDomainProfileData =
          await response.json();
        if (responseJSON?.storage) {
          setUserProfile(responseJSON);
        }
      }
    } catch (e) {
      notifyError(e, {msg: 'unable to load user profile'}, 'warning');
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
        item.conversation.topic.toLowerCase() ===
        msg.conversation.topic.toLowerCase(),
    );

    // manage timeline depending on state
    if (
      localConversations &&
      conversationIndex !== undefined &&
      conversationIndex >= 0
    ) {
      // update the existing entry
      localConversations[conversationIndex].preview = getMessagePreview(msg);
      localConversations[conversationIndex].timestamp = msg.sent.getTime();

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
        conversation: msg.conversation,
        preview: getMessagePreview(msg),
        timestamp: msg.sent.getTime(),
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
      await registerClientTopics(msg.conversation.clientAddress, [
        {
          topic: msg.conversation.topic,
          peerAddress: msg.conversation.peerAddress,
        },
      ]);
    }
    // initialize a new timeline
    else {
      // create new conversation
      const newConversation: ConversationMeta = {
        conversation: msg.conversation,
        preview: getMessagePreview(msg),
        timestamp: msg.sent.getTime(),
        visible: true,
      };

      // initialize the timeline
      setConversations([newConversation]);

      // associate the new conversation with the wallet address
      await registerClientTopics(msg.conversation.clientAddress, [
        {
          topic: msg.conversation.topic,
          peerAddress: msg.conversation.peerAddress,
        },
      ]);
    }

    // set notification dot if needed
    if (tabValue !== TabType.Chat) {
      setTabUnreadDot({
        ...tabUnreadDot,
        chat: true,
      });
    }
  };

  const getMessagePreview = (msg: DecodedMessage): string => {
    return `${
      msg.senderAddress.toLowerCase() ===
      msg.conversation.clientAddress.toLowerCase()
        ? `${t('common.you')}: `
        : ''
    }${
      msg.contentType.sameAs(ContentTypeText)
        ? msg.content
        : t('push.attachment')
    }`;
  };

  const handleNewChat = () => {
    setConversationSearch(true);
  };

  const handleSettingsClick = async () => {
    window.location.href = `${config.UNSTOPPABLE_WEBSITE_URL}/manage?domain=${domain}&page=web3Messaging`;
  };

  const handleOpenChatFromName = async (name: string) => {
    setLoadingText(t('push.loadingUser', {user: name}));
    try {
      const peer = await getAddressMetadata(name);
      if (peer) {
        return await handleOpenChatFromAddress(peer);
      }
    } catch (e) {
      notifyError(e, {msg: 'error opening chat for user'}, 'warning');
    } finally {
      setLoadingText(undefined);
    }
  };

  const handleOpenChatFromAddress = async (peer: AddressResolution) => {
    try {
      // open chat from already listed conversation records
      const localConversations =
        conversations && conversations.length > 0
          ? conversations
          : await loadConversations();
      if (localConversations) {
        const matchingConversation = localConversations.filter(
          c =>
            c.conversation.peerAddress.toLowerCase() ===
            peer.address.toLowerCase(),
        );
        if (matchingConversation.length > 0) {
          handleOpenChat(matchingConversation[0].conversation);
          return;
        }
      }

      // open the chat using direct lookup
      const conversationLower = await getConversation(
        xmtpAddress,
        peer.address.toLowerCase(),
      );
      if (conversationLower) {
        try {
          const conversationNormalized = await getConversation(
            xmtpAddress,
            conversationLower.peerAddress,
          );
          if (conversationNormalized) {
            handleOpenChat(conversationNormalized);
          }
        } catch (e) {
          handleOpenChat(conversationLower);
        }
      }
    } catch (e) {
      notifyError(e, {msg: 'error opening chat from address'}, 'warning');
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
    setSearchValue(undefined);
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

  const handleConversationMessage = (
    msg: DecodedMessage,
    conversation?: XmtpConversation,
  ) => {
    if (!conversation || !conversations) return;
    const conversationIndex = conversations.findIndex(
      item =>
        item.conversation.topic.toLowerCase() ===
        conversation.topic.toLowerCase(),
    );
    if (conversationIndex >= 0 && conversations[conversationIndex]) {
      conversations[conversationIndex].preview = getMessagePreview(msg);
      conversations[conversationIndex].timestamp = msg.sent.getTime();
      setConversations([
        ...conversations.sort((a, b): number => {
          return b.timestamp - a.timestamp;
        }),
      ]);
    } else {
      setConversations([
        {
          conversation,
          preview: getMessagePreview(msg),
          timestamp: msg.sent.getTime(),
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

    // if no conversations visible, switch to search tab
    if (
      conversations?.filter(
        c => acceptedTopics.includes(c.conversation.topic) && c.visible,
      ).length === 0
    ) {
      setConversationSearch(true);
    }
  };

  const getRequestCount = () => {
    return (
      conversations?.filter(
        c =>
          !acceptedTopics.includes(c.conversation.topic) &&
          !blockedTopics.includes(c.conversation.topic),
      ).length || 0
    );
  };

  const PushProtocolOnboarding: React.FC = () => {
    return (
      <Box className={classes.emptyContainer}>
        {tabValue === TabType.Notification ? (
          <NotificationsActiveOutlinedIcon className={classes.emptyIcon} />
        ) : (
          <GroupsIcon className={classes.emptyIcon} />
        )}
        <Typography variant="h6">
          {pushKey
            ? tabValue === TabType.Notification
              ? t('push.emptyNotifications')
              : t('push.communitiesCollect')
            : tabValue === TabType.Notification
            ? t('push.notificationsNotReady')
            : t('push.communitiesNotReady')}
        </Typography>
        {!pushKey && (
          <Button
            variant="contained"
            onClick={onInitPushAccount}
            className={classes.configureButton}
          >
            {t('manage.enable')}
          </Button>
        )}
      </Box>
    );
  };

  return (
    <Card
      className={classes.chatModalContainer}
      sx={{display: open ? '' : 'none'}}
      elevation={2}
    >
      {conversationSearch ? (
        <ConversationStart
          address={xmtpAddress}
          onClose={onClose}
          onBack={handleCloseSearch}
          selectedCallback={handleOpenChatFromAddress}
          initialSearch={searchValue}
        />
      ) : conversationPeer || conversationMetadata ? (
        <Conversation
          conversation={conversationPeer}
          metadata={conversationMetadata}
          acceptedTopics={acceptedTopics}
          blockedTopics={blockedTopics}
          storageApiKey={userProfile?.storage?.apiKey}
          setAcceptedTopics={setAcceptedTopics}
          setBlockedTopics={setBlockedTopics}
          setWeb3Deps={setWeb3Deps}
          onNewMessage={(msg: DecodedMessage) =>
            handleConversationMessage(msg, conversationPeer)
          }
          onBack={handleCloseChat}
          onClose={onClose}
        />
      ) : pushAccount && pushKey && activeCommunity?.groupChatId ? (
        <Community
          address={xmtpAddress}
          badge={activeCommunity}
          pushKey={pushKey}
          incomingMessage={incomingGroup}
          storageApiKey={userProfile?.storage?.apiKey}
          setWeb3Deps={setWeb3Deps}
          onBack={handleCloseChat}
          onClose={onClose}
        />
      ) : (
        <Card className={classes.chatModalContentContainer} variant="outlined">
          <CardHeader
            title={t('push.messages')}
            action={
              <Box className={classes.headerActionContainer}>
                <Tooltip title={t('push.chatNew')}>
                  <AddCommentOutlinedIcon
                    className={cx(
                      classes.headerActionIcon,
                      classes.newChatIcon,
                    )}
                    onClick={handleNewChat}
                  />
                </Tooltip>
                <Tooltip title={t('push.settings')}>
                  <SettingsOutlinedIcon
                    className={classes.headerActionIcon}
                    onClick={handleSettingsClick}
                    id="settings-button"
                  />
                </Tooltip>
                <Tooltip title={t('common.close')}>
                  <KeyboardDoubleArrowDownIcon
                    className={classes.headerActionIcon}
                    onClick={onClose}
                  />
                </Tooltip>
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
                <TabPanel
                  value={TabType.Chat}
                  className={classes.tabContentItem}
                >
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
                      {conversations
                        ?.filter(c =>
                          conversationRequestView
                            ? !acceptedTopics.includes(c.conversation.topic) &&
                              !blockedTopics.includes(c.conversation.topic)
                            : acceptedTopics.includes(c.conversation.topic),
                        )
                        .map(c => (
                          <ConversationPreview
                            key={c.conversation.topic}
                            selectedCallback={handleOpenChat}
                            searchTermCallback={(visible: boolean) =>
                              handleSearchCallback(c, visible)
                            }
                            searchTerm={searchValue}
                            acceptedTopics={acceptedTopics}
                            conversation={c}
                          />
                        ))}
                    </Box>
                  )}
                </TabPanel>
                <TabPanel
                  value={TabType.Communities}
                  className={classes.tabContentItem}
                >
                  {pushAccount && pushKey && domain ? (
                    <CommunityList
                      address={xmtpAddress}
                      domain={domain}
                      pushKey={pushKey}
                      searchTerm={searchValue}
                      setActiveCommunity={setActiveCommunity}
                    />
                  ) : (
                    <PushProtocolOnboarding />
                  )}
                </TabPanel>
                <TabPanel
                  value={TabType.Notification}
                  className={classes.tabContentItem}
                >
                  {pushKey &&
                  notificationsLoading &&
                  notificationsPage === 1 ? (
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
                  ) : (
                    <PushProtocolOnboarding />
                  )}
                </TabPanel>
              </Box>
            </TabContext>
          </CardContent>
        </Card>
      )}
    </Card>
  );
};

export type ChatModalProps = {
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
  setActiveChat: (v?: string) => void;
  setActiveCommunity: (v?: SerializedCryptoWalletBadge) => void;
};

export default ChatModal;
