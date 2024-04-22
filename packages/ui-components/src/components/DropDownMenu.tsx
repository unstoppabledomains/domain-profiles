import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';
import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined';
import {Card, Typography} from '@mui/material/';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import useFireblocksState from '../hooks/useFireblocksState';
import {isDomainValidForManagement} from '../lib';
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
  onWalletClicked: () => void;
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

const DropDownMenu: React.FC<Props> = ({authDomain, onWalletClicked}) => {
  const [isLoggingOut, setLoggingOut] = useState<boolean>(false);
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();

  // MPC wallet state
  const [isMpcWallet, setIsMpcWallet] = useState(false);
  const [state] = useFireblocksState();

  // load Fireblocks state on component load
  useEffect(() => {
    void handleLoadWallet();
  }, []);

  const handleLoadWallet = async () => {
    // retrieve and validate key state
    if (Object.keys(state).length > 0) {
      setIsMpcWallet(true);
    }
  };

  const handleManageProfileClick = (href: string) => {
    if (!isLoggingOut) {
      window.location.href = href;
    }
  };
  const handleLogout = () => {
    setLoggingOut(prev => !prev);
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <Card className={classes.cardBody} data-testid={'dropdown'}>
      {isDomainValidForManagement(authDomain) && (
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
      )}
      {isMpcWallet && (
        <div
          data-testid={`manage-wallet-button`}
          className={classes.container}
          onClick={onWalletClicked}
        >
          <WalletOutlinedIcon className={classes.settingsIcon} />
          <Typography className={cx(classes.font)} color="text.secondary">
            {t('wallet.title')}
          </Typography>
        </div>
      )}
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
