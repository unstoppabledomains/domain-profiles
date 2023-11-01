/* eslint-disable @typescript-eslint/no-explicit-any */
import CloseIcon from '@mui/icons-material/Close';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useFeatureFlags} from '../../actions/featureFlagActions';
import useTranslationContext from '../../lib/i18n';

const useStyles = makeStyles()((theme: Theme) => ({
  supportBubbleContainer: {
    position: 'fixed',
    bottom: '15px',
    right: '10px',
    margin: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  supportButton: {
    border: '1px solid',
    boxShadow: theme.shadows[6],
    borderColor: theme.palette.neutralShades[200],
    backgroundColor: theme.palette.white,
    '&:hover': {
      backgroundColor: theme.palette.white,
    },
  },
  supportIcon: {
    width: 40,
    height: 40,
  },
  closeIcon: {
    width: 11,
    height: 11,
    margin: theme.spacing(0),
    padding: theme.spacing(0),
    color: theme.palette.neutralShades[600],
  },
  supportClose: {
    cursor: 'pointer',
  },
}));

const useOutsideClick = (callback: () => void) => {
  const ref = React.useRef();

  React.useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      callback();
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return ref;
};

export const SupportBubble: React.FC<SupportBubbleProps> = ({
  open,
  setActiveChat,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const {data: featureFlags} = useFeatureFlags();
  const [active, setActive] = useState(false);
  const [clickedClose, setClickedClose] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);

  // sets a timestamp every time the page is clicked
  useOutsideClick(() => setLastClickTime(Date.now()));

  // sets a countdown timer based on click inactivity to display the support
  // bubble after a certain amount of time has passed
  useEffect(() => {
    if (!open) {
      setActive(false);
      return;
    }
    if (active || clickedClose) {
      return;
    }

    // start the timer since last page click
    const interval = setInterval(() => {
      setActive(true);
    }, config.XMTP.SUPPORT_BUBBLE_SECONDS * 1000);

    // reset the timer
    return () => {
      clearInterval(interval);
    };
  }, [open, lastClickTime]);

  // handleSupportChat opens the support chat window
  const handleSupportChat = () => {
    setActiveChat(config.XMTP.SUPPORT_WALLET_ADDRESS);
  };

  const handleSupportClose = () => {
    setActive(false);
    setClickedClose(true);
  };

  return featureFlags.variations
    ?.ecommerceServiceUsersEnableChatSupportBubble &&
    !clickedClose &&
    active ? (
    <Box className={classes.supportBubbleContainer}>
      <Badge
        badgeContent={
          <CloseIcon
            id="chat-support-close-icon"
            className={classes.closeIcon}
          />
        }
        id="chat-support-close"
        color="secondary"
        overlap="circular"
        onClick={handleSupportClose}
        className={classes.supportClose}
      >
        <IconButton
          size="large"
          onClick={handleSupportChat}
          className={classes.supportButton}
          id="chat-support"
        >
          <Tooltip arrow placement="left" title={t('push.chatSupport')}>
            <SupportAgentOutlinedIcon
              className={classes.supportIcon}
              id="chat-support-icon"
            />
          </Tooltip>
        </IconButton>
      </Badge>
    </Box>
  ) : null;
};

export type SupportBubbleProps = {
  open: boolean;
  setActiveChat: (v?: string) => void;
};

export default SupportBubble;
