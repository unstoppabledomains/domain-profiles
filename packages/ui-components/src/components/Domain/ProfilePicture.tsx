import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import ProfilePlaceholder from '@unstoppabledomains/ui-kit/icons/ProfilePlaceholder';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import useTranslationContext from '../../lib/i18n';
import ProfileQrCode from './ProfileQrCode';

export const PROFILE_PICTURE_SIZE_DESKTOP = 172;
export const PROFILE_PICTURE_SIZE_MOBILE = 132;

const useStyles = makeStyles()((theme: Theme) => ({
  round: {
    zIndex: 1,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: PROFILE_PICTURE_SIZE_MOBILE,
    height: PROFILE_PICTURE_SIZE_MOBILE,
    borderRadius: '50%',
    border: `6px solid ${theme.palette.background.default} !important`,
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.up('sm')]: {
      width: PROFILE_PICTURE_SIZE_DESKTOP,
      height: PROFILE_PICTURE_SIZE_DESKTOP,
    },
  },
  mainContainer: {
    position: 'relative',
    width: PROFILE_PICTURE_SIZE_MOBILE,
    height: PROFILE_PICTURE_SIZE_MOBILE,
    [theme.breakpoints.up('sm')]: {
      width: PROFILE_PICTURE_SIZE_DESKTOP,
      height: PROFILE_PICTURE_SIZE_DESKTOP,
    },
  },
  udBlueBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    zIndex: 2,
    cursor: 'pointer',
    img: {
      width: 30,
      [theme.breakpoints.up('sm')]: {
        width: 40,
      },
    },
  },
  udBlueTooltip: {
    maxWidth: 360,
    padding: theme.spacing(1, 2),
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  udBlueTooltipText: {
    fontSize: 13,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: 1.53,
  },
  udBlueTooltipLink: {
    fontSize: 13,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: 1.53,
    color: theme.palette.neutralShades[400],
    textDecorationLine: 'underline',
  },
  theCard: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  theCardShow: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    transformStyle: 'preserve-3d',
    transition: 'all .2s ease',
    transform: 'rotateY(180deg)',
    [theme.breakpoints.up('md')]: {
      position: 'relative',
      width: PROFILE_PICTURE_SIZE_DESKTOP,
    },
  },
  theCardHover: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    transformStyle: 'preserve-3d',
    transition: 'all .2s ease',
    '&:hover': {
      transform: 'rotateY(180deg)',
    },
    [theme.breakpoints.up('md')]: {
      position: 'relative',
      width: PROFILE_PICTURE_SIZE_DESKTOP,
    },
  },
  theFront: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItem: 'center',
    [theme.breakpoints.up('md')]: {
      justifyContent: 'start',
    },
  },
  theBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItem: 'center',
    transform: 'rotateY(180deg)',
    [theme.breakpoints.up('md')]: {
      justifyContent: 'start',
    },
  },
  profilePlaceholderContainer: {
    backgroundColor: theme.palette.primary.main,
  },
  profilePlaceholder: {
    fontSize: PROFILE_PICTURE_SIZE_MOBILE,
    [theme.breakpoints.up('md')]: {
      fontSize: `calc(${PROFILE_PICTURE_SIZE_DESKTOP}px + 4px)`,
    },
  },
  nftPFPstyle: {
    clipPath:
      'polygon(92.32051% 40%, 93.79385% 43.1596%, 94.69616% 46.52704%, 95% 50%, 94.69616% 53.47296%, 93.79385% 56.8404%, 92.32051% 60%, 79.82051% 81.65064%, 77.82089% 84.50639%, 75.35575% 86.97152%, 72.5% 88.97114%, 69.3404% 90.44449%, 65.97296% 91.34679%, 62.5% 91.65064%, 37.5% 91.65064%, 34.02704% 91.34679%, 30.6596% 90.44449%, 27.5% 88.97114%, 24.64425% 86.97152%, 22.17911% 84.50639%, 20.17949% 81.65064%, 7.67949% 60%, 6.20615% 56.8404%, 5.30384% 53.47296%, 5% 50%, 5.30384% 46.52704%, 6.20615% 43.1596%, 7.67949% 40%, 20.17949% 18.34936%, 22.17911% 15.49361%, 24.64425% 13.02848%, 27.5% 11.02886%, 30.6596% 9.55551%, 34.02704% 8.65321%, 37.5% 8.34936%, 62.5% 8.34936%, 65.97296% 8.65321%, 69.3404% 9.55551%, 72.5% 11.02886%, 75.35575% 13.02848%, 77.82089% 15.49361%, 79.82051% 18.34936%)',
    position: 'relative',
  },
  nftPFPstyleBorder: {
    clipPath:
      'polygon(92.32051% 40%, 93.79385% 43.1596%, 94.69616% 46.52704%, 95% 50%, 94.69616% 53.47296%, 93.79385% 56.8404%, 92.32051% 60%, 79.82051% 81.65064%, 77.82089% 84.50639%, 75.35575% 86.97152%, 72.5% 88.97114%, 69.3404% 90.44449%, 65.97296% 91.34679%, 62.5% 91.65064%, 37.5% 91.65064%, 34.02704% 91.34679%, 30.6596% 90.44449%, 27.5% 88.97114%, 24.64425% 86.97152%, 22.17911% 84.50639%, 20.17949% 81.65064%, 7.67949% 60%, 6.20615% 56.8404%, 5.30384% 53.47296%, 5% 50%, 5.30384% 46.52704%, 6.20615% 43.1596%, 7.67949% 40%, 20.17949% 18.34936%, 22.17911% 15.49361%, 24.64425% 13.02848%, 27.5% 11.02886%, 30.6596% 9.55551%, 34.02704% 8.65321%, 37.5% 8.34936%, 62.5% 8.34936%, 65.97296% 8.65321%, 69.3404% 9.55551%, 72.5% 11.02886%, 75.35575% 13.02848%, 77.82089% 15.49361%, 79.82051% 18.34936%)',
    position: 'relative',
    height: `calc(${PROFILE_PICTURE_SIZE_DESKTOP}px + 12px)`,
    width: `calc(${PROFILE_PICTURE_SIZE_DESKTOP}px + 12px)`,
    [theme.breakpoints.down('sm')]: {
      width: `calc(${PROFILE_PICTURE_SIZE_MOBILE}px + 12px)`,
      height: `calc(${PROFILE_PICTURE_SIZE_MOBILE}px + 12px)`,
    },
  },
}));

export type ProfilePictureProps = {
  src?: string | null;
  domain: string;
  imageType: string | undefined;
  handleUploadError?: (message: string) => void;
  hasUdBlueBadge?: boolean;
};

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  src,
  domain,
  imageType,
  hasUdBlueBadge,
}) => {
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();
  const [isNft, setIsNft] = useState<boolean>(false);

  useEffect(() => {
    setIsNft(() => imageType === 'onChain');
  });

  const badgeTooltip = (
    <>
      <Typography className={classes.udBlueTooltipText}>
        {t('profile.udBlueTooltip')}
      </Typography>
      <a
        href={`${config.UNSTOPPABLE_WEBSITE_URL}/products/blue`}
        className={classes.udBlueTooltipLink}
        target="_blank"
        rel="noreferrer"
      >
        {t('profile.learnMore')}
      </a>
    </>
  );
  return (
    <div className={classes.mainContainer} data-testid={'profile-picture'}>
      {hasUdBlueBadge && (
        <Box className={classes.udBlueBadge}>
          <Tooltip
            arrow
            title={badgeTooltip}
            placement="right"
            classes={{tooltip: classes.udBlueTooltip}}
          >
            <img src="https://storage.googleapis.com/unstoppable-client-assets/images/ud-blue/shield.png" />
          </Tooltip>
        </Box>
      )}
      <div>
        <div className={classes.theCardHover} data-testid={'avatar'}>
          {src ? (
            <>
              <div className={cx(classes.theBack)}>
                <div>
                  <ProfileQrCode
                    domain={domain}
                    className={cx(
                      'profile-qr-code',
                      classes.round,
                      isNft ? classes.nftPFPstyleBorder : '',
                    )}
                  />
                </div>
              </div>
              <div className={classes.theFront}>
                <div
                  data-testid={isNft ? 'hexagonBorder' : 'imageBorder'}
                  className={cx(
                    'pfp',
                    classes.round,
                    isNft ? classes.nftPFPstyleBorder : '',
                  )}
                >
                  <Avatar
                    className={cx(
                      classes.round,
                      isNft ? classes.nftPFPstyle : '',
                    )}
                    src={src}
                    alt={t('manage.domainProfileImage')}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={classes.theFront}>
                <div
                  data-testid={isNft ? 'hexagonBorder' : 'imageBorder'}
                  className={cx(
                    classes.round,
                    classes.profilePlaceholderContainer,
                  )}
                >
                  <ProfilePlaceholder
                    className={cx(classes.profilePlaceholder)}
                    data-testid={'profile-placeholder'}
                  />
                </div>
              </div>
              <div className={cx(classes.theBack)}>
                <div>
                  <ProfileQrCode
                    domain={domain}
                    className={cx('profile-qr-code', classes.round)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePicture;
