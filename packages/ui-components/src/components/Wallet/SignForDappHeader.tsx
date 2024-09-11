import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../lib';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
    marginTop: theme.spacing(2),
  },
  headerText: {
    marginTop: theme.spacing(2),
  },
  detailText: {
    fontWeight: 'bold',
  },
  descriptionText: {
    marginTop: theme.spacing(2),
  },
  icon: {
    width: '65px',
    height: '65px',
  },
}));

export const SignForDappHeader: React.FC<SignForDappHeaderProps> = ({
  name,
  hostUrl,
  iconUrl,
  actionText,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  return (
    <Box className={classes.container}>
      <Box>
        <img className={classes.icon} src={iconUrl} />
      </Box>
      <Typography className={classes.descriptionText} component="div">
        <Markdown>
          {t('wallet.signDappOperationDescription', {name, actionText})}
        </Markdown>
      </Typography>
      <Typography className={classes.headerText} variant="body1">
        {t('manage.website')}:
      </Typography>
      <Typography className={classes.detailText} variant="body2">
        {hostUrl}
      </Typography>
    </Box>
  );
};

interface SignForDappHeaderProps {
  name: string;
  hostUrl: string;
  iconUrl: string;
  actionText: string;
}
