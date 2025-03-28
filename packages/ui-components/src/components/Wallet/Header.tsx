import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import type {BadgeProps} from '@mui/material/Badge';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {styled, useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useSnackbar} from 'notistack';
import QueryString from 'qs';
import React, {useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useUnstoppableMessaging} from '../../hooks';
import {isChromeStorageSupported} from '../../hooks/useChromeStorage';
import {useTranslationContext} from '../../lib';
import {UnstoppableMessaging} from '../Chat';
import DropDownMenu from '../DropDownMenu';
import {DomainProfileModal} from '../Manage';
import WalletIcon from './WalletIcon';
import type {WalletMode} from './index';

const AVATAR_SIZE = 120;
const AVATAR_PLACEHOLDER_SIZE = 132;
const AVATAR_MOBILE_OFFSET = 50;
const MAX_NAME_DISPLAY_CHARS = 30;
const MAX_NAME_DISPLAY_CHARS_MOBILE = 15;

const useStyles = makeStyles<{isMobile: boolean}>()((
  theme: Theme,
  {isMobile},
) => {
  const avatarSizeOffset = isMobile ? AVATAR_MOBILE_OFFSET : 0;
  return {
    root: {
      position: 'relative',
      minHeight: AVATAR_PLACEHOLDER_SIZE - avatarSizeOffset,
    },
    headerContainer: {
      background: theme.palette.heroText,
      borderTopRightRadius: theme.shape.borderRadius,
      borderTopLeftRadius: theme.shape.borderRadius,
      color: theme.palette.getContrastText(theme.palette.primary.main),
    },
    iconContainer: {
      position: 'absolute',
      top: theme.spacing(-1),
      left: theme.spacing(-1),
      flexWrap: 'nowrap',
      flexDirection: 'column',
      [theme.breakpoints.up('sm')]: {
        flexDirection: 'row',
      },
    },
    descriptionContainer: {
      marginLeft: isMobile ? theme.spacing(10) : theme.spacing(16),
      padding: theme.spacing(1),
    },
    portfolioHeaderContainer: {
      display: 'flex',
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing(3),
      position: 'relative',
      width: '100%',
      [theme.breakpoints.down('sm')]: {
        width: 'calc(100vw - 48px)',
      },
    },
    portfolioHeaderIcon: {
      width: '20px',
      height: '20px',
    },
    descriptionText: {
      color: theme.palette.neutralShades[50],
    },
    round: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: AVATAR_SIZE - avatarSizeOffset,
      height: AVATAR_SIZE - avatarSizeOffset,
      borderRadius: '50%',
      backgroundColor: theme.palette.background.paper,
      zIndex: 1,
      [theme.breakpoints.up('sm')]: {
        flex: '1 0 auto',
      },
    },
    pictureContainer: {
      display: 'flex',
      justifyContent: 'center',
    },
    imageWrapper: {
      position: 'relative',
      backgroundColor: theme.palette.secondary.main,
      borderRadius: '50%',
      border: `6px solid ${theme.palette.background.paper}`,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'rgba(0, 0, 0, 0.16)',
        opacity: 0,
        transition: theme.transitions.create('opacity'),
      },
    },
    imagePlaceholderWrapper: {
      minWidth: AVATAR_PLACEHOLDER_SIZE - avatarSizeOffset,
      maxWidth: AVATAR_PLACEHOLDER_SIZE - avatarSizeOffset,
      height: AVATAR_PLACEHOLDER_SIZE - avatarSizeOffset,
      overflow: 'hidden',
    },

    optionsContainer: {
      display: 'flex',
      position: 'absolute',
      right: theme.spacing(-3),
      top: theme.spacing(-0.5),
      [theme.breakpoints.up('sm')]: {
        right: theme.spacing(-1.5),
      },
    },
    learnMoreLink: {
      color: theme.palette.neutralShades[50],
      fontSize: theme.typography.body2.fontSize,
    },
    clickable: {
      cursor: 'pointer',
    },
    modalTitleStyle: {
      color: 'inherit',
      alignSelf: 'center',
    },
  };
});

const StyledBadge = styled(Badge)<BadgeProps>(({theme}) => ({
  '& .MuiBadge-badge': {
    border: `1px solid ${theme.palette.background.paper}`,
  },
}));

type Props = {
  address: string;
  domain?: string;
  accessToken?: string;
  avatarUrl?: string;
  emailAddress?: string;
  showMessages?: boolean;
  mode?: WalletMode;
  isLoaded: boolean;
  isFetching?: boolean;
  fullScreenModals?: boolean;
  onHeaderClick?: () => void;
  onSettingsClick?: () => void;
  onSidePanelClick?: () => void;
  onMessagesClick?: () => void;
  onLogout?: () => void;
  onDisconnect?: () => void;
  onMessagePopoutClick?: (address?: string) => void;
  onClaimWalletClick?: () => void;
  onSecurityCenterClicked?: () => void;
};

export const Header: React.FC<Props> = ({
  address,
  domain,
  accessToken,
  avatarUrl,
  emailAddress,
  showMessages,
  mode,
  isLoaded,
  isFetching,
  fullScreenModals,
  onHeaderClick,
  onLogout,
  onDisconnect,
  onSettingsClick,
  onSidePanelClick,
  onMessagesClick,
  onMessagePopoutClick,
  onClaimWalletClick,
  onSecurityCenterClicked,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {classes, cx} = useStyles({isMobile});
  const [t] = useTranslationContext();
  const {setOpenChat, isChatReady} = useUnstoppableMessaging();
  const {enqueueSnackbar} = useSnackbar();

  // Menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Modal states
  const [domainToManage, setDomainToManage] = useState<string>();

  const handleOptionsClick = () => {
    setIsMenuOpen(prev => !prev && !isMenuOpen);
  };

  const handleDisconnect = () => {
    if (onDisconnect) {
      onDisconnect();
    }
    setIsMenuOpen(false);
  };

  const handleSecurityCenterClicked = () => {
    if (!onSecurityCenterClicked) {
      return;
    }
    onSecurityCenterClicked();
    setIsMenuOpen(false);
  };

  const handleSupportClicked = () => {
    window.open(config.WALLETS.DOCUMENTATION_URL, '_blank');
    setIsMenuOpen(false);
  };

  const handleMessagingClicked = () => {
    if (onMessagesClick) {
      onMessagesClick();
    } else {
      setOpenChat(t('push.messages'));
    }
    setIsMenuOpen(false);
  };

  const handleUpdateSuccess = () => {
    enqueueSnackbar(t('manage.updatedDomainSuccess'), {variant: 'success'});
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    window.location.href = `${
      theme.wallet.type === 'udme'
        ? config.UD_ME_BASE_URL
        : config.UP_IO_BASE_URL
    }/wallet?${QueryString.stringify(
      {email: emailAddress},
      {skipNulls: true},
    )}`;
  };

  return mode === 'basic' ? (
    <Box className={classes.root}>
      <Box className={classes.iconContainer}>
        <Box className={classes.pictureContainer}>
          <Box
            className={cx(
              classes.round,
              classes.imageWrapper,
              classes.imagePlaceholderWrapper,
            )}
          >
            <WalletIcon size={AVATAR_SIZE} />
          </Box>
        </Box>
      </Box>
      <Box className={cx(classes.headerContainer)}>
        <Box className={classes.descriptionContainer}>
          <Typography variant="body2" className={classes.descriptionText}>
            {isMobile
              ? t('manage.cryptoWalletDescriptionMobile')
              : t('manage.cryptoWalletDescription')}
          </Typography>
        </Box>
      </Box>
    </Box>
  ) : (
    <Box className={classes.portfolioHeaderContainer}>
      <Box
        display="flex"
        mr={1}
        onClick={onHeaderClick}
        className={classes.clickable}
      >
        {isLoaded && isFetching ? (
          <Tooltip title={t('wallet.refreshingData')}>
            <CircularProgress
              size="20px"
              className={classes.portfolioHeaderIcon}
            />
          </Tooltip>
        ) : avatarUrl && domain ? (
          <Tooltip
            title={
              onDisconnect ? t('header.domainConnected', {domain}) : domain
            }
          >
            <StyledBadge
              color="success"
              variant="dot"
              overlap="circular"
              invisible={onDisconnect === undefined}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
            >
              <img
                className={cx(classes.round, classes.portfolioHeaderIcon)}
                src={avatarUrl}
              />
            </StyledBadge>
          </Tooltip>
        ) : (
          <Tooltip title={onDisconnect ? t('header.connected') : ''}>
            <StyledBadge
              color="success"
              variant="dot"
              invisible={onDisconnect === undefined}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
            >
              <WalletIcon size={20} />
            </StyledBadge>
          </Tooltip>
        )}
      </Box>
      <Box
        display="flex"
        alignItems="center"
        onClick={onHeaderClick}
        className={classes.clickable}
      >
        <Typography variant="h6">
          {domain &&
          domain.length <=
            (isMobile ? MAX_NAME_DISPLAY_CHARS_MOBILE : MAX_NAME_DISPLAY_CHARS)
            ? domain
            : theme.wallet.titleShort}
        </Typography>
      </Box>
      {isLoaded && (
        <Box className={classes.optionsContainer}>
          {showMessages && !!accessToken && (
            <UnstoppableMessaging
              address={address}
              silentOnboard={!isChromeStorageSupported('local')}
              hideIcon={true}
              onPopoutClick={onMessagePopoutClick}
              disableSupportBubble
              inheritStyle
            />
          )}
          <IconButton size="small" onClick={handleOptionsClick}>
            <MoreVertOutlinedIcon />
          </IconButton>
        </Box>
      )}
      {isMenuOpen && (
        <DropDownMenu
          isOwner={true}
          authDomain={domain}
          marginTop={30}
          onMessagingClicked={
            showMessages && isChatReady ? handleMessagingClicked : undefined
          }
          onSettingsClicked={accessToken ? onSettingsClick : undefined}
          onSidePanelClicked={accessToken ? onSidePanelClick : undefined}
          onSecurityCenterClicked={
            accessToken && onSecurityCenterClicked
              ? handleSecurityCenterClicked
              : undefined
          }
          onLogout={handleLogout}
          onDisconnect={
            onDisconnect && !!accessToken ? handleDisconnect : undefined
          }
          onHideMenu={() => setIsMenuOpen(false)}
          onSupportClicked={handleSupportClicked}
          onClaimWalletClicked={onClaimWalletClick}
          hideLogout={!accessToken}
          hideProfile={!!onSecurityCenterClicked}
        />
      )}
      {domainToManage && (
        <DomainProfileModal
          domain={domainToManage}
          address={address}
          open={true}
          fullScreen={fullScreenModals}
          onClose={() => setDomainToManage(undefined)}
          onUpdate={handleUpdateSuccess}
        />
      )}
    </Box>
  );
};
