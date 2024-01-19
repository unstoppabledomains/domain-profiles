/* eslint-disable @typescript-eslint/no-explicit-any */
import ChatIcon from '@mui/icons-material/ChatOutlined';
import CloseIcon from '@mui/icons-material/Close';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import GroupsIcon from '@mui/icons-material/GroupOutlined';
import AppsIcon from '@mui/icons-material/NotificationsActiveOutlined';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
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
import useFetchNotifications from '../../../hooks/useFetchNotification';
import {fetchApi, isDomainValidForManagement} from '../../../lib';
import {notifyError} from '../../../lib/error';
import useTranslationContext from '../../../lib/i18n';
import type {SerializedCryptoWalletBadge} from '../../../lib/types/badge';
import type {SerializedUserDomainProfileData} from '../../../lib/types/domain';
import type {Web3Dependencies} from '../../../lib/types/web3';
import {registerClientTopics} from '../protocol/registration';
import {getAddressMetadata} from '../protocol/resolution';
import type {ConversationMeta} from '../protocol/xmtp';
import {getConversation, getConversations} from '../protocol/xmtp';
import type {AddressResolution, PayloadData} from '../types';
import {TabType, getCaip10Address} from '../types';
import CallToAction from './CallToAction';
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
    boxShadow: theme.shadows[6],
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
  },
  newChatIcon: {
    marginRight: theme.spacing(0.7),
    color: theme.palette.primary.main,
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
  setActiveChat,
  setActiveCommunity,
}) => {
  const {cx, classes} = useStyles();
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
  const [conversationRequestView, setConversationRequestView] =
    useState<boolean>();
  const [notifications, setNotifications] = useState<PayloadData[]>([]);
  const [notificationsAvailable, setNotificationsAvailable] = useState(true);
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [userProfile, setUserProfile] =
    useState<SerializedUserDomainProfileData>();
  const {fetchNotifications, loading: notificationsLoading} =
    useFetchNotifications(getCaip10Address(pushAccount));

  // conversations to display in the current inbox view
  const visibleConversations = conversations?.filter(c =>
    conversationRequestView
      ? !acceptedTopics.includes(c.conversation.topic) &&
        !blockedTopics.includes(c.conversation.topic)
      : acceptedTopics.includes(c.conversation.topic),
  );

  useEffect(() => {
    if (open) {
      // browser settings check
      void checkBrowserSettings();

      // load user settings
      void loadUserProfile();

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
    if (conversations) {
      setConversations([...conversations]);
    }
  }, [acceptedTopics, blockedTopics]);

  useEffect(() => {
    if (!conversations || conversations.length === 0) {
      return;
    }

    // set initial topic consent values
    if (acceptedTopics.length === 0 && blockedTopics.length === 0) {
      setAcceptedTopics(
        conversations
          .filter(c => c.consentState === 'allowed')
          .map(c => c.conversation.topic),
      );
      setBlockedTopics(
        conversations
          .filter(c => c.consentState === 'denied')
          .map(c => c.conversation.topic),
      );
    }
  }, [conversations]);

  useEffect(() => {
    if (!visibleConversations) {
      return;
    }

    // disable search panel if not on the chat tab
    if (tabValue !== TabType.Chat) {
      setConversationSearch(false);
      return;
    }

    // enable search panel if no conversations are visible
    if (searchValue !== '') {
      const visibleNonFilteredConversations = visibleConversations.filter(
        c => c.visible,
      );
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
        notifyError(e, {msg: 'error loading conversations'}, 'warning');
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
      const authExpiry = localStorage.getItem(
        getDomainSignatureExpiryKey(authDomain!),
      );
      const authSignature = localStorage.getItem(
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
        consentState:
          msg.senderAddress.toLowerCase() ===
          msg.conversation.clientAddress.toLowerCase()
            ? 'allowed' // messages sent by client are allowed by default
            : 'unknown', // messages received by client are unknown by default
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
        consentState:
          msg.senderAddress.toLowerCase() ===
          msg.conversation.clientAddress.toLowerCase()
            ? 'allowed' // messages sent by client are allowed by default
            : 'unknown', // messages received by client are unknown by default
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
          consentState:
            msg.senderAddress.toLowerCase() ===
            conversation.clientAddress.toLowerCase()
              ? 'allowed' // messages sent by client are allowed by default
              : 'unknown', // messages received by client are unknown by default
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
          !acceptedTopics.includes(c.conversation.topic) &&
          !blockedTopics.includes(c.conversation.topic),
      ).length || 0
    );
  };

  // number of chat requests
  const requestCount = getRequestCount();

  return (
    <Card
      className={classes.chatModalContainer}
      sx={{display: open ? '' : 'none'}}
      variant="elevation"
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
          authDomain={authDomain}
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
          authDomain={authDomain}
          badge={activeCommunity}
          pushKey={pushKey}
          incomingMessage={incomingGroup}
          storageApiKey={userProfile?.storage?.apiKey}
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
        <Card className={classes.chatModalContentContainer} variant="outlined">
          <CardHeader
            title={t('push.messages')}
            action={
              <Box className={classes.headerActionContainer}>
                <Tooltip title={t('push.chatNew')}>
                  <SmsOutlinedIcon
                    className={cx(
                      classes.headerActionIcon,
                      classes.newChatIcon,
                    )}
                    onClick={handleNewChat}
                  />
                </Tooltip>
                {(!authDomain || !isDomainValidForManagement(authDomain)) && (
                  <Badge color="warning" variant="dot">
                    <Tooltip title={t('push.getAnIdentity')}>
                      <FingerprintIcon
                        className={classes.headerActionIcon}
                        onClick={handleIdentityClick}
                        color="warning"
                        id="identity-button"
                      />
                    </Tooltip>
                  </Badge>
                )}
                <Tooltip title={t('common.close')}>
                  <CloseIcon
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
                      {visibleConversations &&
                      visibleConversations.length > 0 ? (
                        visibleConversations.map(c => (
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
                        ))
                      ) : (
                        <CallToAction
                          icon="ForumOutlinedIcon"
                          title={
                            requestCount === 0
                              ? t('push.chatNew')
                              : t('push.chatNewRequest')
                          }
                          subTitle={
                            requestCount === 0
                              ? t('push.chatNewDescription')
                              : t('push.chatNewRequestDescription')
                          }
                        />
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
      )}
    </Card>
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
  setActiveChat: (v?: string) => void;
  setActiveCommunity: (v?: SerializedCryptoWalletBadge) => void;
};

export default ChatModal;
