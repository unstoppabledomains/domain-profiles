import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useTranslationContext} from '../../../../lib';
import Link from '../../../Link';
import type {WalletMode} from './index';

const AVATAR_SIZE = 120;
const AVATAR_PLACEHOLDER_SIZE = 132;

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    position: 'relative',
    minHeight: AVATAR_PLACEHOLDER_SIZE,
  },
  headerContainer: {
    backgroundImage: `linear-gradient(to left, #192b55c0, #192B55)`,
    borderTopRightRadius: theme.shape.borderRadius,
    borderTopLeftRadius: theme.shape.borderRadius,
    color: theme.palette.white,
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
  portfolioHeaderContainer: {
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
  },
  portfolioHeaderIcon: {
    width: '20px',
    height: '20px',
  },
  descriptionText: {
    color: theme.palette.white,
  },
  round: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: '50%',
    backgroundColor: theme.palette.white,
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
    border: `6px solid ${theme.palette.white}`,
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
      fill: theme.palette.white,
    },
  },
  learnMoreLink: {
    color: theme.palette.white,
    fontSize: theme.typography.body2.fontSize,
  },
}));

type Props = {
  domain?: string;
  avatarUrl?: string;
  mode?: WalletMode;
};

export const Header: React.FC<Props> = ({domain, avatarUrl, mode}) => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();

  return mode === 'basic' ? (
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
            <Box className={classes.icon}>
              <WalletOutlinedIcon />
            </Box>
          </Box>
        </Box>
      </Box>
      <Box className={cx(classes.headerContainer)}>
        <Box className={classes.descriptionContainer}>
          <Typography variant="body2" className={classes.descriptionText}>
            {t('manage.cryptoWalletDescription')}
          </Typography>
          <Link
            className={classes.learnMoreLink}
            external={true}
            to={
              'https://support.unstoppabledomains.com/support/solutions/articles/48001205861-list-domain-for-sale-on-our-website'
            }
          >
            {t('profile.learnMore')}
          </Link>
        </Box>
      </Box>
    </Box>
  ) : (
    <Box className={classes.portfolioHeaderContainer}>
      <Box display="flex" mr={1}>
        {avatarUrl ? (
          <img
            className={cx(classes.round, classes.portfolioHeaderIcon)}
            src={avatarUrl}
          />
        ) : (
          <WalletOutlinedIcon className={classes.portfolioHeaderIcon} />
        )}
      </Box>
      <Typography variant="h6">{domain || t('wallet.title')}</Typography>
    </Box>
  );
};
