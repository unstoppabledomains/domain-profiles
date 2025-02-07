import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {darken, lighten} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles<{backgroundColor?: string}>()((
  theme: Theme,
  {backgroundColor},
) => {
  const baseColor = backgroundColor
    ? backgroundColor
    : theme.palette.mode === 'light'
    ? theme.palette.primaryShades[100]
    : theme.palette.background.default;
  return {
    container: {
      alignItems: 'center',
      borderRadius: theme.shape.borderRadius,
      display: 'flex',
      justifyContent: 'space-between',
      paddingLeft: theme.spacing(1.5),
      width: '100%',
      border: backgroundColor ? `1px solid ${baseColor}` : undefined,
      background: backgroundColor
        ? `linear-gradient(45deg, ${baseColor}, ${lighten(
            baseColor,
            theme.palette.mode === 'light' ? 0.85 : 0.05,
          )})`
        : theme.palette.heroText,
      color: backgroundColor
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
}

export const WalletBanner: React.FC<WalletBannerProps> = ({
  children,
  action,
  icon,
  backgroundColor,
}) => {
  const {classes} = useStyles({backgroundColor});

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
