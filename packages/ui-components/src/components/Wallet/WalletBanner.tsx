import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {darken} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles<{
  backgroundColor?: string;
  textColor?: string;
}>()((theme: Theme, {backgroundColor, textColor}) => {
  return {
    container: {
      alignItems: 'center',
      borderRadius: theme.shape.borderRadius,
      display: 'flex',
      justifyContent: 'space-between',
      paddingLeft: theme.spacing(1.5),
      width: '100%',
      backgroundColor,
      background: backgroundColor ? undefined : theme.palette.heroText,
      color: textColor
        ? textColor
        : backgroundColor
        ? theme.palette.getContrastText(backgroundColor)
        : theme.palette.getContrastText(
            darken(theme.palette.primary.main, 0.85),
          ),
    },
    icon: {
      display: 'flex',
      alignItems: 'center',
      marginRight: theme.spacing(1),
    },
    action: {
      display: 'flex',
      alignItems: 'center',
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
    content: {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },
  };
});

interface WalletBannerProps {
  children: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
}

export const WalletBanner: React.FC<WalletBannerProps> = ({
  children,
  action,
  icon,
  backgroundColor,
  textColor,
}) => {
  const {classes} = useStyles({backgroundColor, textColor});

  return (
    <Box className={classes.container}>
      {icon && <Box className={classes.icon}>{icon}</Box>}
      <Box className={classes.content}>
        <Typography variant="body2">{children}</Typography>
      </Box>
      {action && <Box className={classes.action}>{action}</Box>}
    </Box>
  );
};
