import ChatIcon from '@mui/icons-material/ChatOutlined';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useFeatureFlags} from '../../actions/featureFlagActions';
import useUnstoppableMessaging from '../../components/Chat/hooks/useUnstoppableMessaging';
import {splitDomain} from '../../lib/domain/format';
import getImageUrl from '../../lib/domain/getImageUrl';
import useTranslationContext from '../../lib/i18n';
import type {SerializedPublicDomainProfileData} from '../../lib/types/domain';
import {DomainProfileKeys, DomainSuffixes} from '../../lib/types/domain';
import type {Web3Dependencies} from '../../lib/types/web3';
import FollowButton from './FollowButton';

const useStyles = makeStyles<{size: number}>()((theme: Theme, {size}) => ({
  popover: {
    pointerEvents: 'none',
  },
  popoverContent: {
    pointerEvents: 'auto',
  },
  round: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: `${size}px !important`,
    height: `${size}px !important`,
    borderRadius: '50%',
    border: `1px solid ${theme.palette.neutralShades[200]}`,
    backgroundColor: 'white',
    [theme.breakpoints.up('sm')]: {
      width: 12,
      height: 12,
    },
    marginRight: '2px',
  },
  actionContainer: {
    display: 'flex',
    marginLeft: theme.spacing(-1),
    marginRight: theme.spacing(-1),
    marginBottom: theme.spacing(-2),
  },
  actionIcon: {
    marginLeft: theme.spacing(0.5),
    color: theme.palette.neutralShades[600],
  },
  actionButton: {
    width: '100%',
    color: '#7d7d7d',
    borderColor: '#7d7d7d',
    marginTop: theme.spacing(2),
    '&:hover': {
      borderColor: 'initial',
    },
  },
  contentContainer: {
    width: '250px',
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
  avatar: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
    backgroundColor: 'white',
    border: '2px solid white',
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
  setWeb3Deps,
}) => {
  const [t] = useTranslationContext();
  const {classes} = useStyles({size});
  const [profileData, setProfileData] =
    useState<SerializedPublicDomainProfileData>();
  const {chatUser, setOpenChat} = useUnstoppableMessaging();
  const {data: featureFlags} = useFeatureFlags();
  const [authAddress, setAuthAddress] = useState<string>();
  const [authDomain, setAuthDomain] = useState<string>();
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const popoverId = `mouse-popover-${domain}`;
  const {extension} = splitDomain(domain);
  const avatarPath =
    extension === DomainSuffixes.Ens
      ? getImageUrl('/domains/ens-logo.svg')
      : `${config.UNSTOPPABLE_METADATA_ENDPOINT}/image-src/${domain}?withOverlay=false`;
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
        const r = await fetch(
          `${config.PROFILE.HOST_URL}/public/${domain}?fields=profile`,
        );
        const profileJSON = await r.json();
        if (profileJSON) {
          setProfileData(profileJSON);
        }
      } catch (e) {
        console.warn('error fetching profile data', String(e));
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

  return (
    <div
      aria-owns={isMouseOver ? popoverId : undefined}
      aria-haspopup="true"
      onMouseEnter={handlePopoverOpen}
      onMouseLeave={handlePopoverClose}
    >
      <a href={`${config.UD_ME_BASE_URL}/${domain}`}>
        <img className={classes.round} src={avatarPath} />
      </a>
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
              <Avatar
                onClick={handleViewProfile}
                src={avatarPath}
                className={classes.avatar}
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
            <div className={classes.actionContainer}>
              {setWeb3Deps && (
                <Grid container spacing={1}>
                  <Grid
                    item
                    sm={
                      featureFlags?.variations?.ecommerceServiceUsersEnableChat
                        ? 6
                        : 12
                    }
                  >
                    {authDomain &&
                      authAddress &&
                      authDomain.toLowerCase() !== domain.toLowerCase() && (
                        <div className={classes.actionButton}>
                          <FollowButton
                            domain={domain}
                            authDomain={authDomain}
                            authAddress={authAddress}
                            setWeb3Deps={setWeb3Deps}
                            color="#7d7d7d"
                          />
                        </div>
                      )}
                  </Grid>
                  {featureFlags?.variations
                    ?.ecommerceServiceUsersEnableChat && (
                    <Grid item sm={chatUser ? 6 : 12}>
                      {chatUser &&
                        authDomain &&
                        authAddress &&
                        authDomain.toLowerCase() !== domain.toLowerCase() && (
                          <Button
                            className={classes.actionButton}
                            variant="outlined"
                            onClick={() => setOpenChat(domain)}
                            startIcon={<ChatIcon />}
                            size="small"
                          >
                            {t('push.chat')}
                          </Button>
                        )}
                    </Grid>
                  )}
                </Grid>
              )}
            </div>
          </CardContent>
        </Card>
      </Popover>
    </div>
  );
};

export type DomainPreviewProps = {
  domain: string;
  size: number;
  setWeb3Deps?: (value: Web3Dependencies | undefined) => void;
};
