import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useSnackbar} from 'notistack';
import QueryString from 'qs';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import IconPlate from '@unstoppabledomains/ui-kit/icons/IconPlate';
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
import {DomainProfileModal} from '../Manage';
import Modal from '../Modal';
import ReceiveDomainModal from './ReceiveDomainModal';
import RecoverySetupModal from './RecoverySetupModal';
import type {WalletMode} from './index';

const AVATAR_SIZE = 120;
const AVATAR_PLACEHOLDER_SIZE = 132;
const MAX_NAME_DISPLAY_CHARS = 30;
const MAX_NAME_DISPLAY_CHARS_MOBILE = 15;

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
  clickable: {
    cursor: 'pointer',
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
  onHeaderClick?: () => void;
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
  onHeaderClick,
}) => {
  const {classes, cx} = useStyles();
  const {setWeb3Deps} = useWeb3Context();
  const [t] = useTranslationContext();
  const {enqueueSnackbar} = useSnackbar();

  // Menu state
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Modal states
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isDomainAddModalOpen, setIsDomainAddModalOpen] = useState(false);
  const [isDomainListModalOpen, setIsDomainListModalOpen] = useState(false);
  const [domainToManage, setDomainToManage] = useState<string>();
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
    setIsDomainListModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleDomainClick = (v: string) => {
    handleDomainsClose();
    setDomainToManage(v);
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
    setIsDomainAddModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleDomainsClose = () => {
    setIsDomainListModalOpen(false);
  };

  const handleUpdateSuccess = () => {
    enqueueSnackbar(t('manage.updatedDomainSuccess'), {variant: 'success'});
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
              <IconPlate size={125} variant="info">
                <UnstoppableWalletIcon />
              </IconPlate>
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
            : t('wallet.titleShort')}
        </Typography>
      </Box>
      {isLoaded && (
        <Box className={classes.optionsContainer}>
          {showMessages && (
            <UnstoppableMessaging
              address={address}
              silentOnboard={true}
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
      {isDomainListModalOpen && (
        <DomainListModal
          id="domainMenuList"
          title={t('manage.otherDomains')}
          subtitle={t('manage.otherDomainsDescription')}
          retrieveDomains={handleRetrieveOwnerDomains}
          open={isDomainListModalOpen}
          setWeb3Deps={setWeb3Deps}
          onClose={handleDomainsClose}
          onClick={handleDomainClick}
        />
      )}
      {domainToManage && (
        <DomainProfileModal
          domain={domainToManage}
          address={address}
          open={true}
          onClose={() => setDomainToManage(undefined)}
          onUpdate={handleUpdateSuccess}
        />
      )}
      {isDomainAddModalOpen && (
        <Modal
          title={t('wallet.addDomain')}
          open={isDomainAddModalOpen}
          onClose={() => setIsDomainAddModalOpen(false)}
        >
          <ReceiveDomainModal />
        </Modal>
      )}
      {isRecoveryModalOpen && (
        <Modal
          title={t('wallet.recoveryKit')}
          open={isRecoveryModalOpen}
          onClose={() => setIsRecoveryModalOpen(false)}
        >
          <RecoverySetupModal accessToken={accessToken} />
        </Modal>
      )}
    </Box>
  );
};
