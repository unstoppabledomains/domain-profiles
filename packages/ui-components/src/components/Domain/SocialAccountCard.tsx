import CallMadeIcon from '@mui/icons-material/CallMade';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import RedditIcon from '@mui/icons-material/Reddit';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Badge from '@mui/material/Badge';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {capitalize} from 'lodash';
import React from 'react';

import DiscordIcon from '@unstoppabledomains/ui-kit/icons/Discord';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import CopyToClipboard from '../../components/CopyToClipboard';
import LensIcon from '../../components/Image/LensIcon';
import Link from '../../components/Link';
import useTranslationContext from '../../lib/i18n';
import type {SocialAccountUserInfo} from '../../lib/types/domain';
import {
  DomainProfileSocialMedia,
  DomainProfileSocialMediaAutoPopulated,
} from '../../lib/types/domain';
import FarcasterIcon from '../Image/FarcasterIcon';

const useStyles = makeStyles<void, 'actionIcon'>()(
  (theme: Theme, _params, classes) => ({
    cardContentRoot: {
      width: '100%',
      minHeight: 132,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: theme.spacing(2),
      '&:last-child': {
        paddingBottom: theme.spacing(2),
      },
      '&:hover': {
        [`& .${classes.actionIcon}`]: {
          opacity: 1,
          visibility: 'visible',
          right: theme.spacing(2),
          [theme.breakpoints.up('sm')]: {
            right: theme.spacing(1.5),
          },
        },
      },
      [theme.breakpoints.up('sm')]: {
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'initial',
        padding: theme.spacing(1.25, 2),
        '&:last-child': {
          paddingBottom: theme.spacing(1.25),
        },
      },
    },
    card: {
      position: 'relative',
      border: `1px solid ${theme.palette.neutralShades[200]}`,
      boxShadow: 'none',
      borderRadius: theme.shape.borderRadius,
      cursor: 'pointer',
      '&:hover': {
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.08)',
      },
    },
    accountIconContainer: {
      display: 'flex',
      [theme.breakpoints.up('sm')]: {
        marginRight: theme.spacing(2),
      },
    },
    smallIconContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      backgroundColor: theme.palette.neutralShades[100],
      borderRadius: '50%',
      width: 30,
      height: 30,
      filter: theme.palette.mode === 'dark' ? 'invert(1)' : undefined,
    },
    divider: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    twitterIcon: {
      fill: '#000',
    },
    redditIcon: {
      background: '#EC5428',
      borderRadius: '50%',
      padding: 4,
      fill: theme.palette.common.white,
    },
    youtubeIcon: {
      fill: '#EB3323',
    },
    googleIcon: {
      fill: '#4285F4',
    },
    discordIcon: {
      color: '#5865F2',
    },
    lensIcon: {
      backgroundColor: '#282e29',
      borderRadius: '50%',
    },
    telegramIcon: {
      fill: '#229ED9',
    },
    monochromeIcon: {
      backgroundColor: 'initial',
      fill: theme.palette.neutralShades[400],
      filter: 'grayscale(100%)',
    },
    metricValue: {
      minHeight: 20,
      [theme.breakpoints.up('sm')]: {
        minHeight: 'initial',
      },
    },
    metricValues: {
      minHeight: 20,
      paddingRight: 10,
      width: '100%',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',

      [theme.breakpoints.up('sm')]: {
        minHeight: 'initial',
        maxWidth: '90%',
        marginBottom: 0,
      },
      [theme.breakpoints.up('md')]: {
        maxWidth: 140,
      },
    },
    name: {
      fontWeight: theme.typography.fontWeightMedium,
      fontSize: '1.125rem',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      marginBottom: theme.spacing(0.5),
      [theme.breakpoints.up('sm')]: {
        maxWidth: '90%',
        marginBottom: 0,
      },
      [theme.breakpoints.up('md')]: {
        maxWidth: 120,
      },
    },
    actionIcon: {
      position: 'absolute',
      opacity: 0,
      visibility: 'hidden',
      transition: theme.transitions.create(['opacity', 'right']),
      top: theme.spacing(2),
      right: theme.spacing(1.5),
      [theme.breakpoints.up('sm')]: {
        right: theme.spacing(1),
      },
    },
    icon: {
      fontSize: 20,
    },
    iconGrey: {
      fill: theme.palette.neutralShades[600],
    },
    iconCentered: {
      [theme.breakpoints.up('sm')]: {
        top: '50%',
        transform: 'translateY(-50%)',
      },
    },
    socialIcon: {
      fontSize: 20,
    },
    link: {
      '&:hover': {
        textDecoration: 'none',
      },
    },
    socialContentWrapper: {
      width: '100%',
    },
    tooltipTitle: {
      fontWeight: theme.typography.fontWeightBold,
    },
    tooltipData: {},
    verifiedBadge: {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.getContrastText(theme.palette.background.default),
      fill: theme.palette.success.main,
      borderRadius: '50%',
    },
    nonVerifiedBadge: {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.getContrastText(theme.palette.background.default),
      fill: theme.palette.warning.main,
      borderRadius: '50%',
    },
  }),
);

export type SocialAccountCardProps = {
  socialInfo: SocialAccountUserInfo | null;
  handleClickToCopy: () => void;
  small?: boolean;
  monochrome?: boolean;
  verified?: boolean;
  verificationSupported?: boolean;
};

const SocialAccountCard: React.FC<SocialAccountCardProps> = ({
  socialInfo,
  handleClickToCopy,
  small,
  monochrome,
  verified,
  verificationSupported,
}) => {
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();

  const extractUserInfo = () => {
    switch (socialInfo?.kind) {
      case DomainProfileSocialMedia.Twitter: {
        return {
          Icon: TwitterIcon,
          displayName: `@${socialInfo.screenName}`,
          metricValues: [
            {name: t('profile.followers'), value: socialInfo.followersCount},
            {name: t('profile.following'), value: socialInfo.followingCount},
            {name: t('profile.listed'), value: socialInfo.listedCount},
            {name: t('profile.tweets'), value: socialInfo.tweetsCount},
          ],
          link: `https://www.twitter.com/${socialInfo.screenName}`,
        };
      }
      case DomainProfileSocialMedia.Discord: {
        return {
          Icon: DiscordIcon,
          displayName: socialInfo.userName,
          metricValue: '',
          metricName: '',
        };
      }
      case DomainProfileSocialMedia.Telegram: {
        return {
          Icon: TelegramIcon,
          displayName: socialInfo.userName,
          metricValue: '',
          metricName: '',
          link: `https://www.t.me/${socialInfo.userName}`,
        };
      }
      case DomainProfileSocialMedia.Reddit: {
        return {
          Icon: RedditIcon,
          displayName: `u/${socialInfo.name}`,
          metricValue: socialInfo.totalKarma,
          metricName: t('profile.karma'),
          link: `https://www.reddit.com/u/${socialInfo.name}`,
        };
      }
      case DomainProfileSocialMedia.YouTube: {
        return {
          Icon: YouTubeIcon,
          displayName: socialInfo.title,
          metricValue: socialInfo.subscriberCount,
          metricName: t('profile.subscribers'),
          link: socialInfo.channelUrl,
        };
      }
      case DomainProfileSocialMedia.Github: {
        return {
          Icon: GitHubIcon,
          displayName: socialInfo.userName,
          metricValue: '',
          metricName: '',
          link: `https://github.com/${socialInfo.userName}`,
        };
      }
      case DomainProfileSocialMedia.Linkedin: {
        return {
          Icon: LinkedInIcon,
          displayName: socialInfo.url,
          metricValue: '',
          metricName: '',
          link: socialInfo.url,
        };
      }
      case DomainProfileSocialMediaAutoPopulated.Lens: {
        return {
          Icon: LensIcon,
          displayName: socialInfo.url
            .replace('https://hey.xyz/u/', '')
            .replace('https://lenster.xyz/u/', '')
            .replaceAll('.lens', ''),
          metricValue: '',
          metricName: '',
          link: socialInfo.url.replaceAll('.lens', ''),
        };
      }
      case DomainProfileSocialMediaAutoPopulated.Farcaster: {
        return {
          Icon: FarcasterIcon,
          displayName: socialInfo.url.replaceAll('https://warpcast.com/', ''),
          metricValue: '',
          metricName: '',
          link: socialInfo.url,
        };
      }
    }
    return undefined;
  };

  const userInfo = extractUserInfo();
  if (!userInfo) {
    return null;
  }

  const getCondensedTooltip = () => {
    const metrics =
      userInfo?.metricValues?.map(m =>
        m.value ? `${m.name.toLocaleString()} ${m.value} ` : undefined,
      ) || [];
    return [userInfo?.displayName, ...metrics].map((v, i) => (
      <div>
        <Typography
          className={i === 0 ? classes.tooltipTitle : classes.tooltipData}
          variant="caption"
        >
          {socialInfo?.kind ? `${capitalize(socialInfo.kind)}: ` : ''}
          {v}
        </Typography>
      </div>
    ));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Wrapper: any = !userInfo?.link ? CopyToClipboard : Link;
  const wrapperProps = !userInfo?.link
    ? {stringToCopy: userInfo?.displayName, onCopy: handleClickToCopy}
    : {className: classes.link, external: true, to: userInfo?.link};

  return (
    <Wrapper {...wrapperProps}>
      {small ? (
        <Tooltip title={getCondensedTooltip()}>
          <div className={classes.smallIconContainer}>
            <Badge
              anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
              badgeContent={
                verified ? (
                  <CheckCircleIcon
                    fontSize="small"
                    className={cx(classes.verifiedBadge, {
                      [classes.monochromeIcon]: monochrome,
                    })}
                  />
                ) : (
                  verificationSupported && (
                    <ErrorOutlinedIcon
                      fontSize="small"
                      className={classes.nonVerifiedBadge}
                    />
                  )
                )
              }
            >
              <userInfo.Icon
                titleAccess={`${socialInfo?.kind} logo`}
                classes={{
                  root: cx(
                    classes.socialIcon,
                    classes[`${socialInfo?.kind}Icon`],
                    monochrome ? classes.monochromeIcon : undefined,
                  ),
                }}
              />
            </Badge>
          </div>
        </Tooltip>
      ) : (
        <Card className={classes.card}>
          <CardContent classes={{root: classes.cardContentRoot}}>
            {userInfo?.link ? (
              <CallMadeIcon
                className={cx(
                  classes.icon,
                  classes.iconGrey,
                  classes.actionIcon,
                  {[classes.iconCentered]: !userInfo?.metricName},
                )}
              />
            ) : (
              <ContentCopyIcon
                className={cx(
                  classes.icon,
                  classes.iconGrey,
                  classes.actionIcon,
                  {[classes.iconCentered]: !userInfo?.metricName},
                )}
              />
            )}
            <div className={classes.accountIconContainer}>
              <userInfo.Icon
                titleAccess={`${socialInfo?.kind} logo`}
                classes={{
                  root: cx(
                    classes.socialIcon,
                    classes[`${socialInfo?.kind}Icon`],
                  ),
                }}
              />
            </div>
            <div className={classes.socialContentWrapper}>
              <Typography
                title={userInfo?.displayName}
                variant="body2"
                className={classes.name}
              >
                {userInfo?.displayName}
              </Typography>
              {userInfo?.metricValues && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  className={classes.metricValues}
                  title={userInfo?.metricValues
                    .map(m => `${m.name.toLocaleString()} ${m.value} `)
                    .join('\r\n')}
                >
                  {userInfo?.metricValues
                    .map(m => `${m.name.toLocaleString()} ${m.value} `)
                    .join(',')}
                </Typography>
              )}
              {userInfo?.metricValue && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  className={classes.metricValue}
                >
                  {userInfo?.metricValue &&
                    `${userInfo?.metricValue.toLocaleString()} ${
                      userInfo?.metricName
                    }`}
                </Typography>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </Wrapper>
  );
};

export default SocialAccountCard;
