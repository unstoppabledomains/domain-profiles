import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import QueryString from 'qs';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import UnstoppableWalletIcon from '@unstoppabledomains/ui-kit/icons/UnstoppableWalletIcon';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getOwnerDomains} from '../../actions';
import {useWeb3Context} from '../../hooks';
import {useTranslationContext} from '../../lib';
import {notifyEvent} from '../../lib/error';
import {UnstoppableMessaging} from '../Chat';
import {DomainListModal} from '../Domain';
import DropDownMenu from '../DropDownMenu';
import Link from '../Link';
import Modal from '../Modal';
import RecoverySetup from './RecoverySetup';
import type {WalletMode} from './index';

const AVATAR_SIZE = 120;
const AVATAR_PLACEHOLDER_SIZE = 132;
const MAX_NAME_DISPLAY_CHARS = 22;

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    position: 'relative',
    minHeight: AVATAR_PLACEHOLDER_SIZE,
  },
  headerContainer: {
    backgroundImage: `linear-gradient(to left, #192b55c0, #192B55)`,
    borderTopRightRadius: theme.shape.borderRadius,
    borderTopLeftRadius: theme.shape.borderRadius,
    color: theme.palette.white,
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
    marginLeft: theme.spacing(16),
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
  },
  portfolioHeaderIcon: {
    width: '20px',
    height: '20px',
  },
  descriptionText: {
    color: theme.palette.white,
  },
  round: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: '50%',
    backgroundColor: theme.palette.white,
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
    border: `6px solid ${theme.palette.white}`,
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
    minWidth: AVATAR_PLACEHOLDER_SIZE,
    maxWidth: AVATAR_PLACEHOLDER_SIZE,
    height: AVATAR_PLACEHOLDER_SIZE,
    overflow: 'hidden',
  },
  icon: {
    '& > svg': {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      padding: theme.spacing(2),
      fill: theme.palette.white,
      color: theme.palette.white,
    },
  },
  logo: {
    color: theme.palette.primary.main,
  },
  optionsContainer: {
    display: 'flex',
    position: 'absolute',
    right: theme.spacing(-1.5),
    top: theme.spacing(-0.5),
  },
  learnMoreLink: {
    color: theme.palette.white,
    fontSize: theme.typography.body2.fontSize,
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
}) => {
  const {classes, cx} = useStyles();
  const {setWeb3Deps} = useWeb3Context();
  const [t] = useTranslationContext();

  // Menu state
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Modal states
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [isDomains, setIsDomains] = useState(false);

  // load wallet domains when an address is provided
  useEffect(() => {
    if (!isDomains) {
      void handleRetrieveOwnerDomains();
    }
  }, [address]);

  const handleOptionsClick = () => {
    setIsMenuOpen(prev => !prev && !isMenuOpen);
  };

  const handleDomainsClick = () => {
    setIsDomainModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleDomainClick = (v: string) => {
    handleDomainsClose();
    window.location.href = `${config.UD_ME_BASE_URL}/${v}`;
  };

  const handleSupportClick = () => {
    window.open(`${config.WALLETS.DOCUMENTATION_URL}`, '_blank');
    setIsMenuOpen(false);
  };

  const handleRecoveryKitClicked = () => {
    setIsRecoveryModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleGetDomainClick = () => {
    window.open(`${config.UNSTOPPABLE_WEBSITE_URL}/search`, '_blank');
    setIsMenuOpen(false);
  };

  const handleDomainsClose = () => {
    setIsDomainModalOpen(false);
  };

  const handleReload = () => {
    window.location.href = `${
      config.UD_ME_BASE_URL
    }/wallet?${QueryString.stringify(
      {email: emailAddress},
      {skipNulls: true},
    )}`;
  };

  const handleRetrieveOwnerDomains = async (cursor?: number | string) => {
    const retData: {domains: string[]; cursor?: string} = {
      domains: [],
      cursor: undefined,
    };
    try {
      // load domains that are contained by this Unstoppable Wallet instance
      const domainData = await getOwnerDomains(
        address,
        cursor as string,
        true,
        true,
      );
      if (domainData) {
        retData.domains = domainData.data.map(f => f.domain);
        retData.cursor = domainData.meta.pagination.cursor;
        if (retData.domains.length > 0) {
          // set a flag that other domains exist in portfolio
          setIsDomains(true);
        }
      }
    } catch (e) {
      notifyEvent(e, 'error', 'Profile', 'Fetch', {
        msg: 'error retrieving owner domains',
      });
    }
    return retData;
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
            <Box className={classes.icon}>
              <UnstoppableWalletIcon />
            </Box>
          </Box>
        </Box>
      </Box>
      <Box className={cx(classes.headerContainer)}>
        <Box className={classes.descriptionContainer}>
          <Typography variant="body2" className={classes.descriptionText}>
            {t('manage.cryptoWalletDescription')}
          </Typography>
          <Link
            className={classes.learnMoreLink}
            external={true}
            to={config.WALLETS.LANDING_PAGE_URL}
          >
            {t('profile.learnMore')}
          </Link>
        </Box>
      </Box>
    </Box>
  ) : (
    <Box className={classes.portfolioHeaderContainer}>
      <Box display="flex" mr={1}>
        {isLoaded && isFetching ? (
          <Tooltip title={t('wallet.refreshingData')}>
            <CircularProgress
              size="20px"
              className={classes.portfolioHeaderIcon}
            />
          </Tooltip>
        ) : avatarUrl && domain ? (
          <Tooltip title={domain}>
            <img
              className={cx(classes.round, classes.portfolioHeaderIcon)}
              src={avatarUrl}
            />
          </Tooltip>
        ) : (
          <UnstoppableWalletIcon
            className={cx(classes.portfolioHeaderIcon, classes.logo)}
          />
        )}
      </Box>
      <Box display="flex" alignItems="center">
        <Typography variant="h6">
          {domain && domain.length <= MAX_NAME_DISPLAY_CHARS
            ? domain
            : t('wallet.title')}
        </Typography>
      </Box>
      {isLoaded && (
        <Box className={classes.optionsContainer}>
          {showMessages && !isMobile && (
            <UnstoppableMessaging
              address={address}
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
          onGetDomainClicked={!isDomains ? handleGetDomainClick : undefined}
          onDomainsClicked={isDomains ? handleDomainsClick : undefined}
          onSupportClicked={handleSupportClick}
          onRecoveryLinkClicked={handleRecoveryKitClicked}
          onReload={handleReload}
        />
      )}
      {isDomainModalOpen && (
        <DomainListModal
          id="domainMenuList"
          title={t('manage.otherDomains')}
          subtitle={t('manage.otherDomainsDescription')}
          retrieveDomains={handleRetrieveOwnerDomains}
          open={isDomainModalOpen}
          setWeb3Deps={setWeb3Deps}
          onClose={handleDomainsClose}
          onClick={handleDomainClick}
        />
      )}
      {isRecoveryModalOpen && (
        <Box>
          <Modal
            title={t('wallet.recoveryKit')}
            open={isRecoveryModalOpen}
            onClose={() => setIsRecoveryModalOpen(false)}
          >
            <RecoverySetup accessToken={accessToken} />
          </Modal>
        </Box>
      )}
    </Box>
  );
};
