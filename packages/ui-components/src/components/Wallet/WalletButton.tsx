import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';
import type {Theme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Image from 'next/image';
import React from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import getImageUrl from '../../lib/domain/getImageUrl';
import useTranslationContext from '../../lib/i18n';
import {WalletName} from '../../lib/types/wallet';

const useStyles = makeStyles()((theme: Theme) => ({
  cardRoot: {
    textAlign: 'center',
    cursor: 'pointer',
    padding: theme.spacing(2.5, 0),
    border: `1px dashed ${theme.palette.neutralShades[100]}`,
    userSelect: 'none',
    transition: theme.transitions.create('background-color'),
    '&:hover': {
      backgroundColor: theme.palette.background.default,
    },
    '&:active': {
      backgroundColor: theme.palette.pressedPaper,
    },
  },

  noBorder: {
    border: 'none',
    padding: 0,
  },
  horizontal: {
    display: 'flex',
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '&:active': {
      backgroundColor: 'transparent',
    },
  },
  buttonRoot: {
    display: 'flex',
    width: '100%',
    height: '64px',
    justifyContent: 'flex-start',
    borderRadius: theme.shape.borderRadius,
  },
  cardContent: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  buttonContent: {
    position: 'relative',
    minHeight: 88,
    alignItems: 'flex-start',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  cardLogo: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(1.5),
  },
  cardLogoBorder: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 0,
    marginRight: theme.spacing(1.5),
    border: `solid 1px ${theme.palette.neutralShades[100]}`,
    borderRadius: '50%',
    padding: '10px',
    height: '60px',
    width: '60px',
  },
  buttonLogo: {
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(1),
    width: 32,
  },
  image: {
    display: 'flex',
  },
  cardTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.neutralShades[600],
  },
  cardTitleHorizontal: {
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.common.black,
  },
  buttonTitle: {
    fontWeight: 600,
    lineHeight: '24px',
    fontSize: theme.typography.body1.fontSize,
    color: theme.palette.white,
  },
  cardTip: {
    color: theme.palette.grey[600],
    fontSize: theme.typography.body2.fontSize,
  },
  buttonTip: {
    opacity: '72.16%',
    color: theme.palette.white,
    fontSize: theme.typography.body2.fontSize,
  },
  highlighted: {
    background: theme.palette.heroText,
    fontWeight: theme.typography.fontWeightBold,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginRight: theme.spacing(1),
  },
  delimiter: {
    marginRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.grey[600],
  },
  disabled: {
    pointerEvents: 'none',
    opacity: 0.33,
    filter: 'grayscale(1)',
  },
  decor: {
    position: 'absolute',
    top: '50%',
    right: theme.spacing(2),
    transform: 'translateY(-50%)',
  },
  loader: {
    color: theme.palette.white,
  },
  metamaskBackground: {
    backgroundColor: '#25292E',
  },
  walletConnectBackground: {
    backgroundColor: '#3B99FC',
  },
  coinbaseBackground: {
    backgroundColor: '#2059EB',
  },
  blockchainCom: {
    fontSize: 18,
    marginRight: theme.spacing(0.25),
    verticalAlign: 'middle',
  },
  iconText: {
    verticalAlign: 'middle',
  },
}));

type CardTemplateProps = {
  onClick?: () => void;
  disabled?: boolean;
  title: string;
  tip?: React.ReactNode;
  iconUrl: string;
  highlighted?: boolean;
  iconOnly?: boolean;
  borderless?: boolean;
  horizontal?: boolean;
  loading?: boolean;
  size?: number;
};

type ButtonTemplateProps = {
  onClick?: () => void;
  disabled?: boolean;
  title: string;
  tip?: React.ReactNode;
  iconUrl: string;
  highlighted?: boolean;
  buttonBackground?: string;
  loading?: boolean;
  size?: number;
};

const CardTemplate: React.FC<CardTemplateProps> = ({
  title,
  tip,
  highlighted,
  iconUrl,
  disabled,
  loading,
  onClick,
  iconOnly,
  borderless,
  horizontal,
  size = 40,
}) => {
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();
  return (
    <div
      onClick={onClick}
      className={cx(classes.cardRoot, {
        [classes.disabled]: disabled,
        [classes.noBorder]: borderless,
        [classes.horizontal]: horizontal,
      })}
    >
      <div
        className={cx(classes.cardLogo, {
          [classes.cardLogoBorder]: horizontal,
        })}
      >
        {loading ? (
          <CircularProgress size={size} color="primary" />
        ) : (
          <Image
            src={getImageUrl(iconUrl)}
            className={classes.image}
            height={size}
            width={size}
            unoptimized={true}
          />
        )}
      </div>

      {!iconOnly && (
        <div className={classes.cardContent}>
          <div
            className={cx(classes.cardTitle, {
              [classes.cardTitleHorizontal]: horizontal,
            })}
            data-testid={`title-${title}`}
          >
            {title}
          </div>
          <Typography className={classes.cardTip}>
            {highlighted && (
              <>
                <span className={classes.highlighted}>
                  {t('claimDomains.beta')}
                </span>
                <span className={classes.delimiter}>&middot;</span>
              </>
            )}
            {tip}
          </Typography>
        </div>
      )}
    </div>
  );
};

const ButtonTemplate: React.FC<ButtonTemplateProps> = ({
  title,
  tip,
  highlighted,
  iconUrl,
  disabled,
  onClick,
  buttonBackground,
  loading,
  size = 32,
}) => {
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();
  return (
    <ButtonBase
      onClick={onClick}
      className={cx(
        classes.buttonRoot,
        {[classes.disabled]: disabled},
        buttonBackground,
      )}
      disabled={loading}
    >
      <div className={classes.buttonLogo}>
        {loading ? (
          <CircularProgress size={30} className={classes.loader} />
        ) : (
          <Image
            src={getImageUrl(iconUrl)}
            className={classes.image}
            height={size}
            width={size}
            unoptimized={true}
          />
        )}
      </div>
      <div className={classes.buttonContent}>
        <Typography variant="h6" className={classes.buttonTitle}>
          {title}
        </Typography>
        <Typography className={classes.buttonTip}>
          {highlighted && (
            <>
              <span className={classes.highlighted}>
                {t('claimDomains.beta')}
              </span>
              <span className={classes.delimiter}>&middot;</span>
            </>
          )}
          {tip}
        </Typography>
      </div>
    </ButtonBase>
  );
};

export enum Variant {
  card = 'card',
  button = 'button',
}

type Props = {
  name: WalletName;
  disabled?: boolean;
  onClick?: () => void;
  variant?: Variant;
  loading?: boolean;
  hideTipText?: boolean;
  iconOnly?: boolean;
  borderless?: boolean;
  horizontal?: boolean;
  iconUrl?: string;
  highlightedOverride?: boolean;
  size?: number;
};

const WalletButton: React.FC<Props> = ({
  name,
  onClick,
  disabled = false,
  variant = Variant.card,
  loading = false,
  hideTipText = false,
  iconOnly = false,
  borderless = false,
  horizontal = false,
  iconUrl = '',
  highlightedOverride = false,
  size,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const tip: React.ReactNode = hideTipText
    ? ''
    : t(`claimDomains.tips.${name}`);
  const props = {
    disabled,
    onClick,
    title: String(name),
    tip,
    loading,
    iconOnly,
    highlighted: false,
    highlightedOverride,
    iconUrl,
    buttonBackground: '',
    borderless,
    horizontal,
    size,
  };
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  switch (name) {
    case WalletName.UnstoppableWallet:
      props.title = 'Unstoppable Guard';
      props.iconUrl = '/wallet-button/unstoppable-domains.svg';
      break;
    case WalletName.MetaMask:
      props.title = 'MetaMask';
      props.iconUrl = '/wallet-button/metamask.svg';
      if (variant === Variant.button) {
        props.buttonBackground = classes.metamaskBackground;
      }
      break;
    case WalletName.WalletConnect:
      props.title = 'WalletConnect';
      props.iconUrl = '/wallet-button/wallet-connect.svg';
      if (variant === Variant.button) {
        props.buttonBackground = classes.walletConnectBackground;
        props.iconUrl = '/wallet-button/wallet-connect-white.svg';
        props.tip = 'Trust Wallet, Rainbow, etc.';
      }
      break;
    case WalletName.CoinbaseWallet:
      props.title = 'Coinbase';
      props.iconUrl = '/wallet-button/coinbase.svg';
      props.tip = '';
      if (variant === Variant.button) {
        props.buttonBackground = classes.coinbaseBackground;
        props.iconUrl = '/wallet-button/coinbase-white.svg';
        props.tip = '';
        if (!isDesktop) {
          props.title = 'Open in Coinbase Wallet';
        }
      }
      break;
    case WalletName.Brave:
      props.iconUrl = '/wallet-button/brave.svg';
      props.title = 'Brave';
      break;
    case WalletName.BlockchainCom:
      props.iconUrl = '/wallet-button/blockchain.com.svg';
      props.title = 'Blockchain.com';
      props.tip = '';
      break;
    case WalletName.CryptoCom:
      props.iconUrl = '/wallet-button/crypto.com.svg';
      props.title = 'Crypto.com';
      break;
    case WalletName.TrustWallet:
      props.iconUrl = '/wallet-button/trust-wallet.svg';
      props.title = 'Trust';
      break;
    case WalletName.Phantom:
      props.iconUrl = '/wallet-button/phantom.svg';
      props.title = 'Phantom';
      break;
    case WalletName.Kresus:
      props.iconUrl = '/wallet-button/kresus.svg';
      props.title = 'Kresus';
      break;
    default:
      break;
  }
  if (variant === Variant.button) {
    return <ButtonTemplate {...props} />;
  }
  return <CardTemplate {...props} />;
};

export default WalletButton;
