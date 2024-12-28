import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddHomeOutlinedIcon from '@mui/icons-material/AddHomeOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import Logout from '@mui/icons-material/Logout';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SupportIcon from '@mui/icons-material/Support';
import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined';
import {Card, Typography} from '@mui/material/';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useRef, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import useFireblocksState from '../hooks/useFireblocksState';
import {isDomainValidForManagement} from '../lib';
import useTranslationContext from '../lib/i18n';
import {localStorageWrapper} from './Chat/storage';

interface Props {
  domain?: string;
  isOwner: boolean;
  authDomain?: string;
  onGetDomainClicked?: () => void;
  onDomainsClicked?: () => void;
  onWalletClicked?: () => void;
  onRecoveryLinkClicked?: () => void;
  onSettingsClicked?: () => void;
  onSupportClicked?: () => void;
  onMessagingClicked?: () => void;
  onLogout?: () => void;
  onDisconnect?: () => void;
  onHideMenu: () => void;
  marginTop?: number;
}

const useStyles = makeStyles<{marginTop?: number}>()(
  (theme: Theme, {marginTop}) => ({
    cardBody: {
      position: 'absolute',
      top: `${marginTop || '44'}px`,
      right: '0px',
      zIndex: 100,
    },
    container: {
      display: 'flex',
      fontSize: '16px',
      margin: '20px',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
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
  }),
);

const DropDownMenu: React.FC<Props> = ({
  authDomain,
  marginTop,
  onGetDomainClicked,
  onDomainsClicked,
  onWalletClicked,
  onRecoveryLinkClicked,
  onSettingsClicked,
  onSupportClicked,
  onMessagingClicked,
  onDisconnect,
  onLogout,
  onHideMenu,
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isLoggingOut, setLoggingOut] = useState<boolean>(false);
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles({marginTop});

  // MPC wallet state
  const [isMpcWallet, setIsMpcWallet] = useState(false);
  const [state] = useFireblocksState();

  // load Fireblocks state on component load
  useEffect(() => {
    void handleLoadWallet();
  }, []);

  // detect if user clicks outside the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // hide the menu if the target is outside the menu
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setTimeout(onHideMenu, 150);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const handleLoadWallet = async () => {
    // retrieve and validate key state
    if (Object.keys(state).length > 0) {
      setIsMpcWallet(true);
    }
  };

  const handleManageProfileClick = (href: string) => {
    if (!isLoggingOut) {
      window.open(href);
    }
  };

  const handleDisconnect = () => {
    if (onDisconnect) {
      onDisconnect();
    }
  };

  const handleLogout = async () => {
    setLoggingOut(prev => !prev);
    await localStorageWrapper.clear();
    sessionStorage.clear();
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  return (
    <Card ref={menuRef} className={classes.cardBody} data-testid={'dropdown'}>
      {authDomain && isDomainValidForManagement(authDomain) && (
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
      {onDomainsClicked && (
        <div
          data-testid={`my-domains-button`}
          className={classes.container}
          onClick={onDomainsClicked}
        >
          <ListOutlinedIcon className={classes.settingsIcon} />
          <Typography className={cx(classes.font)} color="text.secondary">
            {t('profile.viewMyDomains')}
          </Typography>
        </div>
      )}
      {onMessagingClicked && (
        <div className={classes.container} onClick={onMessagingClicked}>
          <ChatOutlinedIcon className={classes.settingsIcon} />
          <Typography className={cx(classes.font)} color="text.secondary">
            {t('push.messages')}
          </Typography>
        </div>
      )}
      {onGetDomainClicked && (
        <div
          data-testid={`get-domain-button`}
          className={classes.container}
          onClick={onGetDomainClicked}
        >
          <AddHomeOutlinedIcon className={classes.settingsIcon} />
          <Typography className={cx(classes.font)} color="text.secondary">
            {t('wallet.addDomain')}
          </Typography>
        </div>
      )}
      {isMpcWallet && onWalletClicked && (
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
      {onRecoveryLinkClicked && (
        <div
          data-testid={`recovery-link-button`}
          className={classes.container}
          onClick={onRecoveryLinkClicked}
        >
          <MedicalServicesOutlinedIcon className={classes.settingsIcon} />
          <Typography className={cx(classes.font)} color="text.secondary">
            {t('wallet.recoveryKit')}
          </Typography>
        </div>
      )}
      {onSettingsClicked && (
        <div
          data-testid={`recovery-link-button`}
          className={classes.container}
          onClick={onSettingsClicked}
        >
          <SettingsOutlinedIcon className={classes.settingsIcon} />
          <Typography className={cx(classes.font)} color="text.secondary">
            {t('push.settings')}
          </Typography>
        </div>
      )}
      {onSupportClicked && (
        <div
          data-testid={`support-button`}
          className={classes.container}
          onClick={onSupportClicked}
        >
          <SupportIcon className={classes.settingsIcon} />
          <Typography className={cx(classes.font)} color="text.secondary">
            {t('common.support')}
          </Typography>
        </div>
      )}
      <div
        data-testid={`signout-button`}
        className={classes.container}
        onClick={onDisconnect ? handleDisconnect : handleLogout}
      >
        <Logout className={cx(classes.settingsIcon, classes.red)} />
        <Typography
          className={cx(classes.font, classes.red)}
          color="text.secondary"
        >
          {onDisconnect ? t('header.disconnect') : t('header.signOut')}
        </Typography>
      </div>
    </Card>
  );
};

export default DropDownMenu;
