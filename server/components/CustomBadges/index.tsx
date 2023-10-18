import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import type {Theme} from '@mui/material/styles';
import config from '@unstoppabledomains/config';
import useTranslationContext from 'lib/i18n';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import CustomBadgesDialog from './CustomBadgesDialog';

const useStyles = makeStyles()((theme: Theme) => ({
  buttonContainer: {
    marginRight: theme.spacing(1),
  },
  button: {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: 1.5,
  },
  icon: {
    marginRight: theme.spacing(1),
  },
}));

const CustomBadges: React.FC = () => {
  const {classes} = useStyles();
  const [open, setOpen] = useState<boolean>(false);
  const [t] = useTranslationContext();

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Grid container spacing={1} className={classes.buttonContainer}>
      <Grid item xs={6}>
        <Button
          onClick={handleClick}
          variant={'text'}
          data-testid={'custom-badge-button'}
          className={classes.button}
        >
          <VolunteerActivismIcon className={classes.icon} />
          {t('badges.create')}
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button
          onClick={() =>
            (window.location.href = `${config.UNSTOPPABLE_WEBSITE_URL}/leaderboard`)
          }
          variant={'text'}
          data-testid={'leaderboard-button'}
          className={classes.button}
        >
          <LeaderboardIcon className={classes.icon} />
          {t('badges.leaderboard')}
        </Button>
      </Grid>
      <CustomBadgesDialog open={open} handleClose={handleClose} />
    </Grid>
  );
};

export default CustomBadges;
