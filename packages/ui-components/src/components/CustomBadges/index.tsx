import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import useTranslationContext from '../../lib/i18n';
import CustomBadgesDialog from './CustomBadgesDialog';

const useStyles = makeStyles()((theme: Theme) => ({
  buttonContainer: {
    marginRight: theme.spacing(1),
  },
  button: {
    color: theme.palette.neutralShades[500],
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
          size="small"
          data-testid={'custom-badge-button'}
          className={classes.button}
        >
          <VolunteerActivismOutlinedIcon className={classes.icon} />
          {t('badges.create')}
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button
          onClick={() =>
            (window.location.href = `${config.UNSTOPPABLE_WEBSITE_URL}/leaderboard`)
          }
          variant={'text'}
          size="small"
          data-testid={'leaderboard-button'}
          className={classes.button}
        >
          <LeaderboardOutlinedIcon className={classes.icon} />
          {t('badges.leaderboard')}
        </Button>
      </Grid>
      <CustomBadgesDialog open={open} handleClose={handleClose} />
    </Grid>
  );
};

export default CustomBadges;
export {default as CustomBadgesDialog} from './CustomBadgesDialog';
