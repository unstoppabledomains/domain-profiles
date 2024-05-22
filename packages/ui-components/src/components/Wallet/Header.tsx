import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import IconPlate from '@unstoppabledomains/ui-kit/icons/IconPlate';
import ShieldKeyHoleIcon from '@unstoppabledomains/ui-kit/icons/ShieldKeyHoleIcon';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getOwnerDomains} from '../../actions';
import {useWeb3Context} from '../../hooks';
import {useTranslationContext} from '../../lib';
import {notifyEvent} from '../../lib/error';
import {UnstoppableMessaging} from '../Chat';
import {DomainListModal} from '../Domain';
import DropDownMenu from '../DropDownMenu';
import Link from '../Link';
import type {WalletMode} from './index';

const AVATAR_SIZE = 120;
const AVATAR_PLACEHOLDER_SIZE = 132;

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
  optionsContainer: {
    display: 'flex',
    position: 'absolute',
    right: theme.spacing(-0.5),
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
  avatarUrl?: string;
  showMessages?: boolean;
  mode?: WalletMode;
  isLoaded: boolean;
};

export const Header: React.FC<Props> = ({
  address,
  domain,
  avatarUrl,
  showMessages,
  mode,
  isLoaded,
}) => {
  const {classes, cx} = useStyles();
  const {setWeb3Deps} = useWeb3Context();
  const [t] = useTranslationContext();

  // Menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Domain modal state
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [isDomains, setIsDomains] = useState(false);

  // load wallet domains
  useEffect(() => {
    if (!isDomains) {
      void handleRetrieveOwnerDomains();
    }
  }, []);

  const handleOptionsClick = () => {
    setIsMenuOpen(prev => !prev && !isMenuOpen);
  };

  const handleDomainsOpen = () => {
    setIsDomainModalOpen(true);
  };

  const handleDomainsClose = () => {
    setIsDomainModalOpen(false);
  };

  const handleDomainClicked = (v: string) => {
    handleDomainsClose();
    window.location.href = `${config.UD_ME_BASE_URL}/${v}`;
  };

  const handleRetrieveOwnerDomains = async (cursor?: number | string) => {
    const retData: {domains: string[]; cursor?: string} = {
      domains: [],
      cursor: undefined,
    };
    try {
      const domainData = await getOwnerDomains(address, cursor as string);
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
              <ShieldKeyHoleIcon />
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
        {avatarUrl ? (
          <img
            className={cx(classes.round, classes.portfolioHeaderIcon)}
            src={avatarUrl}
          />
        ) : (
          <IconPlate size={20} variant="info">
            <ShieldKeyHoleIcon />
          </IconPlate>
        )}
      </Box>
      <Box display="flex" alignItems="center">
        <Typography variant="h6">{domain || t('wallet.title')}</Typography>
      </Box>
      {isLoaded && (
        <Box className={classes.optionsContainer}>
          {showMessages && (
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
          onDomainsClicked={isDomains ? handleDomainsOpen : undefined}
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
          onClick={handleDomainClicked}
        />
      )}
    </Box>
  );
};
