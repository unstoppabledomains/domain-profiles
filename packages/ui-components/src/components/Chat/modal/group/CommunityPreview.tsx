/* eslint-disable @typescript-eslint/no-explicit-any */
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LoadingButton from '@mui/lab/LoadingButton';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import type {GroupDTO, IMessageIPFS} from '@pushprotocol/restapi';
import moment from 'moment';
import numeral from 'numeral';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileReverseResolution} from '../../../../actions';
import {getBadge} from '../../../../actions/badgeActions';
import {joinBadgeGroupChat} from '../../../../actions/messageActions';
import LearnMoreUdBlue from '../../../../components/LearnMoreUdBlue';
import {notifyEvent} from '../../../../lib/error';
import useTranslationContext from '../../../../lib/i18n';
import type {
  SerializedBadgeInfo,
  SerializedCryptoWalletBadge,
} from '../../../../lib/types/badge';
import {
  MessageType,
  PUSH_DECRYPT_ERROR_MESSAGE,
  acceptGroupInvite,
  decryptMessage,
  getLatestMessage,
} from '../../protocol/push';
import {fromCaip10Address} from '../../types';

const useStyles = makeStyles()((theme: Theme) => ({
  communityContainer: {
    position: 'relative',
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(0.25),
    marginRight: theme.spacing(0.25),
  },
  communityGradient: {
    backgroundImage: `linear-gradient(225deg, ${theme.palette.white} 0%, ${theme.palette.blueGreyShades[100]} 100%)`,
  },
  communityTitle: {
    display: 'flex',
  },
  communityIcon: {
    width: '45px',
    height: '45px',
    cursor: 'pointer',
  },
  actionContainer: {
    display: 'flex',
    margin: theme.spacing(1),
    width: '100%',
  },
  actionButton: {
    marginRight: theme.spacing(1),
    width: '100%',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(-2),
    marginTop: theme.spacing(-1),
  },
  joinedIcon: {
    width: '15px',
    height: '15px',
  },
  joinedText: {
    color: theme.palette.success.main,
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  joinedBadgeIcon: {
    backgroundColor: theme.palette.white,
    color: theme.palette.white,
    fill: theme.palette.success.main,
    borderRadius: '50%',
  },
  linkIcon: {
    cursor: 'pointer',
    width: '20px',
    height: '20px',
  },
  errorIcon: {
    color: theme.palette.error.main,
    marginRight: theme.spacing(1),
  },
  errorText: {
    color: theme.palette.error.main,
  },
  clickable: {
    cursor: 'pointer',
  },
  hideBorder: {
    border: 'none',
    boxShadow: 'none',
    marginBottom: theme.spacing(0),
  },
  latestMessage: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  latestTimestamp: {
    color: theme.palette.neutralShades[400],
    whiteSpace: 'nowrap',
    marginTop: theme.spacing(1.5),
    position: 'absolute',
    top: 0,
    right: 0,
  },
  loadingText: {
    marginLeft: theme.spacing(1),
    whiteSpace: 'nowrap',
  },
}));

const maxDescriptionLength = 125;

export const CommunityPreview: React.FC<CommunityPreviewProps> = ({
  address,
  badge,
  inGroup,
  isUdBlue,
  pushKey,
  groupInfo,
  onRefresh,
  incomingMessage,
  searchTerm,
  setActiveCommunity,
  visible,
}) => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();
  const [latestMessage, setLatestMessage] = useState<string>();
  const [latestTimestamp, setLatestTimestamp] = useState<string>();
  const [joiningState, setJoiningState] = useState<string>();
  const [errorMsg, setErrorMsg] = useState<string>();
  const [badgeInfo, setBadgeInfo] = useState<SerializedBadgeInfo>();
  const [udBlueModalOpen, setUdBlueModalOpen] = useState(false);

  useEffect(() => {
    // only load once when badge is first defined
    if (!badge || badgeInfo) {
      return;
    }
    void Promise.all([loadBadge(), loadLatest()]);
  }, [badge]);

  useEffect(() => {
    if (!incomingMessage) {
      return;
    }
    if (badge.groupChatId !== incomingMessage.toDID) {
      return;
    }
    void loadLatest(incomingMessage);
  }, [incomingMessage]);

  const loadBadge = async () => {
    setBadgeInfo(await getBadge(badge.code));
  };

  const loadLatest = async (msg?: IMessageIPFS) => {
    if (inGroup && badge.groupChatId) {
      // latest state already retrieved
      if (badge.groupChatTimestamp && !msg) {
        setLatestTimestamp(moment(badge.groupChatTimestamp).fromNow());
        setLatestMessage(badge.groupChatLatestMessage);
        return;
      }

      try {
        // retrieve latest state since it is missing
        const msgData = msg
          ? await decryptMessage(address, pushKey, msg)
          : await getLatestMessage(badge.groupChatId, address, pushKey);
        if (msgData?.timestamp) {
          const msgBody = renderMessagePreview(msgData);
          const fromUser = fromCaip10Address(msgData.fromCAIP10);
          if (fromUser && msgBody) {
            const fromDomain =
              fromUser.toLowerCase() === address.toLowerCase()
                ? t('common.you')
                : (await getProfileReverseResolution(fromUser))?.name ||
                  fromUser;
            setLatestTimestamp(moment(msgData.timestamp).fromNow());
            setLatestMessage(
              msgData.messageType === MessageType.Meta
                ? msgBody
                : `${fromDomain}: ${msgBody}`,
            );

            // set group chat state
            badge.groupChatTimestamp = msgData.timestamp;
            badge.groupChatLatestMessage =
              msgData.messageType === MessageType.Meta
                ? msgBody
                : `${fromDomain}: ${msgBody}`;
            return;
          }
        }

        // latest message not available
        setLatestMessage(t('push.noGroupMessages'));
        badge.groupChatLatestMessage = t('push.noGroupMessages');
      } catch (e) {
        notifyEvent(e, 'error', 'MESSAGING', 'PushProtocol', {
          msg: 'error retrieving latest message',
        });
      } finally {
        // always callback after group lookup complete, regardless of the
        // success result. Tells the caller that rendering is complete.
        await onRefresh();
      }
    }
  };

  const renderMessagePreview = (message: IMessageIPFS) => {
    try {
      // parse the message
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
        return;
      }

      // display special preview for metadata events
      if (message.messageType === MessageType.Meta) {
        if (messageToRender.toLowerCase().includes('add')) {
          return t('push.userJoinedGroup');
        } else if (messageToRender.toLowerCase().includes('remove')) {
          return t('push.userLeftGroup');
        }
      } else if (message.messageType === MessageType.Media) {
        // special handling for attachments preview
        return t('push.attachment');
      }
      return messageToRender;
    } catch (e) {
      return undefined;
    }
  };

  const handleMoreInfoClicked = () => {
    if (badge.linkUrl) {
      window.open(badge.linkUrl!, '_blank');
    }
  };

  const handleChatClicked = async () => {
    // check UD blue status
    if (!isUdBlue) {
      setUdBlueModalOpen(true);
      return;
    }

    // retrieve group Chat ID from messaging API
    try {
      setJoiningState(t('push.joiningGroupState'));
      setErrorMsg(undefined);
      if (!inGroup) {
        const groupChatInfo = await joinBadgeGroupChat(
          badge.code,
          address,
          pushKey,
        );
        if (groupChatInfo?.groupChatId) {
          // accept the chat request for the user and change to the
          // group conversation panel
          setJoiningState(t('push.acceptingInviteState'));
          await acceptGroupInvite(groupChatInfo.groupChatId, address, pushKey);
        }
        badge.groupChatId = groupChatInfo?.groupChatId;
      }
      setActiveCommunity(badge);
    } catch (e) {
      // unable to join group
      notifyEvent(e, 'error', 'MESSAGING', 'PushProtocol', {
        msg: 'error joining group',
      });
      setErrorMsg(t('push.joinCommunityError'));
    } finally {
      setJoiningState(undefined);
    }
  };

  const isSearchTermMatch = (): boolean => {
    if (!searchTerm) {
      return true;
    }
    const searchParams = [badge.code, badge.name, badge.description];
    for (const param of searchParams) {
      if (param.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }
    }
    return false;
  };

  return isSearchTermMatch() ? (
    <>
      <Card
        className={cx(classes.communityContainer, {
          [classes.hideBorder]: inGroup,
          [classes.communityGradient]: !inGroup,
        })}
      >
        <CardHeader
          title={
            <Box className={classes.clickable} onClick={handleChatClicked}>
              {visible ? (
                <Typography
                  className={classes.communityTitle}
                  variant="subtitle2"
                >
                  {badge.name}
                </Typography>
              ) : (
                <Skeleton variant="text" sx={{maxWidth: '250px'}} />
              )}
              {visible && inGroup && latestMessage ? (
                <Typography variant="caption" className={classes.latestMessage}>
                  {latestMessage}
                </Typography>
              ) : !inGroup && badgeInfo ? (
                <Tooltip
                  title={
                    badgeInfo
                      ? t('badges.holderAndSubscriberCount', {
                          subscribed: numeral(
                            groupInfo ? groupInfo.members.length : 0,
                          ).format('0a'),
                        })
                      : ''
                  }
                >
                  <Typography variant="caption">
                    {t('badges.holders', {
                      holders: numeral(badgeInfo.usage.holders).format('0a'),
                    })}
                  </Typography>
                </Tooltip>
              ) : (
                <Skeleton variant="text" sx={{maxWidth: '75px'}} />
              )}
            </Box>
          }
          avatar={
            inGroup ? (
              visible ? (
                <Badge
                  anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                  overlap="circular"
                  badgeContent={
                    <CheckCircleIcon
                      fontSize="small"
                      className={classes.joinedBadgeIcon}
                    />
                  }
                >
                  <Avatar
                    onClick={handleMoreInfoClicked}
                    className={classes.communityIcon}
                    src={badge.logo}
                  />
                </Badge>
              ) : (
                <Skeleton
                  variant="circular"
                  className={classes.communityIcon}
                />
              )
            ) : (
              <Avatar
                onClick={handleMoreInfoClicked}
                className={classes.communityIcon}
                src={badge.logo}
              />
            )
          }
          action={
            latestTimestamp &&
            visible && (
              <Box className={classes.latestTimestamp}>
                <Typography variant="caption">{latestTimestamp}</Typography>
              </Box>
            )
          }
        />
        {!inGroup && (
          <Box>
            <CardContent className={classes.contentContainer}>
              <Typography variant="body2">
                {badge.description.length > maxDescriptionLength
                  ? `${badge.description.substring(0, maxDescriptionLength)}...`
                  : badge.description}
              </Typography>
            </CardContent>
            <CardActions>
              <Box className={classes.actionContainer}>
                <LoadingButton
                  onClick={handleChatClicked}
                  fullWidth={true}
                  loading={joiningState !== undefined}
                  loadingIndicator={
                    <Box display="flex" alignItems="center">
                      <CircularProgress size={16} color="inherit" />
                      <Typography
                        className={classes.loadingText}
                        variant="caption"
                      >
                        {joiningState}...
                      </Typography>
                    </Box>
                  }
                  size="small"
                  variant="contained"
                  className={classes.actionButton}
                >
                  {inGroup ? t('push.chat') : t('push.join')}
                </LoadingButton>
              </Box>
              {errorMsg && (
                <>
                  <ErrorIcon className={classes.errorIcon} />
                  <Typography variant="caption" className={classes.errorText}>
                    {errorMsg}
                  </Typography>
                </>
              )}
            </CardActions>
          </Box>
        )}
      </Card>
      {inGroup && <Divider variant="fullWidth" />}
      {udBlueModalOpen && (
        <LearnMoreUdBlue
          isOpen={udBlueModalOpen}
          handleClose={() => setUdBlueModalOpen(false)}
        />
      )}
    </>
  ) : null;
};

export type CommunityPreviewProps = {
  address: string;
  badge: SerializedCryptoWalletBadge;
  inGroup: boolean;
  isUdBlue: boolean;
  pushKey: string;
  searchTerm?: string;
  visible?: boolean;
  groupInfo?: GroupDTO;
  incomingMessage?: IMessageIPFS;
  onReload: () => Promise<void>;
  onRefresh: () => Promise<void>;
  setActiveCommunity: (v: SerializedCryptoWalletBadge) => void;
};

export default CommunityPreview;
