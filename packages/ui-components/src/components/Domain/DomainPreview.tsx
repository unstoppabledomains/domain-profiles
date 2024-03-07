import ChatIcon from '@mui/icons-material/ChatOutlined';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileData} from '../../actions';
import {splitDomain} from '../../lib/domain/format';
import getImageUrl from '../../lib/domain/getImageUrl';
import {notifyEvent} from '../../lib/error';
import useTranslationContext from '../../lib/i18n';
import type {SerializedPublicDomainProfileData} from '../../lib/types/domain';
import {
  DomainFieldTypes,
  DomainProfileKeys,
  DomainSuffixes,
  Web2SuffixesList,
} from '../../lib/types/domain';
import type {Web3Dependencies} from '../../lib/types/web3';
import ChipControlButton from '../ChipControlButton';
import FollowButton from './FollowButton';

const useStyles = makeStyles<{size: number}>()((theme: Theme, {size}) => ({
  popover: {
    pointerEvents: 'none',
  },
  popoverContent: {
    pointerEvents: 'auto',
  },
  actionContainer: {
    display: 'flex',
    marginLeft: theme.spacing(-1),
    marginRight: theme.spacing(-1),
    marginBottom: theme.spacing(-2),
    marginTop: theme.spacing(2),
  },
  contentContainer: {
    width: '280px',
    marginTop: theme.spacing(-2.5),
  },
  footerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  contentItem: {
    display: 'flex',
    marginBottom: theme.spacing(1),
  },
  followerCount: {
    color: theme.palette.neutralShades[600],
    marginRight: theme.spacing(1),
  },
  avatarMain: {
    color: theme.palette.primary.main,
    backgroundColor: 'white',
    border: '2px solid white',
    borderRadius: '50%',
    height: `${size}px`,
    width: `${size}px`,
    cursor: 'pointer',
  },
  avatarCard: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
    backgroundColor: 'white',
    border: '2px solid white',
    borderRadius: '50%',
    cursor: 'pointer',
    width: '75px',
    height: '75px',
  },
  domainName: {
    cursor: 'pointer',
  },
  greyBg: {
    backgroundColor: '#F6F6F6',
  },
}));

export const DomainPreview: React.FC<DomainPreviewProps> = ({
  domain,
  size,
  chatUser,
  avatarPath,
  avatarDescription,
  secondaryDescription,
  setOpenChat,
  setWeb3Deps,
}) => {
  const [t] = useTranslationContext();
  const {classes} = useStyles({size});
  const [profileData, setProfileData] =
    useState<SerializedPublicDomainProfileData>();
  const [authAddress, setAuthAddress] = useState<string>();
  const [authDomain, setAuthDomain] = useState<string>();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const popoverId = `mouse-popover-${domain}`;
  const {extension} = splitDomain(domain);
  const normalizedAvatarPath =
    avatarPath ||
    (extension === DomainSuffixes.Ens
      ? getImageUrl('/domains/ens-logo.svg')
      : Web2SuffixesList.includes(extension)
      ? getImageUrl('/domains/dns-logo.svg')
      : `${config.UNSTOPPABLE_METADATA_ENDPOINT}/image-src/${domain}?withOverlay=false`);
  const isMouseOver = Boolean(anchorEl);

  // read from local storage on page load
  useEffect(() => {
    setAuthAddress(
      localStorage.getItem(DomainProfileKeys.AuthAddress) || undefined,
    );
    setAuthDomain(
      localStorage.getItem(DomainProfileKeys.AuthDomain) || undefined,
    );
  }, []);

  // fetch profile data only when popup is requested
  useEffect(() => {
    if (!isMouseOver) {
      return;
    }
    const fetchData = async () => {
      try {
        const profileJSON = await getProfileData(domain, [
          DomainFieldTypes.Profile,
        ]);
        if (profileJSON) {
          setProfileData(profileJSON);
        }
      } catch (e) {
        notifyEvent(e, 'warning', 'PROFILE', 'Fetch', {
          msg: 'error fetching profile data',
        });
      }
    };
    void fetchData();
  }, [domain, isMouseOver]);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleViewProfile = () => {
    window.location.href = `${config.UD_ME_BASE_URL}/${domain}`;
  };

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src =
      extension === DomainSuffixes.Ens
        ? getImageUrl('/domains/ens-logo.svg')
        : Web2SuffixesList.includes(extension)
        ? getImageUrl('/domains/dns-logo.svg')
        : `${config.UNSTOPPABLE_METADATA_ENDPOINT}/image-src/${domain}?withOverlay=false`;
  };

  return (
    <Box
      aria-owns={isMouseOver ? popoverId : undefined}
      aria-haspopup="true"
      display="flex"
      alignItems="center"
      onMouseEnter={handlePopoverOpen}
      onMouseLeave={handlePopoverClose}
    >
      <img
        src={normalizedAvatarPath}
        onClick={handleViewProfile}
        onError={handleImgError}
        className={classes.avatarMain}
        data-testid="domain-preview-main-img"
      />
      {avatarDescription}
      <Popover
        id={popoverId}
        open={isMouseOver}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        className={classes.popover}
        classes={{
          paper: classes.popoverContent,
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Card>
          <CardHeader
            avatar={
              <img
                onClick={handleViewProfile}
                onError={handleImgError}
                src={normalizedAvatarPath}
                className={classes.avatarCard}
              />
            }
            title={
              <Typography
                onClick={handleViewProfile}
                className={classes.domainName}
                variant="h6"
              >
                {domain}
              </Typography>
            }
            subheader={profileData?.profile?.displayName}
          />
          <CardContent>
            <div className={classes.contentContainer}>
              <div className={classes.contentItem}>
                <Typography variant="body2">
                  {profileData?.profile?.description}
                </Typography>
              </div>
              <div className={classes.contentItem}>{secondaryDescription}</div>
              <div className={classes.footerContainer}>
                <div>
                  <Typography
                    variant="caption"
                    className={classes.followerCount}
                  >
                    <b>{profileData?.social?.followingCount || 0}</b>{' '}
                    {t('profile.following')}
                  </Typography>
                  <Typography
                    variant="caption"
                    className={classes.followerCount}
                  >
                    <b>{profileData?.social?.followerCount || 0}</b>{' '}
                    {t('profile.followers')}
                  </Typography>
                </div>
              </div>
            </div>
            {setWeb3Deps && (
              <Box className={classes.actionContainer}>
                <ChipControlButton
                  onClick={handleViewProfile}
                  icon={<PermIdentityOutlinedIcon />}
                  label={t('profile.viewProfile')}
                  sx={{marginRight: 1}}
                />
                {authDomain &&
                  authAddress &&
                  authDomain.toLowerCase() !== domain.toLowerCase() && (
                    <FollowButton
                      domain={domain}
                      authDomain={authDomain}
                      authAddress={authAddress}
                      setWeb3Deps={setWeb3Deps}
                    />
                  )}
                {chatUser &&
                  setOpenChat &&
                  authDomain &&
                  authAddress &&
                  authDomain.toLowerCase() !== domain.toLowerCase() && (
                    <ChipControlButton
                      onClick={() => setOpenChat(domain)}
                      icon={<ChatIcon />}
                      label={t('push.chat')}
                      sx={{marginLeft: 1}}
                    />
                  )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Popover>
    </Box>
  );
};

export type DomainPreviewProps = {
  domain: string;
  size: number;
  chatUser?: string;
  avatarPath?: string;
  avatarDescription?: React.ReactNode;
  secondaryDescription?: React.ReactNode;
  setOpenChat?: (s?: string) => void;
  setWeb3Deps?: (value: Web3Dependencies | undefined) => void;
};
