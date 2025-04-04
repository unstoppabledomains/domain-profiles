import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddHomeOutlinedIcon from '@mui/icons-material/AddHomeOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import LaunchIcon from '@mui/icons-material/Launch';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import Logout from '@mui/icons-material/Logout';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SupportIcon from '@mui/icons-material/Support';
import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {lighten, useTheme} from '@mui/material/styles';
import React, {useEffect, useRef, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useUnstoppableMessaging} from '../hooks';
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
  onSecurityCenterClicked?: () => void;
  onSettingsClicked?: () => void;
  onSidePanelClicked?: () => void;
  onSupportClicked?: () => void;
  onMessagingClicked?: () => void;
  onClaimWalletClicked?: () => void;
  onLogout?: () => void;
  onDisconnect?: () => void;
  onHideMenu: () => void;
  marginTop?: number;
  hideLogout?: boolean;
  hideProfile?: boolean;
}

const useStyles = makeStyles<{marginTop?: number}>()(
  (theme: Theme, {marginTop}) => ({
    cardBody: {
      position: 'absolute',
      top: `${marginTop || '44'}px`,
      right: '0px',
      zIndex: 100,
      padding: theme.spacing(0.6),
      boxShadow: theme.shadows[3],
    },
    container: {
      display: 'flex',
      fontSize: '16px',
      padding: theme.spacing(1.2),
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      borderRadius: theme.shape.borderRadius,
      '&:hover': {
        backgroundColor: theme.palette.background.default,
      },
      color: theme.palette.getContrastText(theme.palette.background.default),
    },
    disabled: {
      cursor: 'auto',
      '&:hover': {
        backgroundColor: 'transparent',
      },
      color: lighten(
        theme.palette.getContrastText(theme.palette.background.default),
        0.5,
      ),
    },
    settingsIcon: {
      marginRight: '10px',
      width: '22px',
      height: '22px',
    },
    font: {
      fontWeight: 600,
    },
    red: {
      color: theme.palette.error.main,
    },
  }),
);

const DropDownMenu: React.FC<Props> = ({
  authDomain,
  marginTop,
  hideLogout,
  hideProfile,
  onGetDomainClicked,
  onDomainsClicked,
  onWalletClicked,
  onSecurityCenterClicked,
  onSettingsClicked,
  onSidePanelClicked,
  onSupportClicked,
  onMessagingClicked,
  onClaimWalletClicked,
  onDisconnect,
  onLogout,
  onHideMenu,
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isLoggingOut, setLoggingOut] = useState<boolean>(false);
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles({marginTop});
  const theme = useTheme();

  // chat state
  const {isChatReady} = useUnstoppableMessaging();

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
    await localStorageWrapper.clear({type: 'local'});
    await localStorageWrapper.clear({type: 'session'});
    sessionStorage.clear();
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  return (
    <Card ref={menuRef} className={classes.cardBody} data-testid={'dropdown'}>
      {!hideProfile && authDomain && isDomainValidForManagement(authDomain) && (
        <div
          data-testid={`manage-profile-button`}
          className={classes.container}
          onClick={() =>
            handleManageProfileClick(`${config.UD_ME_BASE_URL}/${authDomain}`)
          }
        >
          <AccountCircleIcon className={classes.settingsIcon} />
          <Typography className={classes.font}>
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
          <Typography className={classes.font}>
            {t('profile.viewMyDomains')}
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
          <Typography className={classes.font}>
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
          <Typography className={classes.font}>{theme.wallet.title}</Typography>
        </div>
      )}
      {onSettingsClicked && (
        <div
          data-testid={`recovery-link-button`}
          className={classes.container}
          onClick={onSettingsClicked}
        >
          <SettingsOutlinedIcon className={classes.settingsIcon} />
          <Typography className={classes.font}>{t('push.settings')}</Typography>
        </div>
      )}
      {onSecurityCenterClicked && (
        <div
          data-testid={`security-center-button`}
          className={classes.container}
          onClick={onSecurityCenterClicked}
        >
          <SecurityOutlinedIcon className={classes.settingsIcon} />
          <Typography className={classes.font}>
            {t('wallet.securityCenter')}
          </Typography>
        </div>
      )}
      {onClaimWalletClicked && (
        <div
          data-testid={`claim-wallet-button`}
          className={classes.container}
          onClick={onClaimWalletClicked}
        >
          <SecurityOutlinedIcon className={classes.settingsIcon} />
          <Typography className={classes.font}>
            {t('wallet.securityCenter')}
          </Typography>
        </div>
      )}
      {onMessagingClicked && (
        <Tooltip title={isChatReady ? '' : t('push.preparingChat')}>
          <div
            className={cx(classes.container, {
              [classes.disabled]: !isChatReady,
            })}
            onClick={isChatReady ? onMessagingClicked : undefined}
          >
            {isChatReady ? (
              <ChatOutlinedIcon className={classes.settingsIcon} />
            ) : (
              <CircularProgress
                className={cx(classes.disabled, classes.settingsIcon)}
                size={22}
              />
            )}
            <Typography className={classes.font}>
              {t('push.messages')}
            </Typography>
          </div>
        </Tooltip>
      )}
      {onSupportClicked && (
        <div
          data-testid={`support-button`}
          className={cx(classes.container)}
          onClick={onSupportClicked}
        >
          <SupportIcon className={classes.settingsIcon} />
          <Typography className={classes.font}>
            {t('common.support')}
          </Typography>
        </div>
      )}
      {onSidePanelClicked && (
        <div
          data-testid={`side-panel-button`}
          className={classes.container}
          onClick={onSidePanelClicked}
        >
          <LaunchIcon className={classes.settingsIcon} />
          <Typography className={classes.font}>
            {t('extension.sidePanel')}
          </Typography>
        </div>
      )}
      {!hideLogout && (
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
      )}
    </Card>
  );
};

export default DropDownMenu;
