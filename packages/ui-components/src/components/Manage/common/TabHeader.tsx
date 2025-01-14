import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../../lib';
import Link from '../../Link';

const AVATAR_SIZE = 120;
const AVATAR_PLACEHOLDER_SIZE = 132;

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    position: 'relative',
    minHeight: AVATAR_PLACEHOLDER_SIZE,
  },
  headerContainer: {
    background: theme.palette.heroText,
    borderTopRightRadius: theme.shape.borderRadius,
    borderTopLeftRadius: theme.shape.borderRadius,
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
  iconContainer: {
    position: 'absolute',
    top: theme.spacing(-1),
    left: theme.spacing(-1),
    flexWrap: 'nowrap',
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
    },
  },
  descriptionContainer: {
    marginLeft: theme.spacing(16),
    padding: theme.spacing(1),
  },
  descriptionText: {
    color: theme.palette.getContrastText(theme.palette.primary.main),
  },
  round: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: '50%',
    backgroundColor: theme.palette.background.paper,
    zIndex: 1,
    [theme.breakpoints.up('sm')]: {
      flex: '1 0 auto',
    },
  },
  pictureContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  imageWrapper: {
    position: 'relative',
    backgroundColor: theme.palette.secondary.main,
    borderRadius: '50%',
    border: `6px solid ${theme.palette.background.paper}`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      background: 'rgba(0, 0, 0, 0.16)',
      opacity: 0,
      transition: theme.transitions.create('opacity'),
    },
  },
  imagePlaceholderWrapper: {
    minWidth: AVATAR_PLACEHOLDER_SIZE,
    maxWidth: AVATAR_PLACEHOLDER_SIZE,
    height: AVATAR_PLACEHOLDER_SIZE,
    overflow: 'hidden',
  },
  icon: {
    '& > svg': {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      padding: theme.spacing(2),
      fill: theme.palette.background.paper,
    },
  },
  learnMoreLink: {
    color: theme.palette.getContrastText(theme.palette.primary.main),
    fontSize: theme.typography.body2.fontSize,
  },
}));

type Props = {
  icon: JSX.Element;
  description: string;
  learnMoreLink?: string;
};

export const TabHeader: React.FC<Props> = ({
  icon,
  description,
  learnMoreLink,
}) => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();

  return (
    <Box className={classes.root}>
      <Box className={classes.iconContainer}>
        <Box className={classes.pictureContainer}>
          <Box
            className={cx(
              classes.round,
              classes.imageWrapper,
              classes.imagePlaceholderWrapper,
            )}
          >
            <Box className={classes.icon}>{icon}</Box>
          </Box>
        </Box>
      </Box>
      <Box className={cx(classes.headerContainer)}>
        <Box className={classes.descriptionContainer}>
          <Typography variant="body2" className={classes.descriptionText}>
            {description}
          </Typography>
          {learnMoreLink && (
            <Link
              className={classes.learnMoreLink}
              external={true}
              to={learnMoreLink}
            >
              {t('profile.learnMore')}
            </Link>
          )}
        </Box>
      </Box>
    </Box>
  );
};
