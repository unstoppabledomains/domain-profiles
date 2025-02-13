import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../lib';
import Link from '../Link';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    marginTop: theme.spacing(2),
  },
  flexColCenterAligned: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    marginBottom: theme.spacing(4),
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  textContainer: {
    textAlign: 'center',
    height: '100%',
  },
  iconContainer: {
    '& > svg': {
      width: '150px',
      height: '150px',
      fill: theme.palette.neutralShades[300],
    },
  },
  learnMoreLink: {
    display: 'inline-flex',
  },
}));

type Props = {
  onClick: () => void;
  onCancelClick?: () => void;
  icon: React.ReactNode;
  title: string;
  description?: string;
  learnMoreLink?: string;
  buttonText?: string;
};

const FullScreenCta: React.FC<Props> = ({
  onClick,
  onCancelClick,
  icon,
  title,
  description,
  learnMoreLink,
  buttonText,
}) => {
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();

  return (
    <Box className={classes.container}>
      <Box
        className={cx(
          classes.content,
          classes.flexColCenterAligned,
          classes.textContainer,
        )}
      >
        <Box className={classes.iconContainer}>{icon}</Box>
        <Typography variant="h5" mb={1}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" mb={1}>
            {description}
          </Typography>
        )}
        {learnMoreLink && (
          <Link
            href={learnMoreLink}
            target="_blank"
            className={classes.learnMoreLink}
          >
            <Typography variant="body2" fontWeight="bold">
              {t('common.learnMore')}
            </Typography>
          </Link>
        )}
      </Box>
      <Box mb={1}>
        {onCancelClick && (
          <Box mb={1}>
            <Button fullWidth variant="outlined" onClick={onCancelClick}>
              {t('common.cancel')}
            </Button>
          </Box>
        )}
        <Button fullWidth variant="contained" onClick={onClick}>
          {buttonText || t('common.letsGo')}
        </Button>
      </Box>
    </Box>
  );
};

export default FullScreenCta;
