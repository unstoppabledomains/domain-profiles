/* eslint-disable @typescript-eslint/no-explicit-any */
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import type {PayloadData} from '../../types';

const useStyles = makeStyles()((theme: Theme) => ({
  notificationContainer: {
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(0),
  },
  notificationClick: {
    display: 'flex',
    cursor: 'pointer',
  },
  notificationIcon: {
    cursor: 'pointer',
    width: '20px',
    height: '20px',
  },
  notificationCtaImg: {
    width: '75px',
    height: '75px',
    marginRight: theme.spacing(1),
  },
}));

export type NotificationPreviewProps = {
  notification: PayloadData;
  searchTerm?: string;
};

export const NotificationPreview: React.FC<NotificationPreviewProps> = ({
  notification,
  searchTerm,
}) => {
  const {classes} = useStyles();

  const isSearchTermMatch = (): boolean => {
    if (!searchTerm) {
      return true;
    }
    const searchParams = [
      notification.asub,
      notification.amsg,
      notification.app,
    ];
    for (const param of searchParams) {
      if (param.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }
    }
    return false;
  };

  return isSearchTermMatch() ? (
    <Card className={classes.notificationContainer} elevation={0}>
      <CardHeader
        title={
          <Typography
            className={classes.notificationClick}
            onClick={() => (window.location.href = notification.url)}
            variant="subtitle2"
          >
            {notification.app}
          </Typography>
        }
        avatar={
          <Avatar
            className={classes.notificationIcon}
            src={notification.icon}
            onClick={() => (window.location.href = notification.url)}
          />
        }
        action={
          <LaunchOutlinedIcon
            className={classes.notificationIcon}
            onClick={() => (window.location.href = notification.acta)}
          />
        }
      />
      <CardContent
        className={classes.notificationClick}
        onClick={() => (window.location.href = notification.acta)}
      >
        {notification.aimg && (
          <Box>
            <img
              src={notification.aimg}
              className={classes.notificationCtaImg}
              onError={e => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
              }}
            />
          </Box>
        )}
        <Box>
          <Typography variant="h6">{notification.asub}</Typography>
          <Typography variant="body2">
            {notification.amsg
              .split('\n')
              .map((item, index) =>
                index === 0 ? item : [<br key={index} />, item],
              )}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  ) : null;
};

export default NotificationPreview;
