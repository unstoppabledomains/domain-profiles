import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import MarkUnreadChatAltOutlinedIcon from '@mui/icons-material/MarkUnreadChatAltOutlined';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type {Theme} from '@mui/material/styles';
import type {IMessageIPFS} from '@pushprotocol/restapi';
import * as PushAPI from '@pushprotocol/restapi';
import {EVENTS, createSocketConnection} from '@pushprotocol/socket';
import {ENV} from '@pushprotocol/socket/src/lib/constants';
import type {DecodedMessage} from '@xmtp/xmtp-js';
import {getNotificationConfigurations} from 'actions/backendActions';
import {getDomainBadges} from 'actions/domainActions';
import {isAddressSpam, joinBadgeGroupChat} from 'actions/messageActions';
import useUnstoppableMessaging from 'components/Chat/hooks/useUnstoppableMessaging';
import {AccessWalletModal} from 'components/Wallet/AccessWallet';
import {ethers} from 'ethers';
import useWeb3Context from 'hooks/useWeb3Context';
import {notifyError} from 'lib/error';
import useTranslationContext from 'lib/i18n';
import type {SerializedCryptoWalletBadge} from 'lib/types/badge';
import {DomainNotificationSettingsKey} from 'lib/types/message';
import type {Web3Dependencies} from 'lib/types/web3';
import {useSnackbar} from 'notistack';
import {Web3Context} from 'providers/Web3ContextProvider';
import QueryString from 'qs';
import React, {useContext, useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {IncomingChatSnackbar, IncomingSnackbar} from './IncomingSnackbar';
import SupportBubble from './SupportBubble';
import {parsePartnerMetadata} from './hooks/useFetchNotification';
import ChatModal from './modal/ChatModal';
import SetupModal from './modal/SetupModal';
import {acceptGroupInvite, getPushUser} from './protocol/push';
import {initXmtpAccount, waitForXmtpMessages} from './protocol/xmtp';
import {getPushLocalKey, getXmtpLocalKey, setPushLocalKey} from './storage';
import type {InitChatOptions, PayloadData} from './types';
import {
  ChatModalQueryString,
  ConfigurationState,
  MessagingSignatureType,
  PUSH_CHAT_APP,
  TabType,
  fromCaip10Address,
  getCaip10Address,
} from './types';

const useStyles = makeStyles<{inheritStyle?: boolean}>()(
  (theme: Theme, {inheritStyle}) => ({
    loadingIcon: {
      color: 'white',
      padding: theme.spacing(0.5),
    },
    messageButton: inheritStyle
      ? {}
      : {
          color: theme.palette.common.white,
          marginRight: theme.spacing(1),
          backgroundColor: 'rgba(128,128,128, 0.4)',
          '&:hover': {
            backgroundColor: 'rgba(128,128,128, 0.4)',
          },
        },
    messageIcon: inheritStyle
      ? {}
      : {
          fontSize: '30px',
          padding: theme.spacing(0.25),
        },
    messageIconForOnboarding: inheritStyle
      ? {
          color: theme.palette.neutralShades[400],
        }
      : {
          fontSize: '30px',
          color: theme.palette.neutralShades[400],
          padding: theme.spacing(0.25),
        },
  }),
);

const tooltipProps = {
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, 11],
      },
    },
  ],
};

type snackbarProps = {
  senderAddress?: string;
  topic?: string;
  groupChatId?: string;
  title?: string;
  body?: string;
  imageUrl?: string;
};

export type UnstoppableMessagingProps = {
  address?: string;
  domain?: string;
  inheritStyle?: boolean;
  large?: boolean;
  label?: string;
  disableSupportBubble?: boolean;
  initCallback?: () => void;
};

export const UnstoppableMessaging: React.FC<UnstoppableMessagingProps> = ({
  address,
  domain,
  inheritStyle,
  large,
  label,
  disableSupportBubble = true,
  initCallback,
}) => {
  const {classes} = useStyles({inheritStyle});
  const web3Context = useContext(Web3Context);
  const {
    openChat: externalChatId,
    setOpenChat: setExternalChatId,
    openCommunity: externalCommunityId,
    setOpenCommunity: setExternalCommunityId,
    setIsChatReady,
    setChatUser,
  } = useUnstoppableMessaging();
  const [t] = useTranslationContext();
  const {enqueueSnackbar} = useSnackbar();
  const {setWeb3Deps} = useWeb3Context();

  // Messaging user state
  const [configState, setConfigState] = useState(ConfigurationState.Initial);
  const [signatureInProgress, setSignatureInProgress] =
    useState<MessagingSignatureType>();
  const [initChatOptions, setInitChatOptions] = useState<InitChatOptions>();
  const [walletModalIsOpen, setWalletModalIsOpen] = useState(false);
  const [messagingInitialized, setMessagingInitialized] = useState<boolean>();
  const [pushUser, setPushUser] = useState<PushAPI.IUser>();
  const [blockedTopics, setBlockedTopics] = useState<string[]>([]);
  const [pushKey, setPushKey] = useState<string>();
  const [xmtpKey, setXmtpKey] = useState<Uint8Array>();

  // Chat window state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWindowOpen, setChatWindowOpen] = useState(false);
  const [chatIncomingMessage, setChatIncomingMessage] =
    useState<DecodedMessage>();
  const [pushIncomingMessage, setPushIncomingMessage] =
    useState<IMessageIPFS>();
  const [appIncomingNotification, setAppIncomingNotification] =
    useState<PayloadData>();
  const [chatWindowUpdated, setChatWindowUpdated] = useState<
    Record<TabType, number>
  >({
    chat: Date.now(),
    notification: Date.now(),
    communities: Date.now(),
  });
  const [chatWalletConnected, setChatWalletConnected] = useState(false);
  const [chatSnackbar, setChatSnackbar] = useState<snackbarProps>();

  // Chat notification state
  const [isNewMessage, setIsNewMessage] = useState(false);
  const [activeChat, setActiveChat] = useState<string>();
  const [activeCommunity, setActiveCommunity] =
    useState<SerializedCryptoWalletBadge>();
  const [activeTab, setActiveTab] = useState<TabType>();

  // Configuration state
  const [isNotificationEnabledP2p, setIsNotificationEnabledP2p] =
    useState(true);
  const [isNotificationEnabledB2c, setIsNotificationEnabledB2c] =
    useState(true);

  // retrieve initial configuration settings
  useEffect(() => {
    if (domain) {
      void fetchConfig();
    }
    setChatUser(domain);
  }, [domain]);

  // open chat window from URL params
  useEffect(() => {
    // wait for initialization
    if (
      messagingInitialized === undefined ||
      window?.location?.search === undefined
    ) {
      return;
    }

    //set badge modal open if query param matches badge code
    const query = QueryString.parse(window.location.search.replace('?', ''));
    if (messagingInitialized && query[ChatModalQueryString] !== undefined) {
      setExternalChatId(
        query[ChatModalQueryString]
          ? (query[ChatModalQueryString] as string)
          : config.XMTP.SUPPORT_DOMAIN_NAME,
      );
    }
  }, [messagingInitialized]);

  // open chat window on new active chat ID selected
  useEffect(() => {
    const openExternalChat = async (): Promise<void> => {
      if (!externalChatId) {
        return;
      }
      await handleChatClicked(externalChatId);
      setExternalChatId(undefined);
    };
    void openExternalChat();
  }, [externalChatId]);

  // open community chat window
  useEffect(() => {
    const openExternalCommunity = async (): Promise<void> => {
      if (!externalCommunityId) {
        return;
      }
      await handleCommunityClicked(externalCommunityId);
      setExternalCommunityId(undefined);
    };
    void openExternalCommunity();
  }, [externalCommunityId]);

  // message icons
  const messageReadyIcon = (
    <ChatOutlinedIcon id="chat-icon" className={classes.messageIcon} />
  );
  const messageUnreadIcon = (
    <MarkUnreadChatAltOutlinedIcon
      id="chat-icon"
      className={classes.messageIcon}
    />
  );
  const messageConfigureIcon = (
    <ChatOutlinedIcon
      id="chat-icon-configure"
      className={classes.messageIconForOnboarding}
    />
  );

  // get optionally stored messaging state at page load time. If the user has previously
  // logged into push with this domain on the current browser, the private key can
  // be loaded from the browser state and avoid a signature prompt.
  useEffect(() => {
    if (!address) {
      setMessagingInitialized(true);
      return;
    }
    const fetchUser = async () => {
      const cachedPushKey = getPushLocalKey(address);
      const cachedXmtpKey = getXmtpLocalKey(address);
      if (cachedXmtpKey) {
        setXmtpKey(cachedXmtpKey);
        setIsChatReady(true);
      }
      if (cachedPushKey) {
        setPushKey(cachedPushKey);
        setPushUser(await getPushUser(address));
      }
      setMessagingInitialized(true);
    };
    void fetchUser();
  }, [address]);

  // handles the notification click event, either onboarding the new user to Push or
  // opening the Push app for an existing user.
  useEffect(() => {
    if (!chatOpen || !address) {
      return;
    }
    void handleChatClicked();
  }, [web3Context, address]);

  // query messages once at load time and initialize a socket for new messages
  useEffect(() => {
    if (!address && !xmtpKey) {
      return;
    }

    // start socket for new messages
    void listenForMessages();
  }, [address, xmtpKey]);

  // incoming message notification snackbar
  useEffect(() => {
    try {
      if (chatWindowOpen || !chatSnackbar) {
        return;
      }

      // retrieve notification config if the user is signed in
      void fetchConfig();

      // process notifications
      if (
        chatSnackbar.senderAddress &&
        chatSnackbar.topic &&
        !blockedTopics.includes(chatSnackbar.topic)
      ) {
        onNewMessage(chatSnackbar.senderAddress);
        return;
      }
      if (chatSnackbar.senderAddress && chatSnackbar.groupChatId) {
        void onNewCommunityMessage(
          chatSnackbar.senderAddress,
          chatSnackbar.groupChatId,
        );
      }
      if (chatSnackbar.title && chatSnackbar.body) {
        onNewNotification(
          chatSnackbar.title,
          chatSnackbar.body,
          chatSnackbar.imageUrl || '',
        );
        return;
      }
    } finally {
      setChatSnackbar(undefined);
    }
  }, [chatWindowOpen, chatSnackbar]);

  const fetchConfig = async () => {
    if (!domain) {
      return;
    }

    // retrieve profile data and notification preferences
    const notificationConfig = await getNotificationConfigurations(domain);

    // set notification options for web UI
    if (notificationConfig && notificationConfig.length > 0) {
      const configKeys = notificationConfig.map(a => a.settingsKey);
      const isNotificationsConfigured = configKeys.includes(
        DomainNotificationSettingsKey.NOTIFICATIONS,
      );
      if (isNotificationsConfigured) {
        const isWebEnabled = configKeys.includes(
          DomainNotificationSettingsKey.WEB_NOTIFICATION,
        );
        const isP2p = configKeys.includes(
          DomainNotificationSettingsKey.MESSAGING_DOMAIN_OWNERS,
        );
        const isB2c = configKeys.includes(
          DomainNotificationSettingsKey.MESSAGING_DAPPS,
        );
        setIsNotificationEnabledP2p(isWebEnabled && isP2p);
        setIsNotificationEnabledB2c(isWebEnabled && isB2c);
      }
    }
  };

  const initChatAccounts = async (opts: InitChatOptions) => {
    if (!address) {
      return;
    }

    // determine if XMTP registration will be performed
    const xmtpLocalKey = getXmtpLocalKey(address);
    const xmtpSetupRequired = !xmtpLocalKey && !opts.skipXmtp;

    // determine if Push Protocol registration will be performed
    const pushLocalKey = getPushLocalKey(address);
    const pushSetupRequired = !pushLocalKey && !opts.skipPush;

    // ensure at least one setup option is required before continuing
    if (!xmtpSetupRequired && !pushSetupRequired) {
      return;
    }

    try {
      // open the configuration modal
      setSignatureInProgress(MessagingSignatureType.NewUser);
      setInitChatOptions(opts);
      if (!chatOpen) {
        setChatOpen(true);
      }

      // retrieve the wallet signer, which requires one or more signatures from
      // the user's wallet. Show a modal in the user experience to describe the
      // signatures and what they do.
      if (!web3Context?.web3Deps?.signer) {
        return;
      }
      setChatWalletConnected(true);

      // perform XMTP setup if required
      if (xmtpSetupRequired) {
        // create the XMTP account if necessary
        if (!xmtpLocalKey) {
          setConfigState(ConfigurationState.RegisterXmtp);
          await initXmtpAccount(address, web3Context.web3Deps.signer);
        }
        setXmtpKey(getXmtpLocalKey(address));
      }

      // perform Push Protocol setup if required
      if (pushSetupRequired) {
        // create the Push Protocol account if necessary
        let pushUserAccount = await getPushUser(address);
        if (!pushUserAccount) {
          setConfigState(ConfigurationState.RegisterPush);
          pushUserAccount = await PushAPI.user.create({
            // need to use the signer address, with actual address casing, since the UD
            // address variable is stored as lowercase. The case sensitivity needs to be
            // maintained for Push Protocol.
            account: await web3Context.web3Deps.signer.getAddress(),
            env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
            signer: web3Context.web3Deps
              .signer as unknown as PushAPI.SignerType,
          });
        }
        setPushUser(pushUserAccount);

        // retrieve the user's encryption key and store it locally on the device
        if (!getPushLocalKey(address)) {
          setConfigState(ConfigurationState.RegisterPush);
          const decryptedPvtKey = await PushAPI.chat.decryptPGPKey({
            encryptedPGPPrivateKey: pushUserAccount.encryptedPrivateKey,
            env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
            signer: web3Context.web3Deps
              .signer as unknown as PushAPI.SignerType,
          });

          try {
            // update the user name and PFP to be synced with current domain
            await PushAPI.user.profile.update({
              pgpPrivateKey: decryptedPvtKey,
              account: `eip155:${await web3Context.web3Deps.signer.getAddress()}`,
              env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
              profile: {
                name: domain,
                picture: `${config.UNSTOPPABLE_METADATA_ENDPOINT}/image-src/${domain}?withOverlay=false`,
              },
            });
          } catch (e) {
            // fail gracefully, as this API fails from time to time
            notifyError(e as Error);
          }

          // set configuration state
          setPushKey(decryptedPvtKey);
          setPushLocalKey(address, decryptedPvtKey);
        }

        // retrieve all of the user's current subscriptions
        setConfigState(ConfigurationState.QuerySubscriptions);
        const userSubscriptions = await PushAPI.user.getSubscriptions({
          user: getCaip10Address(pushUserAccount.wallets),
          env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
        });

        // check the status of the desired subscription
        for (const desiredSub of config.PUSH.CHANNELS) {
          const isSubscribed =
            userSubscriptions?.filter((sub: {channel: string}) =>
              desiredSub.toLowerCase().includes(sub.channel.toLowerCase()),
            ).length > 0;
          if (!isSubscribed) {
            setConfigState(ConfigurationState.RegisterPush);
            await PushAPI.channels.subscribe({
              signer: web3Context.web3Deps
                .signer as unknown as PushAPI.SignerType,
              channelAddress: desiredSub,
              userAddress: getCaip10Address(pushUserAccount.wallets),
              env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
              onError: (e: unknown) => notifyError(e),
            });
          }
        }
      }

      // set the chat ready flag
      setIsChatReady(true);

      // optional initialization callback
      setConfigState(ConfigurationState.Complete);
      if (initCallback) {
        initCallback();
      } else {
        // show the user the setup complete dialog
        return;
      }
    } catch (e) {
      notifyError(e);
    }

    // remove the modal from view
    handleCloseSetup();
  };

  const listenForMessages = async () => {
    if (!address || !xmtpKey) {
      notifyError(new Error('Required messaging accounts not defined'));
      return;
    }

    // create push protocol notification socket
    const pushSocketNotifications = createSocketConnection({
      user: getCaip10Address(address),
      socketType: 'notification',
      env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
      socketOptions: {autoConnect: true, reconnectionAttempts: 3},
    });

    // create push protocol chat socket
    const pushSocketChat = createSocketConnection({
      user: ethers.utils.getAddress(address),
      socketType: 'chat',
      env: config.APP_ENV === 'production' ? ENV.PROD : ENV.STAGING,
      socketOptions: {autoConnect: true, reconnectionAttempts: 3},
    });

    // listen on push protocol notification socket if it was created successfully
    if (pushSocketNotifications && pushSocketChat) {
      pushSocketChat.on(EVENTS.CHAT_RECEIVED_MESSAGE, message => {
        // check for a group chat message
        if (!message?.chatId) {
          return;
        }

        // raise notification
        setChatSnackbar({
          senderAddress: fromCaip10Address(message.fromCAIP10),
          groupChatId: message.chatId,
        });

        // update group chat window state
        setPushIncomingMessage(message);
        setChatWindowUpdated({
          communities: Date.now(),
          chat: chatWindowUpdated.chat,
          notification: chatWindowUpdated.notification,
        });
      });

      pushSocketNotifications.on(EVENTS.USER_FEEDS, feedItem => {
        // Ignore push chat app for notification socket, since they are handled
        // specifically on the chat socket. Can cause duplicate notification.
        if (feedItem.payload.data.app.toLowerCase() === PUSH_CHAT_APP) {
          return;
        }

        // parse additional metadata if it is available
        const partnerData = feedItem.payload.data.additionalMeta
          ? parsePartnerMetadata(feedItem.payload.data.additionalMeta)
          : undefined;

        // raise notification
        setChatSnackbar({
          title: partnerData?.name || feedItem.payload.data.app,
          body:
            partnerData?.name && feedItem.payload.data.asub
              ? feedItem.payload.data.asub
                  .replace(`${partnerData.name}:`, '')
                  .trim()
              : feedItem.payload.data.asub || t('push.newNotification'),
          imageUrl:
            partnerData?.logoUri ||
            feedItem.payload.data.aimg ||
            feedItem.payload.data.icon,
        });

        // update notification window state
        setAppIncomingNotification(feedItem.payload.data);
        setChatWindowUpdated({
          notification: Date.now(),
          chat: chatWindowUpdated.chat,
          communities: chatWindowUpdated.communities,
        });
      });
    }

    // wait for XMTP messages if initialized
    void waitForXmtpMessages(address, async (data: DecodedMessage) => {
      // check for spam and discard the message if necessary
      if (await isAddressSpam(data.senderAddress)) {
        return;
      }

      // raise notification
      setChatSnackbar({
        senderAddress: data.senderAddress,
        topic: data.conversation.topic,
      });
      setChatIncomingMessage(data);
      setChatWindowUpdated({
        chat: Date.now(),
        notification: chatWindowUpdated.notification,
        communities: chatWindowUpdated.communities,
      });
    });
  };

  const onNewMessage = (senderAddress: string) => {
    if (
      !address ||
      senderAddress.toLowerCase().includes(address.toLowerCase())
    ) {
      // do not notify when the sender is the current user
      return;
    }
    if (!isNotificationEnabledP2p) {
      // do not notify when disabled
      setIsNewMessage(true);
      return;
    }
    setIsNewMessage(true);
    setActiveTab(TabType.Chat);
    setChatSnackbar(undefined);
    enqueueSnackbar(t('push.incoming'), {
      preventDuplicate: true,
      content: (key, message) => (
        <IncomingChatSnackbar
          id={key.toString()}
          address={senderAddress}
          onClick={handleChatClicked}
        />
      ),
      autoHideDuration: 6000,
    });
  };

  const onNewCommunityMessage = async (
    senderAddress: string,
    chatId: string,
  ) => {
    if (
      !domain ||
      !address ||
      senderAddress.toLowerCase().includes(address.toLowerCase())
    ) {
      // do not notify when the sender is the current user
      return;
    }
    if (!isNotificationEnabledP2p) {
      // do not notify when disabled
      setIsNewMessage(true);
      return;
    }

    // check existing group chat communities
    const badges = await getDomainBadges(domain, {withoutPartners: true});
    const badge = badges?.list?.find(b => b.groupChatId === chatId);
    if (!badge) {
      // no community matching group chat ID
      return;
    }

    // display community group chat notification
    setIsNewMessage(true);
    setActiveTab(TabType.Communities);
    setChatSnackbar(undefined);
    enqueueSnackbar(t('push.incoming'), {
      preventDuplicate: true,
      content: (key, message) => (
        <IncomingChatSnackbar
          id={key.toString()}
          address={senderAddress}
          onClick={async () => {
            setActiveCommunity(badge);
            await handleChatClicked();
          }}
        />
      ),
      autoHideDuration: 6000,
    });
  };

  const onNewNotification = (
    name: string,
    subject: string,
    imageUrl: string,
  ) => {
    if (!isNotificationEnabledB2c) {
      // do not notify when disabled
      setIsNewMessage(true);
      return;
    }
    setIsNewMessage(true);
    setActiveTab(TabType.Notification);
    setChatSnackbar(undefined);
    enqueueSnackbar(subject ? subject : t('push.notification', {name}), {
      preventDuplicate: true,
      content: (key, message) => (
        <IncomingSnackbar
          id={key.toString()}
          imageUrl={imageUrl}
          title={name}
          message={message?.toString()}
          variant="notification"
          onClick={handleChatClicked}
        />
      ),
      autoHideDuration: 6000,
    });
  };

  const handleOpenChat = () => {
    setIsNewMessage(false);
    setChatOpen(false);
    setChatWindowOpen(true);
  };

  const handleClosePush = () => {
    setChatWindowOpen(false);
    setActiveChat(undefined);
    setActiveTab(undefined);
  };

  const handleCloseSetup = () => {
    setSignatureInProgress(undefined);
    setInitChatOptions(undefined);
    setChatOpen(false);
    setChatWalletConnected(false);
    setConfigState(ConfigurationState.Initial);
  };

  const handleChatClicked = async (chatId?: string) => {
    // close the push window if open and return
    if (chatWindowOpen && !chatId && !initChatOptions) {
      handleClosePush();
      return;
    }

    // initialize the chat accounts and keys if they have not already
    // been configured for this domain address
    if (!domain || !address) {
      setSignatureInProgress(MessagingSignatureType.NoPrimaryDomain);
    } else if (!xmtpKey || initChatOptions) {
      // start account setup for XMTP
      void initChatAccounts(initChatOptions || {skipPush: true});
    } else {
      // clear new message flag and set last read timestamp
      setIsNewMessage(false);

      // set the active chat if provided
      setActiveChat(chatId);
      if (chatId) {
        setActiveTab(undefined);
      }

      // open the push chat window
      setChatOpen(true);
      handleOpenChat();
    }
  };

  const handleCommunityClicked = async (badgeCode: string) => {
    // close the push window if open and return
    if (chatWindowOpen && !badgeCode && !initChatOptions) {
      handleClosePush();
      return;
    }

    // initialize the chat accounts and keys if they have not already
    // been configured for this domain address
    if (!domain || !address) {
      setSignatureInProgress(MessagingSignatureType.NoPrimaryDomain);
    } else if (!pushKey || initChatOptions) {
      // continue an existing setup, or start a new one for XMTP only
      void initChatAccounts(initChatOptions || {skipPush: false});
    } else {
      // clear new message flag and set last read timestamp
      setIsNewMessage(false);

      // set the active chat if provided
      const groupChatInfo = await joinBadgeGroupChat(
        badgeCode,
        address,
        pushKey,
      );
      if (groupChatInfo?.groupChatId) {
        // accept the chat request for the user and change to the
        // group conversation panel
        await acceptGroupInvite(groupChatInfo.groupChatId, address, pushKey);
      }
      if (groupChatInfo) {
        setActiveCommunity(groupChatInfo);
        setActiveTab(TabType.Communities);
      }

      // open the push chat window
      setChatOpen(true);
      handleOpenChat();
    }
  };

  const handleAccessWalletComplete = async (
    web3Dependencies?: Web3Dependencies,
  ) => {
    setWeb3Deps(web3Dependencies);
    setWalletModalIsOpen(false);
  };

  return (
    <>
      {label ? (
        <Button
          variant="contained"
          onClick={() => handleChatClicked()}
          startIcon={<ChatOutlinedIcon />}
          disabled={!messagingInitialized}
        >
          {label}
        </Button>
      ) : (
        <IconButton
          onClick={() => handleChatClicked()}
          className={classes.messageButton}
          data-testid={'header-chat-button'}
          id="chat-button"
          disabled={!messagingInitialized}
          size={large ? 'large' : 'small'}
          sx={{
            '&.Mui-disabled': inheritStyle
              ? {}
              : {
                  color: '#dddddd',
                  backgroundColor: 'rgba(128,128,128, 0.4)',
                },
          }}
        >
          {!domain ? (
            <Tooltip
              PopperProps={tooltipProps}
              placement="bottom"
              title={t('push.configure', {domain: 'one of your domains'})}
            >
              {messageConfigureIcon}
            </Tooltip>
          ) : xmtpKey ? (
            <Tooltip
              PopperProps={tooltipProps}
              placement="bottom"
              title={t(chatWindowOpen ? 'push.hide' : 'push.open', {domain})}
            >
              {isNewMessage ? messageUnreadIcon : messageReadyIcon}
            </Tooltip>
          ) : messagingInitialized && !signatureInProgress ? (
            <Tooltip
              PopperProps={tooltipProps}
              placement="bottom"
              title={t('push.configure', {domain})}
            >
              {messageConfigureIcon}
            </Tooltip>
          ) : (
            <Tooltip
              PopperProps={tooltipProps}
              placement="bottom"
              title={t('push.loading', {domain})}
            >
              {inheritStyle ? (
                messageReadyIcon
              ) : (
                <CircularProgress size="30px" className={classes.loadingIcon} />
              )}
            </Tooltip>
          )}
        </IconButton>
      )}
      <AccessWalletModal
        prompt={true}
        address={address}
        onComplete={deps => handleAccessWalletComplete(deps)}
        open={walletModalIsOpen}
        onClose={() => setWalletModalIsOpen(false)}
      />
      <SetupModal
        disabled={chatWalletConnected}
        domain={domain}
        isNewUser={signatureInProgress === MessagingSignatureType.NewUser}
        isNewNotification={
          signatureInProgress === MessagingSignatureType.MissingChannels
        }
        configState={configState}
        open={signatureInProgress !== undefined}
        onChat={handleOpenChat}
        onClose={handleCloseSetup}
        onConfirm={() => setWalletModalIsOpen(true)}
      />
      {address && xmtpKey && (
        <>
          <ChatModal
            pushAccount={`eip155:${
              pushUser ? fromCaip10Address(pushUser.wallets) : address
            }`}
            pushKey={pushKey}
            xmtpAddress={address}
            xmtpKey={xmtpKey}
            activeChat={activeChat}
            activeCommunity={activeCommunity}
            setActiveChat={setActiveChat}
            setActiveCommunity={setActiveCommunity}
            activeTab={activeTab}
            open={chatWindowOpen}
            incomingMessage={chatIncomingMessage}
            incomingGroup={pushIncomingMessage}
            incomingNotification={appIncomingNotification}
            tabRefresh={chatWindowUpdated}
            blockedTopics={blockedTopics}
            setBlockedTopics={setBlockedTopics}
            setWeb3Deps={setWeb3Deps}
            onClose={handleClosePush}
            onInitPushAccount={() =>
              initChatAccounts({
                skipXmtp: true,
                skipPush: false,
              })
            }
          />
          {!disableSupportBubble && (
            <SupportBubble
              open={!chatWindowOpen}
              setActiveChat={setExternalChatId}
            />
          )}
        </>
      )}
    </>
  );
};
