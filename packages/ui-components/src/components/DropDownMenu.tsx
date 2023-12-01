import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';
import SecurityIcon from '@mui/icons-material/Security';
import {Card, Typography} from '@mui/material/';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import useTranslationContext from '../lib/i18n';

interface Props {
  classes?: {
    root?: string;
    input?: string;
    adornedStart?: string;
    adornedEnd?: string;
  };
  domain: string;
  isOwner: boolean;
  authDomain: string;
}

const useStyles = makeStyles()((theme: Theme) => ({
  cardBody: {
    position: 'absolute',
    top: '44px',
    right: '0px',
  },
  container: {
    display: 'flex',
    fontSize: '16px',
    margin: '20px',
    whiteSpace: 'nowrap',
  },
  settingsIcon: {
    marginRight: '10px',
  },
  red: {
    color: '#BD1B0F',
  },
  font: {
    fontWeight: 600,
    color: '#000',
  },
}));

const DropDownMenu: React.FC<Props> = ({authDomain}) => {
  const [isLoggingOut, setLoggingOut] = useState<boolean>(false);
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();
  const handleManageProfileClick = (href: string) => {
    if (!isLoggingOut) {
      window.location.href = href;
    }
  };
  const handleLogout = () => {
    setLoggingOut(prev => !prev);
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Card className={classes.cardBody} data-testid={'dropdown'}>
      <div
        data-testid={`manage-profile-button`}
        className={classes.container}
        onClick={() =>
          handleManageProfileClick(`${config.UD_ME_BASE_URL}/${authDomain}`)
        }
      >
        <AccountCircleIcon className={classes.settingsIcon} />
        <Typography className={cx(classes.font)} color="text.secondary">
          {t('profile.viewMyProfile')}
        </Typography>
      </div>
      <div
        className={classes.container}
        onClick={() =>
          handleManageProfileClick(
            `${config.UNSTOPPABLE_WEBSITE_URL}/manage?page=appAccess&domain=${authDomain}`,
          )
        }
      >
        <SecurityIcon className={classes.settingsIcon} />
        <Typography className={cx(classes.font)} color="text.secondary">
          {t('profile.privacySettings')}
        </Typography>
      </div>
      <div
        data-testid={`signout-button`}
        className={classes.container}
        onClick={handleLogout}
      >
        <Logout className={cx(classes.settingsIcon, classes.red)} />
        <Typography
          className={cx(classes.font, classes.red)}
          color="text.secondary"
        >
          {t('header.signOut')}
        </Typography>
      </div>
    </Card>
  );
};

export default DropDownMenu;
