import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import type {ButtonProps} from '@mui/material/Button';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {LogoTheme} from '@unstoppabledomains/ui-kit/components';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {AccessWalletModal} from '../../components/Wallet/AccessWallet';
import useWeb3Context from '../../hooks/useWeb3Context';
import useTranslationContext from '../../lib/i18n';
import type {Web3Dependencies} from '../../lib/types/web3';
import {loginWithAddress} from '../../lib/wallet/login';
import UnstoppableAnimated from '../Image/UnstoppableAnimated';

const useStyles = makeStyles()((theme: Theme) => ({
  button: {
    padding: theme.spacing(1.25, 2),
    maxHeight: 40,
    marginBottom: theme.spacing(2),
  },
  buttonBig: {
    padding: theme.spacing(1.25, 2),
    maxHeight: 56,
  },
  buttonLoader: {
    borderRadius: theme.shape.borderRadius,
    verticalAlign: 'middle',
    display: 'inline-flex',
  },
  buttonText: {
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  uauth: {
    background: theme.palette.primary.main,
  },
  uauthWhite: {
    background: theme.palette.common.white,
    color: theme.palette.common.black,
    '&:hover': {
      background: theme.palette.common.white,
      color: theme.palette.common.black,
    },
  },
}));

const getLoginMethodIcon = (
  method: LoginMethod,
  isWhiteBg?: boolean,
  hovering?: boolean,
) => {
  switch (method) {
    case LoginMethod.Wallet:
      return <AccountBalanceWalletOutlined />;
    case LoginMethod.Uauth:
      return (
        <UnstoppableAnimated
          theme={isWhiteBg ? LogoTheme.Primary : LogoTheme.White}
          hovering={hovering ?? false}
        />
      );

    default:
      return undefined;
  }
};

type ButtonSkeletonProps = {
  big?: boolean;
};

const ButtonSkeleton: React.FC<ButtonSkeletonProps> = ({big}) => {
  const {classes, cx} = useStyles();

  return (
    <Skeleton
      animation="wave"
      variant="rectangular"
      width="100%"
      className={cx(classes.button, classes.buttonLoader, {
        [classes.buttonBig]: big,
      })}
      height={big ? 56 : 48}
    />
  );
};

export enum LoginMethod {
  Wallet = 'wallet',
  Uauth = 'uauth',
}

type LoginButtonProps = ButtonProps & {
  method: LoginMethod;
  isWhiteBg?: boolean;
  loading?: boolean;
  hidden?: boolean;
  big?: boolean;
  clicked?: boolean;
  onLoginComplete: (address: string, domain: string) => void;
};

export const LoginButton: React.FC<LoginButtonProps> = ({
  method,
  loading,
  hidden,
  isWhiteBg,
  big,
  ...props
}) => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();
  const {setWeb3Deps} = useWeb3Context();
  const [hovering, setHovering] = useState(false);
  const [accessWalletOpen, setAccessWalletOpen] = useState(false);
  const isUauth = method === LoginMethod.Uauth;
  const isWallet = method === LoginMethod.Wallet;

  useEffect(() => {
    if (props.clicked) {
      void handleClick();
    }
  }, [props.clicked]);

  if (loading) {
    return <ButtonSkeleton big={big} />;
  }

  if (hidden) {
    return null;
  }

  const handleClick = async () => {
    if (isWallet) {
      setAccessWalletOpen(true);
      return;
    }
    const loginResult = await loginWithAddress();
    props.onLoginComplete(loginResult.address, loginResult.domain);
  };

  const handleAccessWalletComplete = async (
    web3Dependencies?: Web3Dependencies,
  ) => {
    if (web3Dependencies) {
      setWeb3Deps(web3Dependencies);
      const loginResult = await loginWithAddress(web3Dependencies.address);
      props.onLoginComplete(loginResult.address, loginResult.domain);
      setAccessWalletOpen(false);
    }
  };

  return (
    <>
      <Button
        {...props}
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        className={cx(classes.button, {
          [classes.uauthWhite]: isUauth || isWhiteBg,
        })}
        onClick={handleClick}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        startIcon={
          isWallet && big
            ? undefined
            : getLoginMethodIcon(method, isWhiteBg, hovering)
        }
        disableElevation
        data-testid={`${method}-auth-button`}
        data-cy={`${method}-auth-button`}
      >
        <Typography variant="body1" className={classes.buttonText}>
          {isWallet ? t('common.connect') : t(`auth.loginWithUnstoppable`)}
        </Typography>
      </Button>
      <AccessWalletModal
        prompt={true}
        onComplete={deps => handleAccessWalletComplete(deps)}
        open={accessWalletOpen}
        message={t('auth.connectToLogin')}
        onClose={() => setAccessWalletOpen(false)}
      />
    </>
  );
};
