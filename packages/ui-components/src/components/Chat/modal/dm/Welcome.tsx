import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import useTranslationContext from '../../../../lib/i18n';

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
}));

export const Welcome: React.FC<WelcomeProps> = ({address, requestCount}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  return (
    <Box className={classes.emptyContainer}>
      <ForumOutlinedIcon className={classes.emptyIcon} />
      <Typography variant="h6">
        {requestCount === 0 ? t('push.chatNew') : t('push.chatNewRequest')}
      </Typography>
      <Typography variant="body2">
        {requestCount === 0
          ? t('push.chatNewDescription')
          : t('push.chatNewRequestDescription')}
      </Typography>
    </Box>
  );
};

export type WelcomeProps = {
  address: string;
  requestCount: number;
};

export default Welcome;
