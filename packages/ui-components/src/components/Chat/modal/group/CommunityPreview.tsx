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
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import type {IMessageIPFS} from '@pushprotocol/restapi';
import moment from 'moment';
import numeral from 'numeral';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getReverseResolution} from '../../../../actions';
import {getBadge} from '../../../../actions/badgeActions';
import {joinBadgeGroupChat} from '../../../../actions/messageActions';
import LearnMoreUdBlue from '../../../../components/LearnMoreUdBlue';
import {notifyError} from '../../../../lib/error';
import useTranslationContext from '../../../../lib/i18n';
import type {
  SerializedBadgeInfo,
  SerializedCryptoWalletBadge,
} from '../../../../lib/types/badge';
import {
  PUSH_DECRYPT_ERROR_MESSAGE,
  acceptGroupInvite,
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
    backgroundImage: `linear-gradient(${theme.palette.neutralShades[100]}, ${theme.palette.neutralShades[200]})`,
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
    margin: theme.spacing(1),
  },
  actionButton: {
    marginRight: theme.spacing(1),
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
}));

const maxDescriptionLength = 125;

export const CommunityPreview: React.FC<CommunityPreviewProps> = ({
  address,
  badge,
  inGroup,
  isUdBlue,
  pushKey,
  onReload,
  onRefresh,
  searchTerm,
  setActiveCommunity,
}) => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();
  const [latestMessage, setLatestMessage] = useState<string>();
  const [latestTimestamp, setLatestTimestamp] = useState<string>();
  const [joining, setJoining] = useState<boolean>();
  const [leaving, setLeaving] = useState<boolean>();
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

  const loadBadge = async () => {
    setBadgeInfo(await getBadge(badge.code));
  };

  const loadLatest = async () => {
    if (inGroup && badge.groupChatId) {
      // latest state already retrieved
      if (badge.groupChatTimestamp) {
        setLatestTimestamp(moment(badge.groupChatTimestamp).fromNow());
        setLatestMessage(badge.groupChatLatestMessage);
        return;
      }

      // retrieve latest state since it is missing
      const msgData = await getLatestMessage(
        badge.groupChatId,
        address,
        pushKey,
      );
      if (msgData && msgData.length > 0 && msgData[0].timestamp) {
        const msgBody = renderMessagePreview(msgData[0]);
        const fromUser = fromCaip10Address(msgData[0].fromCAIP10);
        if (fromUser && msgBody) {
          const fromDomain =
            fromUser.toLowerCase() === address.toLowerCase()
              ? t('common.you')
              : (await getReverseResolution(fromUser)) || fromUser;
          setLatestTimestamp(moment(msgData[0].timestamp).fromNow());
          setLatestMessage(`${fromDomain}: ${msgBody}`);

          // set group chat state
          badge.groupChatTimestamp = msgData[0].timestamp;
          badge.groupChatLatestMessage = msgBody;
          await onRefresh();
        }
      } else {
        setLatestMessage(t('push.noGroupMessages'));
      }
    }
  };

  const renderMessagePreview = (message: IMessageIPFS) => {
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
      messageToRender.toLowerCase() === PUSH_DECRYPT_ERROR_MESSAGE.toLowerCase()
    ) {
      return;
    }

    return messageToRender;
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
      setJoining(true);
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
          await acceptGroupInvite(groupChatInfo.groupChatId, address, pushKey);
        }
        badge.groupChatId = groupChatInfo?.groupChatId;
      }
      setActiveCommunity(badge);
    } catch (e) {
      // unable to join group
      notifyError(e, {msg: 'error joining group'});
      setErrorMsg(t('push.joinCommunityError'));
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveClicked = async () => {
    if (!badge.groupChatId) {
      return;
    }
    setLeaving(true);
    try {
      await joinBadgeGroupChat(badge.code, address, pushKey, true);
      await onReload();
    } catch (e) {
      notifyError(e, {msg: 'error leaving group'});
      setErrorMsg(t('push.leaveCommunityError'));
    } finally {
      setLeaving(false);
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
              <Typography
                className={classes.communityTitle}
                variant="subtitle2"
              >
                {badge.name}
              </Typography>
              {inGroup && latestMessage ? (
                <Typography variant="caption" className={classes.latestMessage}>
                  {latestMessage}
                </Typography>
              ) : !inGroup && badgeInfo ? (
                <Typography variant="caption">
                  {numeral(badgeInfo.usage.holders).format('0a')}{' '}
                  {t('badges.holder')}
                </Typography>
              ) : (
                <Skeleton variant="text" sx={{maxWidth: '75px'}} />
              )}
            </Box>
          }
          avatar={
            inGroup ? (
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
              <Avatar
                onClick={handleMoreInfoClicked}
                className={classes.communityIcon}
                src={badge.logo}
              />
            )
          }
          action={
            latestTimestamp && (
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
                  loading={joining}
                  size="small"
                  variant="contained"
                  className={classes.actionButton}
                >
                  {inGroup ? t('push.chat') : t('push.join')}
                </LoadingButton>
                {inGroup && (
                  <LoadingButton
                    onClick={handleLeaveClicked}
                    loading={leaving}
                    size="small"
                    variant="text"
                    className={classes.actionButton}
                  >
                    {t('push.leave')}
                  </LoadingButton>
                )}
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
  onReload: () => Promise<void>;
  onRefresh: () => Promise<void>;
  setActiveCommunity: (v: SerializedCryptoWalletBadge) => void;
};

export default CommunityPreview;
