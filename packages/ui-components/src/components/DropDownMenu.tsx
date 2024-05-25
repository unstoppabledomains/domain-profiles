import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddHomeOutlinedIcon from '@mui/icons-material/AddHomeOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import Logout from '@mui/icons-material/Logout';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SupportOutlinedIcon from '@mui/icons-material/SupportOutlined';
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
  domain?: string;
  isOwner: boolean;
  authDomain?: string;
  onGetDomainClicked?: () => void;
  onDomainsClicked?: () => void;
  onWalletClicked?: () => void;
  onRecoveryLinkClicked?: () => void;
  onSupportClicked?: () => void;
  marginTop?: number;
}

const useStyles = makeStyles<{marginTop?: number}>()(
  (theme: Theme, {marginTop}) => ({
    cardBody: {
      position: 'absolute',
      top: `${marginTop || '44'}px`,
      right: '0px',
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
  onSupportClicked,
}) => {
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
      {onGetDomainClicked && (
        <div
          data-testid={`get-domain-button`}
          className={classes.container}
          onClick={onGetDomainClicked}
        >
          <AddHomeOutlinedIcon className={classes.settingsIcon} />
          <Typography className={cx(classes.font)} color="text.secondary">
            {t('push.communitiesGetADomain')}
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
          <SupportOutlinedIcon className={classes.settingsIcon} />
          <Typography className={cx(classes.font)} color="text.secondary">
            {t('wallet.recoveryKit')}
          </Typography>
        </div>
      )}
      {onSupportClicked && (
        <div
          data-testid={`support-button`}
          className={classes.container}
          onClick={onSupportClicked}
        >
          <SchoolOutlinedIcon className={classes.settingsIcon} />
          <Typography className={cx(classes.font)} color="text.secondary">
            {t('wallet.help')}
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
