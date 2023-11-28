import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../../lib';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(1),
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    justifyItems: 'center',
  },
  title: {
    marginTop: theme.spacing(2),
    color: theme.palette.neutralShades[400],
  },
  icon: {
    color: theme.palette.neutralShades[400],
    width: '100px',
    height: '100px',
  },
}));

export const Crypto: React.FC<CryptoProps> = ({domain}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  return (
    <Box className={classes.container}>
      <MonetizationOnOutlinedIcon className={classes.icon} />
      <Typography variant="h5" className={classes.title}>
        {t('manage.comingSoon')}
      </Typography>
    </Box>
  );
};

export type CryptoProps = {
  domain: string;
};
