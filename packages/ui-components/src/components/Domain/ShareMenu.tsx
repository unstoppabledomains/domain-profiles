import LinkIcon from '@mui/icons-material/Link';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import ShareIcon from '@mui/icons-material/Share';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import config from '@unstoppabledomains/config';
import FacebookIcon from '@unstoppabledomains/ui-kit/icons/FacebookCircle';
import TwitterXIcon from '@unstoppabledomains/ui-kit/icons/TwitterX';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import CopyToClipboard from '../../components/CopyToClipboard';
import Link from '../../components/Link';
import formSocialMediaLink from '../../lib/formSocialMediaLink';
import useTranslationContext from '../../lib/i18n';
import ChipControlButton from '../ChipControlButton';

const useStyles = makeStyles()((theme: Theme) => ({
  link: {
    '&:hover': {
      textDecoration: 'none',
    },
  },
  linkIcon: {
    marginRight: theme.spacing(1),
  },
  copyLinkText: {
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.getContrastText(theme.palette.background.default),
  },
  twitterIcon: {
    marginLeft: 2,
    fill: '#000',
  },
  facebookIcon: {
    fill: '#1877F2',
  },
  facebookMessengerIcon: {
    display: 'flex',
    marginRight: 10,
  },
  menuList: {
    padding: theme.spacing(1),
  },
  menuItem: {
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    transition: theme.transitions.create('background-color'),
  },
}));

export type ShareMenuProps = {
  domain: string;
  onProfileLinkCopied: () => void;
  toggleQrCode: () => void;
  displayQrCode: boolean;
  className?: string;
  isBadge?: boolean;
};

type ShareSocialMedia = 'twitter' | 'facebook' | 'facebook-messenger';

const ShareMenu: React.FC<ShareMenuProps> = ({
  domain,
  onProfileLinkCopied: handleProfileLinkCopied,
  className,
  toggleQrCode,
  displayQrCode,
  isBadge,
}) => {
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<
    HTMLButtonElement | HTMLDivElement | null
  >(null);

  const linkUrl = `${config.UD_ME_BASE_URL}/${
    isBadge ? 'badge/' : ''
  }${domain}`;
  const twitterText = `Sharing a ${
    isBadge ? '#Web3Badge' : '#Web3Domain profile'
  } made with @UnstoppableWeb! Check it out and join the community that's building the future of web3.\n${linkUrl}`;
  const facebookText = `Sharing a ${
    isBadge ? '#Web3Badge' : '#Web3Domain profile'
  } made with Unstoppable Domains! Check it out and join the community that's building the future of web3.`;

  const socialMedias: {
    media: ShareSocialMedia;
    href: string;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      media: 'twitter',
      href: formSocialMediaLink({
        type: 'twitter',
        text: twitterText,
      }),
      label: t('common.twitter'),
      icon: (
        <TwitterXIcon
          className={cx(classes.linkIcon, classes.twitterIcon)}
          fr={undefined}
        />
      ),
    },
    {
      media: 'facebook',
      href: formSocialMediaLink({
        type: 'facebook',
        url: linkUrl,
        text: facebookText,
      }),
      label: t('common.facebook'),
      icon: (
        <FacebookIcon className={cx(classes.linkIcon, classes.facebookIcon)} />
      ),
    },
  ];

  const handleChipClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleQrCode = () => {
    toggleQrCode();
    handleClose();
  };

  return (
    <Box display="flex">
      <ChipControlButton
        data-testid="share-button"
        className={className}
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleChipClick}
        icon={<ShareIcon />}
        label={t('profile.share')}
        variant="outlined"
      />
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        classes={{list: classes.menuList}}
      >
        <CopyToClipboard
          stringToCopy={linkUrl}
          onCopy={handleProfileLinkCopied}
        >
          <MenuItem className={classes.menuItem} onClick={handleClose}>
            <Box display="flex">
              <LinkIcon className={classes.linkIcon} />
              <Typography className={classes.copyLinkText}>
                {t('profile.copyLink')}
              </Typography>
            </Box>
          </MenuItem>
        </CopyToClipboard>
        <MenuItem className={classes.menuItem} onClick={handleQrCode}>
          <Box display="flex">
            <QrCodeIcon className={classes.linkIcon} />
            <Typography className={classes.copyLinkText}>
              {!displayQrCode
                ? t('profile.showQRCode')
                : t('profile.hideQRCode')}
            </Typography>
          </Box>
        </MenuItem>
        <Box mt={1} mb={1}>
          <Divider />
        </Box>
        {socialMedias.map(media => (
          <Link
            key={media.media}
            className={classes.link}
            href={media.href}
            external
          >
            <MenuItem
              key={media.label}
              className={classes.menuItem}
              onClick={handleClose}
            >
              <Box display="flex">
                {media.icon}
                <Typography className={classes.copyLinkText}>
                  {media.label}
                </Typography>
              </Box>
            </MenuItem>
          </Link>
        ))}
      </Menu>
    </Box>
  );
};

export default ShareMenu;
