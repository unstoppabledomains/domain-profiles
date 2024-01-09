import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
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
import type {IMessageIPFS} from '@pushprotocol/restapi';
import type {MouseEvent} from 'react';
import React, {useEffect, useState} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import config from '@unstoppabledomains/config';

import {joinBadgeGroupChat} from '../../../../actions/messageActions';
import {notifyError} from '../../../../lib/error';
import useTranslationContext from '../../../../lib/i18n';
import type {SerializedCryptoWalletBadge} from '../../../../lib/types/badge';
import type {Web3Dependencies} from '../../../../lib/types/web3';
import {PUSH_PAGE_SIZE, decryptMessage, getMessages} from '../../protocol/push';
import CallToAction from '../CallToAction';
import {useConversationStyles} from '../styles';
import CommunityCompose from './CommunityCompose';
import CommunityConversationBubble from './CommunityConversationBubble';

const CardContentNoPadding = styled(CardContent)(`
  padding: 0;
  &:last-child {
    padding-bottom: 0;
  }
`);

export const Community: React.FC<CommunityProps> = ({
  address,
  authDomain,
  badge,
  pushKey,
  incomingMessage,
  storageApiKey,
  setWeb3Deps,
  onBack,
  onClose,
}) => {
  const {classes} = useConversationStyles({isChatRequest: false});
  const [t] = useTranslationContext();
  const [isLoading, setIsLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [pushMessages, setPushMessages] = useState<IMessageIPFS[]>([]);
  const [sentMessage, setSentMessage] = useState<IMessageIPFS>();

  useEffect(() => {
    if (!badge.groupChatId) {
      return;
    }
    void loadConversation();
  }, [address, badge]);

  useEffect(() => {
    if (!incomingMessage) {
      return;
    }
    const processMessage = async () => {
      if (incomingMessage.toDID === badge.groupChatId) {
        const decryptedMsg = await decryptMessage(
          address,
          pushKey,
          incomingMessage,
        );
        if (decryptedMsg) {
          setPushMessages([decryptedMsg, ...pushMessages]);
        }
      }
    };
    void processMessage();
  }, [incomingMessage]);

  useEffect(() => {
    if (!sentMessage) {
      return;
    }
    setPushMessages([sentMessage, ...pushMessages]);
  }, [sentMessage]);

  const loadPreviousPage = async () => {
    // require group chat ID
    if (!badge.groupChatId) {
      return;
    }

    // no message fetch required if empty
    if (pushMessages.length === 0) {
      setHasMoreMessages(false);
      return;
    }

    // retrieve oldest message on timeline
    const oldestMsg = pushMessages[pushMessages.length - 1];
    if (!oldestMsg.link) {
      setHasMoreMessages(false);
      return;
    }

    // fetch the next page of messages
    try {
      const previousMessages = await getMessages(
        badge.groupChatId,
        address,
        pushKey,
        oldestMsg.link,
      );
      if (previousMessages.length < PUSH_PAGE_SIZE) {
        setHasMoreMessages(false);
      }
      if (previousMessages.length > 0) {
        setPushMessages([...pushMessages, ...previousMessages.slice(1)]);
      }
    } catch (e) {
      notifyError(e, {msg: 'error fetching previous conversations'});
    }
  };

  const loadConversation = async () => {
    try {
      // require group chat ID
      if (!badge.groupChatId) {
        return;
      }

      // render the existing messages if available
      const initialMessages = await getMessages(
        badge.groupChatId,
        address,
        pushKey,
      );
      setHasMoreMessages(initialMessages.length >= PUSH_PAGE_SIZE);
      setPushMessages(initialMessages);
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

  const handleOpenMenu = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLeaveChat = async () => {
    if (!badge.groupChatId) {
      return;
    }
    await joinBadgeGroupChat(badge.code, address, pushKey, true);
  };

  const handleMoreInfo = () => {
    if (authDomain) {
      window.open(
        `${config.UD_ME_BASE_URL}/${authDomain}?openBadgeCode=${badge.code}`,
        '_blank',
      );
    }
  };

  const handleBlockSender = (id: string) => {
    // TODO - placeholder to block sender of a group message
    notifyError(
      new Error('TODO - not yet implemented'),
      {msg: `block sender ${id}`},
      'warning',
    );
  };

  const renderedPushMessages = pushMessages
    .filter(
      (message, index) =>
        pushMessages.findIndex(item => item.timestamp === message.timestamp) ===
        index,
    )
    .map(message => (
      <CommunityConversationBubble
        address={address}
        message={message}
        key={message.timestamp}
        onBlockTopic={() => handleBlockSender(message.fromCAIP10)}
        renderCallback={
          pushMessages.length > 0 &&
          message.timestamp! >= pushMessages[0].timestamp!
            ? scrollToLatestMessage
            : undefined
        }
      />
    ))
    .filter(message => message);

  return (
    <Card className={classes.cardContainer} variant="outlined">
      <CardHeader
        title={
          <Box className={classes.headerTitleContainer}>
            <Typography variant="subtitle2">{badge.name}</Typography>
          </Box>
        }
        avatar={
          <Box className={classes.headerActionContainer}>
            <ArrowBackOutlinedIcon
              className={classes.headerBackIcon}
              onClick={onBack}
            />
            <Avatar className={classes.avatar} src={badge.logo} />
          </Box>
        }
        action={
          <Box className={classes.headerActionContainer}>
            {authDomain && (
              <Tooltip title={t('profile.moreInformation')}>
                <InfoOutlinedIcon
                  className={classes.headerCloseIcon}
                  onClick={handleMoreInfo}
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
                onClick={async () => {
                  await handleLeaveChat();
                  handleCloseMenu();
                  onBack();
                }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2">{t('push.leave')}</Typography>
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
        <Box className={classes.conversationContainer} id="scrollable-div">
          {isLoading ? (
            <Box className={classes.loadingContainer}>
              <CircularProgress className={classes.loadingSpinner} />
              <Typography className={classes.loadingText}>
                {t('push.loadingConversation')}
              </Typography>
            </Box>
          ) : badge.groupChatId ? (
            renderedPushMessages.length === 0 ? (
              <CallToAction
                icon="ForumOutlinedIcon"
                title={t('push.joinedGroupChat')}
                subTitle={t('push.joinedGroupChatDescription')}
              />
            ) : (
              <InfiniteScroll
                inverse={true}
                style={{display: 'flex', flexDirection: 'column-reverse'}}
                className={classes.infiniteScroll}
                scrollableTarget="scrollable-div"
                hasMore={hasMoreMessages}
                next={loadPreviousPage}
                dataLength={renderedPushMessages.length}
                loader={
                  <Box className={classes.ininiteScrollLoading}>
                    <CircularProgress className={classes.loadingSpinner} />
                  </Box>
                }
                scrollThreshold={0.9}
              >
                {renderedPushMessages}
              </InfiniteScroll>
            )
          ) : (
            <CallToAction icon="CloudOffIcon" title={t('push.chatNotReady')} />
          )}
        </Box>
      </CardContent>
      <CardContentNoPadding className={classes.composeContainer}>
        {badge.groupChatId && (
          <CommunityCompose
            address={address}
            chatId={badge.groupChatId}
            pushKey={pushKey}
            storageApiKey={storageApiKey}
            sendCallback={setSentMessage}
            setWeb3Deps={setWeb3Deps}
          />
        )}
      </CardContentNoPadding>
    </Card>
  );
};

export type CommunityProps = {
  address: string;
  authDomain?: string;
  badge: SerializedCryptoWalletBadge;
  pushKey: string;
  incomingMessage?: IMessageIPFS;
  storageApiKey?: string;
  setWeb3Deps: (value: Web3Dependencies | undefined) => void;
  onBack: () => void;
  onClose: () => void;
};

export default Community;
