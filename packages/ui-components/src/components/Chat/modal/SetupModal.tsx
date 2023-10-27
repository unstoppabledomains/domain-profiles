/* eslint-disable @typescript-eslint/no-explicit-any */
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStationOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import SettingsSuggestOutlinedIcon from '@mui/icons-material/SettingsSuggestOutlined';
import SyncIcon from '@mui/icons-material/Sync';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import Link from '../../../components/Link';
import useTranslationContext from '../../../lib/i18n';
import {ConfigurationState} from '../types';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    margin: 'auto',
    verticalAlign: 'center',
    maxWidth: '500px',
  },
  link: {
    fontSize: '13px',
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    width: '400px',
    [theme.breakpoints.down('sm')]: {
      width: '300px',
    },
  },
  headerImage: {
    marginBottom: theme.spacing(1),
    width: '300px',
  },
  contentContainer: {
    height: '250px',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(4),
    alignContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(-3),
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  divider: {
    marginTop: theme.spacing(3),
  },
  infoContainer: {
    display: 'flex',
    verticalAlign: 'center',
    alignContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing(3),
  },
  infoTitle: {
    color: theme.palette.neutralShades[800],
    fontSize: '16px',
    marginBottom: theme.spacing(0.25),
  },
  infoBody: {
    color: theme.palette.neutralShades[500],
  },
  icon: {
    color: theme.palette.neutralShades[800],
    marginRight: theme.spacing(2),
    width: '35px',
    height: '35px',
  },
  successText: {
    textAlign: 'center',
    marginBottom: theme.spacing(2),
  },
  successIcon: {
    color: theme.palette.success.main,
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(1),
    width: '65px',
    height: '65px',
  },
  errorIcon: {
    color: theme.palette.error.main,
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(1),
    width: '65px',
    height: '65px',
  },
  bold: {
    color: theme.palette.neutralShades[600],
    fontWeight: 600,
  },
}));

export const SetupModal: React.FC<SetupModalProps> = ({
  onClose,
  onChat,
  onConfirm,
  disabled,
  open,
  domain,
  configState,
  isNewUser,
  isNewNotification,
}) => {
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();

  const handleOpenChat = () => {
    onClose();
    onChat();
  };

  const onChoosePrimary = () => {
    window.location.href = `${config.UNSTOPPABLE_WEBSITE_URL}/domains`;
  };

  return (
    <Dialog className={classes.container} open={open} onClose={() => onClose()}>
      <DialogContent>
        <Box className={classes.headerContainer}>
          <img
            className={classes.headerImage}
            src="https://storage.googleapis.com/unstoppable-client-assets/images/manage/ud-messaging-banner.png"
          />
          <Typography variant="h5" className={classes.infoBody}>
            {domain}
          </Typography>
          <Typography variant="h5">{t('push.setup.title')}</Typography>
        </Box>
        <Divider className={classes.divider} />
        <Box className={classes.contentContainer}>
          {configState === ConfigurationState.Initial ? (
            <>
              <Box className={classes.infoContainer}>
                <LockIcon className={classes.icon} />
                <Box>
                  <Typography variant="subtitle2" className={classes.infoTitle}>
                    {t('push.setup.isPushSecure')}
                  </Typography>
                  <Typography variant="body2" className={classes.infoBody}>
                    {t('push.setup.isPushSecureDescription')}{' '}
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.infoContainer}>
                <LocalGasStationIcon className={classes.icon} />
                <Box>
                  <Typography variant="subtitle2" className={classes.infoTitle}>
                    {t('push.setup.isGasRequired')}
                  </Typography>
                  <Typography variant="body2" className={classes.infoBody}>
                    {t('push.setup.isGasRequiredDescription')}{' '}
                  </Typography>
                </Box>
              </Box>
              <Box className={classes.infoContainer}>
                <SyncIcon className={classes.icon} />
                <Box>
                  <Typography variant="subtitle2" className={classes.infoTitle}>
                    {t('push.setup.isItPortable')}
                  </Typography>
                  <Typography variant="body2" className={classes.infoBody}>
                    {t('push.setup.isItPortableDescription')}{' '}
                  </Typography>
                </Box>
              </Box>
            </>
          ) : configState === ConfigurationState.RegisterXmtp ? (
            <Box className={classes.infoContainer}>
              <ForumOutlinedIcon className={classes.icon} />
              <Box>
                <Typography variant="subtitle2" className={classes.infoTitle}>
                  {t('push.setup.chat')}
                </Typography>
                <Typography variant="body2" className={classes.infoBody}>
                  {t('push.setup.chatDescription')}{' '}
                </Typography>
              </Box>
            </Box>
          ) : configState === ConfigurationState.RegisterPush ? (
            <Box className={classes.infoContainer}>
              <NotificationsActiveOutlinedIcon className={classes.icon} />
              <Box>
                <Typography variant="subtitle2" className={classes.infoTitle}>
                  {t('push.setup.notifications')}
                </Typography>
                <Typography variant="body2" className={classes.infoBody}>
                  {t('push.setup.notificationsDescription')}{' '}
                </Typography>
              </Box>
            </Box>
          ) : (
            configState === ConfigurationState.QuerySubscriptions && (
              <Box className={classes.infoContainer}>
                <SettingsSuggestOutlinedIcon className={classes.icon} />
                <Box>
                  <Typography variant="subtitle2" className={classes.infoTitle}>
                    {t('push.setup.subscriptions')}
                  </Typography>
                  <Typography variant="body2" className={classes.infoBody}>
                    {t('push.setup.subscriptionsDescription')}{' '}
                  </Typography>
                </Box>
              </Box>
            )
          )}
          {disabled &&
            configState !== ConfigurationState.Complete &&
            configState !== ConfigurationState.Error && (
              <Box className={classes.loadingContainer}>
                <CircularProgress size="50px" />
              </Box>
            )}
          {configState === ConfigurationState.Complete && (
            <Box className={classes.loadingContainer}>
              <CheckCircleOutlineOutlinedIcon className={classes.successIcon} />
              <Typography variant="subtitle2" className={classes.infoTitle}>
                {t('push.setup.success')}
              </Typography>
              <Typography
                variant="body2"
                className={cx(classes.infoBody, classes.successText)}
              >
                {t('push.setup.successDescription')}
              </Typography>
            </Box>
          )}
          {configState === ConfigurationState.Error && (
            <Box className={classes.loadingContainer}>
              <ErrorOutlineIcon className={classes.errorIcon} />
              <Typography variant="subtitle2" className={classes.infoTitle}>
                {t('push.setup.error')}
              </Typography>
              <Typography
                variant="body2"
                className={cx(classes.infoBody, classes.successText)}
              >
                {t('push.setup.errorDescription')}
              </Typography>
            </Box>
          )}
        </Box>
        <Box className={classes.buttonContainer}>
          {configState === ConfigurationState.Complete ? (
            <Button
              fullWidth
              color={'primary'}
              variant={'contained'}
              onClick={handleOpenChat}
              data-testid={`chat-onboard-modal-view`}
              id="chat-onboard-modal-view"
              sx={{marginBottom: '10px'}}
            >
              {t('push.setup.openMessaging')}
            </Button>
          ) : domain ? (
            <Tooltip
              arrow
              placement="top"
              hidden={disabled}
              title={
                isNewUser
                  ? t('push.setup.newUserDescription', {domain})
                  : isNewNotification
                  ? t('push.setup.existingUserNeedsNotifications', {domain})
                  : t('push.setup.existingUserDescription', {domain})
              }
            >
              <Button
                fullWidth
                color={'primary'}
                variant={'contained'}
                onClick={() => onConfirm()}
                disabled={disabled}
                data-testid={`chat-onboard-modal-save`}
                id="chat-onboard-modal-save"
                sx={{marginBottom: '10px'}}
              >
                {t('push.setup.signAndEnable')}
              </Button>
            </Tooltip>
          ) : (
            <Tooltip
              arrow
              placement="top"
              hidden={disabled}
              title={t('push.noPrimaryDomain')}
            >
              <Button
                fullWidth
                color={'primary'}
                variant={'contained'}
                onClick={() => onChoosePrimary()}
                disabled={disabled}
                data-testid={`chat-onboard-modal-choose-reverse`}
                id="chat-onboard-modal-choose-reverse"
                sx={{marginBottom: '10px'}}
              >
                {t('push.setup.choosePrimaryDomain')}
              </Button>
            </Tooltip>
          )}
          <Typography variant="subtitle2" className={classes.infoBody}>
            {t('push.setup.poweredBy')}{' '}
            <Link
              href="https://push.org"
              className={classes.link}
              external={true}
            >
              Push Protocol
            </Link>
            {' & '}
            <Link
              href="https://xmtp.org"
              className={classes.link}
              external={true}
            >
              XMTP
            </Link>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export type SetupModalProps = {
  open: boolean;
  domain?: string;
  isNewUser: boolean;
  isNewNotification: boolean;
  disabled: boolean;
  configState: ConfigurationState;
  onClose(): void;
  onChat(): void;
  onConfirm(): void;
};

export default SetupModal;
