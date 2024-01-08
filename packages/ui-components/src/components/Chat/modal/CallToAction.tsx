import BlockIcon from '@mui/icons-material/Block';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GroupsIcon from '@mui/icons-material/Groups';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(5),
    color: theme.palette.neutralShades[400],
  },
  emptyIcon: {
    width: 100,
    height: 100,
  },
  emptyButton: {
    marginTop: theme.spacing(2),
  },
}));

export const CallToAction: React.FC<CallToActionProps> = ({
  icon,
  title,
  subTitle,
  buttonText,
  handleButtonClick,
}) => {
  const {classes} = useStyles();

  return (
    <Box className={classes.emptyContainer}>
      {icon === 'CloudOffIcon' ? (
        <CloudOffIcon className={classes.emptyIcon} />
      ) : icon === 'BlockIcon' ? (
        <BlockIcon className={classes.emptyIcon} />
      ) : icon === 'GroupsIcon' ? (
        <GroupsIcon className={classes.emptyIcon} />
      ) : icon === 'ForumOutlinedIcon' ? (
        <ForumOutlinedIcon className={classes.emptyIcon} />
      ) : icon === 'EmojiEventsOutlinedIcon' ? (
        <EmojiEventsOutlinedIcon className={classes.emptyIcon} />
      ) : (
        icon === 'NotificationsActiveOutlinedIcon' && (
          <NotificationsActiveOutlinedIcon className={classes.emptyIcon} />
        )
      )}
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2">{subTitle}</Typography>
      {buttonText && handleButtonClick && (
        <Button
          variant="contained"
          onClick={handleButtonClick}
          className={classes.emptyButton}
        >
          {buttonText}
        </Button>
      )}
    </Box>
  );
};

export type CallToActionProps = {
  icon:
    | 'BlockIcon'
    | 'CloudOffIcon'
    | 'ForumOutlinedIcon'
    | 'EmojiEventsOutlinedIcon'
    | 'GroupsIcon'
    | 'NotificationsActiveOutlinedIcon';
  title: string;
  subTitle?: React.ReactNode;
  buttonText?: string;
  handleButtonClick?: () => void;
};

export default CallToAction;
