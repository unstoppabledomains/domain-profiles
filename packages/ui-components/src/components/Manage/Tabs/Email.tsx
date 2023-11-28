import Box from '@mui/material/Box';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../../lib';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    margin: theme.spacing(1),
  },
}));

export const Email: React.FC<EmailProps> = ({domain}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  return <Box className={classes.container}>{t('manage.email')}</Box>;
};

export type EmailProps = {
  domain: string;
};
