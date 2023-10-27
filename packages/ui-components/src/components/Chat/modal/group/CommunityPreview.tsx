/* eslint-disable @typescript-eslint/no-explicit-any */
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import numeral from 'numeral';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getBadge} from '../../../../actions/badgeActions';
import {joinBadgeGroupChat} from '../../../../actions/messageActions';
import LearnMoreUdBlue from '../../../../components/LearnMoreUdBlue';
import useTranslationContext from '../../../../lib/i18n';
import type {
  SerializedBadgeInfo,
  SerializedCryptoWalletBadge,
} from '../../../../lib/types/badge';
import {acceptGroupInvite} from '../../protocol/push';

const useStyles = makeStyles()((theme: Theme) => ({
  communityContainer: {
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(0),
  },
  communityTitle: {
    display: 'flex',
  },
  communityIcon: {
    width: '45px',
    height: '45px',
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
}));

const maxDescriptionLength = 125;

export type CommunityPreviewProps = {
  address: string;
  badge: SerializedCryptoWalletBadge;
  inGroup: boolean;
  isUdBlue: boolean;
  pushKey: string;
  searchTerm?: string;
  onReload: () => Promise<void>;
  setActiveCommunity: (v: SerializedCryptoWalletBadge) => void;
};

export const CommunityPreview: React.FC<CommunityPreviewProps> = ({
  address,
  badge,
  inGroup,
  isUdBlue,
  pushKey,
  onReload,
  searchTerm,
  setActiveCommunity,
}) => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();
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
    void loadBadge();
  }, [badge]);

  const loadBadge = async () => {
    setBadgeInfo(await getBadge(badge.code));
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
      console.log('error joining group', e);
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
      console.log('error leaving group', e);
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
      <Card className={cx(classes.communityContainer)} elevation={0}>
        <CardHeader
          title={
            <Box>
              <Typography
                className={classes.communityTitle}
                variant="subtitle2"
              >
                {badge.name}
              </Typography>
              {badgeInfo ? (
                <Typography variant="caption">
                  {numeral(badgeInfo.usage.holders).format('0a')}{' '}
                  {t('badges.holder')}
                </Typography>
              ) : (
                <Skeleton variant="text" sx={{maxWidth: '75px'}} />
              )}
            </Box>
          }
          avatar={<Avatar className={classes.communityIcon} src={badge.logo} />}
          action={
            badge.linkUrl && (
              <LaunchOutlinedIcon
                className={classes.linkIcon}
                onClick={() => window.open(badge.linkUrl!, '_blank')}
              />
            )
          }
        />
        <CardContent className={classes.contentContainer}>
          {inGroup && (
            <Box className={classes.joinedText}>
              <CheckIcon className={classes.joinedIcon} />
              <Typography variant="body2">{t('push.joined')}</Typography>
            </Box>
          )}
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
      </Card>
      {udBlueModalOpen && (
        <LearnMoreUdBlue
          isOpen={udBlueModalOpen}
          handleClose={() => setUdBlueModalOpen(false)}
        />
      )}
    </>
  ) : null;
};

export default CommunityPreview;
