import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import BlockIcon from '@mui/icons-material/Block';
import GroupsIcon from '@mui/icons-material/GroupOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
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
import type {GroupDTO, IMessageIPFS} from '@pushprotocol/restapi';
import Bluebird from 'bluebird';
import {useSnackbar} from 'notistack';
import type {MouseEvent} from 'react';
import React, {useEffect, useState} from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import config from '@unstoppabledomains/config';

import {joinBadgeGroupChat} from '../../../../actions/messageActions';
import {notifyEvent} from '../../../../lib/error';
import useTranslationContext from '../../../../lib/i18n';
import type {SerializedCryptoWalletBadge} from '../../../../lib/types/badge';
import type {Web3Dependencies} from '../../../../lib/types/web3';
import type {CopyModule} from '../../../CopyToClipboard';
import {noop} from '../../../CopyToClipboard';
import {DomainListModal} from '../../../Domain';
import {
  PUSH_PAGE_SIZE,
  getGroupInfo,
  getMessages,
  getPushUser,
  updateBlockedList,
} from '../../protocol/push';
import {getAddressMetadata} from '../../protocol/resolution';
import type {Reaction} from '../../protocol/types';
import {fromCaip10Address} from '../../types';
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
}) => {
  const {classes} = useConversationStyles({isChatRequest: false});
  const [t] = useTranslationContext();
  const {enqueueSnackbar} = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isViewableMessage, setIsViewableMessage] = useState(false);
  const [isViewingMemberList, setIsViewingMemberList] = useState(false);
  const [isViewingBlockedList, setIsViewingBlockedList] = useState(false);
  const [emojiReactions, setEmojiReactions] = useState<Reaction[]>([]);
  const [groupInfo, setGroupInfo] = useState<GroupDTO>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [pushMessages, setPushMessages] = useState<IMessageIPFS[]>([]);
  const [sentMessage, setSentMessage] = useState<IMessageIPFS>();
  const [blockedAddresses, setBlockedAddresses] = useState<string[]>([]);

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
        setPushMessages([incomingMessage, ...pushMessages]);
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
      notifyEvent(e, 'error', 'Messaging', 'PushProtocol', {
        msg: 'error fetching previous conversations',
      });
    }
  };

  const loadConversation = async () => {
    try {
      // require group chat ID
      if (!badge.groupChatId) {
        return;
      }

      // retrieve blocked users
      const pushUser = await getPushUser(address);
      if (pushUser?.profile?.blockedUsersList) {
        setBlockedAddresses(
          pushUser.profile.blockedUsersList
            .map(a => fromCaip10Address(a)?.toLowerCase() || '')
            .filter(a => a.length > 0),
        );
      }

      // render the existing messages if available
      const [initialMessages, group] = await Promise.all([
        getMessages(badge.groupChatId, address, pushKey),
        getGroupInfo(badge.groupChatId),
      ]);
      setIsMember(
        group?.members
          .map(m => fromCaip10Address(m.wallet)?.toLowerCase())
          .includes(address.toLowerCase()) || false,
      );
      setGroupInfo(group);
      setHasMoreMessages(initialMessages.length >= PUSH_PAGE_SIZE);
      setPushMessages(initialMessages);
    } catch (e) {
      notifyEvent(e, 'error', 'Messaging', 'PushProtocol', {
        msg: 'error loading conversation',
      });
    } finally {
      // loading complete
      setIsLoading(false);
    }
  };

  const handleOnRender = (ref: React.RefObject<HTMLElement>) => {
    setIsViewableMessage(true);
  };

  const handleOnRenderAndScroll = (ref: React.RefObject<HTMLElement>) => {
    handleOnRender(ref);
    ref.current?.scrollIntoView({
      behavior: 'auto',
    });
  };

  const handleClickToCopy = () => {
    enqueueSnackbar(t('common.copied'), {variant: 'success'});
  };

  const handleOpenMenu = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleShareInvite = () => {
    void (import('clipboard-copy') as Promise<CopyModule>).then(
      (mod: CopyModule) => {
        mod
          .default(
            `${config.UD_ME_BASE_URL}/${authDomain}?openBadgeCode=${badge.code}&action=invite`,
          )
          .then(handleClickToCopy)
          .catch(noop);
      },
    );
  };

  const handleLeaveChat = async () => {
    if (!badge.groupChatId) {
      return;
    }
    setIsLeaving(true);
    await joinBadgeGroupChat(badge.code, address, pushKey, true);
  };

  const handleGroupList = () => {
    setIsViewingMemberList(true);
  };

  const handleBlockedList = () => {
    setIsViewingBlockedList(true);
  };

  const handleRetrieveMembers = async (startIndex?: number | string) => {
    return await handleRetrieveDomainList(
      groupInfo?.members.map(m => m.wallet) || [],
      startIndex,
    );
  };

  const handleUnblockDomain = async (domain: string) => {
    setIsViewingBlockedList(false);
    const domainInfo = await getAddressMetadata(domain);
    if (domainInfo) {
      await handleBlockSender(undefined, domainInfo.address);
    }
  };

  const handleRetrieveBlocked = async (startIndex?: number | string) => {
    return await handleRetrieveDomainList(blockedAddresses, startIndex);
  };

  const handleRetrieveDomainList = async (
    list: string[],
    startIndex?: number | string,
  ) => {
    const pageSize = 10;
    const retData: {domains: string[]; cursor?: number} = {
      domains: [],
      cursor: undefined,
    };

    // validate start index
    if (!startIndex) {
      startIndex = 0;
    }
    if (typeof startIndex !== 'number') {
      return retData;
    }

    // retrieve domain info for next page of addresses
    const domains = await Bluebird.map(
      list.slice(startIndex, startIndex + pageSize),
      async m => {
        const memberAddr = fromCaip10Address(m);
        if (!memberAddr) {
          return '';
        }
        const addressData = await getAddressMetadata(memberAddr);
        return addressData?.name || memberAddr;
      },
      {concurrency: 3},
    );

    // return the member data
    retData.domains = domains;
    retData.cursor = startIndex + pageSize;
    return retData;
  };

  const handleMoreInfo = () => {
    if (authDomain) {
      window.open(
        `${config.UD_ME_BASE_URL}/${authDomain}?openBadgeCode=${badge.code}`,
        '_blank',
      );
    }
  };

  const handleBlockSender = async (
    blockCaip10?: string,
    unblockCaip10?: string,
  ) => {
    const blockedAddress = fromCaip10Address(blockCaip10);
    const unblockedAddress = fromCaip10Address(unblockCaip10);
    if (blockedAddress || unblockedAddress) {
      setBlockedAddresses(
        (
          await updateBlockedList(
            address,
            pushKey,
            blockedAddress ? [blockedAddress] : [],
            unblockedAddress ? [unblockedAddress] : [],
          )
        ).map(a => a.toLowerCase()),
      );
    }
  };

  const renderedPushMessages = pushMessages
    // filter duplicates
    .filter(
      (message, index) =>
        message.messageType &&
        pushMessages.findIndex(item => item.timestamp === message.timestamp) ===
          index,
    )
    // render conversation bubbles
    .map(message => (
      <CommunityConversationBubble
        key={message.link}
        address={address}
        message={message}
        pushKey={pushKey}
        blocked={blockedAddresses
          .map(a => a.toLowerCase())
          .includes(fromCaip10Address(message.fromCAIP10)?.toLowerCase() || '')}
        onBlockUser={async () => await handleBlockSender(message.fromCAIP10)}
        onUnblockUser={async () =>
          await handleBlockSender(undefined, message.fromCAIP10)
        }
        emojiReactions={emojiReactions}
        setEmojiReactions={setEmojiReactions}
        renderCallback={
          message.timestamp! >= pushMessages[0].timestamp!
            ? handleOnRenderAndScroll
            : handleOnRender
        }
      />
    ));

  return (
    <Card
      style={{border: 'none', boxShadow: 'none'}}
      className={classes.cardContainer}
      variant="outlined"
    >
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
              <Tooltip title={t('push.moreGroupInfo')}>
                <InfoOutlinedIcon
                  className={classes.headerCloseIcon}
                  onClick={handleMoreInfo}
                />
              </Tooltip>
            )}
            <Tooltip title={t('common.options')}>
              <IconButton
                disabled={!isMember}
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
                  handleGroupList();
                }}
              >
                <ListItemIcon>
                  <GroupsIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2">
                  {t('push.memberCount', {
                    count: groupInfo?.members.length || 0,
                  })}
                </Typography>
              </MenuItem>
              {blockedAddresses.length > 0 && (
                <MenuItem
                  onClick={() => {
                    handleBlockedList();
                  }}
                >
                  <ListItemIcon>
                    <BlockIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="body2">
                    {t('push.blockCount', {
                      count: blockedAddresses.length,
                    })}
                  </Typography>
                </MenuItem>
              )}
              <MenuItem
                onClick={() => {
                  handleShareInvite();
                }}
              >
                <ListItemIcon>
                  <ShareOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2">
                  {t('push.shareInviteLink')}
                </Typography>
              </MenuItem>
              <MenuItem
                onClick={async () => {
                  await handleLeaveChat();
                  handleCloseMenu();
                  onBack();
                }}
              >
                <ListItemIcon>
                  {isLeaving ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <LogoutIcon fontSize="small" />
                  )}
                </ListItemIcon>
                <Typography variant="body2">{t('push.leave')}</Typography>
              </MenuItem>
            </Menu>
          </Box>
        }
      />
      <CardContent>
        <Box className={classes.conversationContainer} id="scrollable-div">
          {!isMember ? (
            <CallToAction
              icon="LockOutlinedIcon"
              title={t('push.noGroupAccess')}
              subTitle={t('push.noGroupAccessDescription')}
              buttonText={t('push.noGroupAccessButton')}
              handleButtonClick={onBack}
              loading={isLoading}
            />
          ) : (
            !isViewableMessage && (
              <CallToAction
                icon="ForumOutlinedIcon"
                title={t('push.joinedGroupChat')}
                subTitle={t('push.joinedGroupChatDescription')}
                loading={isLoading}
              />
            )
          )}
          {isMember && badge.groupChatId && (
            <InfiniteScroll
              inverse={true}
              style={{
                display: isViewableMessage ? 'flex' : 'none',
                flexDirection: 'column-reverse',
              }}
              className={classes.infiniteScroll}
              scrollableTarget="scrollable-div"
              hasMore={hasMoreMessages}
              next={loadPreviousPage}
              dataLength={renderedPushMessages.length}
              loader={
                <Box className={classes.infiniteScrollLoading}>
                  <CircularProgress className={classes.loadingSpinner} />
                </Box>
              }
              scrollThreshold={0.9}
            >
              {renderedPushMessages}
            </InfiniteScroll>
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
      {isViewingMemberList && (
        <DomainListModal
          id="groupMembers"
          title={t('push.memberCount', {count: groupInfo?.members.length || 0})}
          subtitle={t('push.memberCountDescription', {name: badge.name})}
          open={isViewingMemberList}
          onClose={() => setIsViewingMemberList(false)}
          onClick={(domain: string) =>
            window.open(`${config.UD_ME_BASE_URL}/${domain}`, '_blank')
          }
          retrieveDomains={handleRetrieveMembers}
          setWeb3Deps={setWeb3Deps}
        />
      )}
      {isViewingBlockedList && (
        <DomainListModal
          id="blockedMembers"
          title={t('push.blockCount', {count: blockedAddresses.length})}
          subtitle={t('push.clickToUnblock')}
          open={isViewingBlockedList}
          onClose={() => setIsViewingBlockedList(false)}
          onClick={handleUnblockDomain}
          retrieveDomains={handleRetrieveBlocked}
        />
      )}
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
