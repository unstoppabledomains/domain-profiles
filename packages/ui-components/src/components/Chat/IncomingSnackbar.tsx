import {alpha} from '@mui/material/';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {SnackbarContent} from 'notistack';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {notifyError} from '../../lib/error';
import useTranslationContext from '../../lib/i18n';
import {useIsTabActive} from './hooks/useIsTabActive';
import {getAddressMetadata} from './protocol/resolution';

const useStyles = makeStyles<{variant: SnackbarVariant}>()(
  (theme: Theme, {variant}) => ({
    container: {
      display: 'flex',
      backgroundColor: alpha(
        variant === 'chat'
          ? theme.palette.secondary.main
          : theme.palette.primary.main,
        0.35,
      ),
      backdropFilter: 'blur(15px)',
      padding: theme.spacing(1),
      alignItems: 'center',
      cursor: 'pointer',
      minWidth: 300,
      [theme.breakpoints.down('sm')]: {
        width: '100%',
      },
    },
    avatar: {
      marginRight: theme.spacing(1),
      color: theme.palette.primary.main,
      backgroundColor: 'white',
      border: '2px solid white',
      width: 50,
      height: 50,
    },
    message: {
      marginRight: theme.spacing(1),
    },
  }),
);

type SnackbarVariant = 'notification' | 'chat';

interface IncomingSnackbarProps {
  id: string;
  title?: string;
  message?: string;
  imageUrl?: string;
  variant: SnackbarVariant;
  onClick: (id?: string) => void;
}

interface IncomingChatSnackbarProps {
  id: string;
  address?: string;
  onClick: (id?: string) => void;
}

export const IncomingChatSnackbar = React.forwardRef<
  HTMLDivElement,
  IncomingChatSnackbarProps
>((props, ref) => {
  const {id, address, onClick, ...other} = props;
  const [t] = useTranslationContext();
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [domain, setDomain] = useState<string>();
  const [senderAddress, setSenderAddress] = useState<string>();

  useEffect(() => {
    if (!address) {
      return;
    }
    const loadReverse = async () => {
      const reverseAddress = address.replace('eip155:', '');
      try {
        const addressMetadata = await getAddressMetadata(reverseAddress);
        if (addressMetadata?.name) {
          setDomain(addressMetadata.name);
          setAvatarUrl(addressMetadata.avatarUrl);
        }
      } catch (e) {
        notifyError(e, {msg: 'error looking up reverse resolution'});
      }
      setSenderAddress(reverseAddress);
    };
    void loadReverse();
  }, [address]);

  return (
    <SnackbarContent ref={ref} role="alert" {...other}>
      {senderAddress && (
        <IncomingSnackbar
          id={id}
          variant="chat"
          title={domain || senderAddress}
          message={
            domain ? t('push.incomingDomain', {domain}) : t('push.incoming')
          }
          imageUrl={avatarUrl}
          onClick={() => onClick(senderAddress)}
        />
      )}
    </SnackbarContent>
  );
});

export const IncomingSnackbar = React.forwardRef<
  HTMLDivElement,
  IncomingSnackbarProps
>((props, ref) => {
  const {id, title, imageUrl, message, variant, onClick, ...other} = props;
  const {classes} = useStyles({variant});
  const isTabActive = useIsTabActive();

  useEffect(() => {
    if (isTabActive) {
      return;
    }
    if ('Notification' in window) {
      if (Notification.permission === 'granted' && title) {
        const browserNotification = new Notification(title, {
          body: message,
          icon: imageUrl,
        });
        browserNotification.onclick = () => onClick(id);
      }
    }
  }, []);

  return (
    <SnackbarContent ref={ref} role="alert" {...other}>
      <Paper className={classes.container} onClick={() => onClick()}>
        <Avatar src={imageUrl} className={classes.avatar} />
        <div className={classes.message}>
          <Typography variant="subtitle2">{title}</Typography>
          <Typography variant="caption">{message}</Typography>
        </div>
      </Paper>
    </SnackbarContent>
  );
});
