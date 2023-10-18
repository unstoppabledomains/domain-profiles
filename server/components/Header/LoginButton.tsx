import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import type {ButtonProps} from '@mui/material/Button';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import type {TextFieldProps} from '@mui/material/TextField';
import TextField from '@mui/material/TextField';
import type {Theme} from '@mui/material/styles';
import useTranslationContext from 'lib/i18n';
import type {ClassNameMap} from 'notistack';
import React, {useState} from 'react';

import {LogoTheme} from '@unstoppabledomains/ui-kit/components';
import GoogleIcon from '@unstoppabledomains/ui-kit/icons/GoogleColored';
import TwitterXIcon from '@unstoppabledomains/ui-kit/icons/TwitterX';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import UnstoppableAnimated from '../Image/UnstoppableAnimated';

const useStyles = makeStyles()((theme: Theme) => ({
  button: {
    padding: theme.spacing(1.25, 2),
    maxHeight: 48,
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
  twitterIcon: {
    fill: '#000',
  },
  formField: {
    marginBottom: theme.spacing(2),
  },
  cancel: {
    marginRight: theme.spacing(1),
  },
}));

const getLoginMethodIcon = (
  method: LoginMethod,
  classes: ClassNameMap,
  isWhiteBg?: boolean,
  hovering?: boolean,
) => {
  switch (method) {
    case LoginMethod.Google:
      return <GoogleIcon />;
    case LoginMethod.Wallet:
      return <AccountBalanceWalletOutlined />;
    case LoginMethod.Uauth:
      return (
        <UnstoppableAnimated
          theme={isWhiteBg ? LogoTheme.Primary : LogoTheme.White}
          hovering={hovering ?? false}
        />
      );
    case LoginMethod.Twitter:
      return <TwitterXIcon className={classes.twitterIcon} fr={undefined} />;
    case LoginMethod.Email:
      return <MailOutlinedIcon />;
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
  Email = 'email',
  Google = 'google',
  Wallet = 'wallet',
  Twitter = 'twitter',
  Uauth = 'uauth',
}

type LoginButtonProps = ButtonProps & {
  method: LoginMethod;
  isWhiteBg?: boolean;
  loading?: boolean;
  hidden?: boolean;
  big?: boolean;
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
  const [hovering, setHovering] = useState(false);
  const isEmail = method === LoginMethod.Email;
  const isUauth = method === LoginMethod.Uauth;
  const isGoogle = method === LoginMethod.Google;
  const isTwitter = method === LoginMethod.Twitter;
  const isWallet = method === LoginMethod.Wallet;

  if (loading) {
    return <ButtonSkeleton big={big} />;
  }

  if (hidden) {
    return null;
  }

  return (
    <Button
      {...props}
      variant={
        ((isEmail && !isWhiteBg) || isUauth) && !big ? 'contained' : 'outlined'
      }
      color="primary"
      fullWidth
      size="large"
      className={cx(classes.button, {
        [classes.uauth]: isUauth && !isWhiteBg,
        [classes.uauthWhite]: isUauth && isWhiteBg,
        [classes.buttonBig]: big,
      })}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      startIcon={
        isGoogle || isTwitter || (isEmail && big) || (isWallet && big)
          ? undefined
          : getLoginMethodIcon(method, classes, isWhiteBg, hovering)
      }
      disableElevation
      data-testid={`${method}-auth-button`}
      data-cy={`${method}-auth-button`}
    >
      {isGoogle || isTwitter || (isEmail && big) || (isWallet && big)
        ? getLoginMethodIcon(method, classes, isWhiteBg)
        : t(`auth.buttons.${method}`)}
    </Button>
  );
};

export const SubmitButton: React.FC<ButtonProps> = ({children, ...props}) => {
  const {classes, cx} = useStyles();

  return (
    <Button
      {...props}
      className={cx(classes.button, props.className)}
      variant="contained"
      color="primary"
      type="submit"
      size="large"
    >
      {children}
    </Button>
  );
};

export const FormField: React.FC<TextFieldProps> = props => {
  const {classes} = useStyles();

  return (
    <TextField
      {...props}
      inputProps={{maxLength: 256}}
      className={classes.formField}
      size="small"
      fullWidth
      required
    />
  );
};

export const Cancel: React.FC<ButtonProps> = props => {
  const {classes, cx} = useStyles();
  const [t] = useTranslationContext();

  return (
    <Button
      {...props}
      size="large"
      className={cx(classes.button, classes.cancel, props.className)}
    >
      {t('common.cancel')}
    </Button>
  );
};
