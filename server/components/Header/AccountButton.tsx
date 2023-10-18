import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import type {Theme} from '@mui/material/styles';
import {getMetadataDomainsRecords} from 'actions/backendActions';
import {getProfileData} from 'actions/domainProfile';
import DropDownMenu from 'components/DropDownMenu';
import getImageUrl from 'lib/domain/getImageUrl';
import type {SerializedPublicDomainProfileData} from 'lib/types/domain';
import type {MetadataDomainRecords} from 'lib/types/records';
import React, {useEffect, useState} from 'react';

import ProfilePlaceholder from '@unstoppabledomains/ui-kit/icons/ProfilePlaceholder';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  profileButtonContainer: {
    position: 'absolute',
    right: theme.spacing(4),
    top: theme.spacing(1),
    zIndex: 2,
    [theme.breakpoints.down('sm')]: {
      right: theme.spacing(2),
    },
  },
  profileButton: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
    borderColor: 'rgba(255, 255, 255, 0.321569)',
    '&:hover': {
      backgroundColor: theme.palette.common.white,
      borderColor: theme.palette.common.white,
    },
    paddingRight: '11px',
    paddingLeft: '20px',
  },
  logoutButton: {
    display: 'flex',
    marginLeft: '8px',
    marginRight: '-5px',
    color: theme.palette.neutralShades[200],
    zIndex: 3,
  },
  round: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '24px !important',
    height: '24px !important',
    borderRadius: '50%',
    border: `1px solid ${theme.palette.primary.main} !important`,
    backgroundColor: theme.palette.primary.main,
    [theme.breakpoints.up('sm')]: {
      width: 12,
      height: 12,
    },
  },
  profilePlaceholderContainer: {
    backgroundColor: theme.palette.primary.main,
  },
  profilePlaceholder: {
    fontSize: `calc(${20}px + 4px)`,
  },
  domainName: {
    maxWidth: '300px',
    overflow: 'hidden',
    wordBreak: 'break-word',
    [theme.breakpoints.down('sm')]: {
      maxWidth: '220px',
    },
  },
  expandMore: {
    marginLeft: '10px',
  },
}));

export type Props = {
  domainOwner: string;
  domain: string;
  authAddress: string;
  authDomain: string;
};

export const AccountButton: React.FC<Props> = ({
  domainOwner,
  domain,
  authAddress,
  authDomain,
}) => {
  const {classes, cx} = useStyles();
  const [isOwner, setIsOwner] = useState(false);
  const [isDropDownShown, setDropDownShown] = useState(false);
  const [authDomainAvatar, setAuthDomainAvatar] = useState<string>('');

  useEffect(() => {
    if (!authAddress || !authDomain) {
      return;
    }

    const fetchData = async (domainName: string) => {
      let data;
      let meta;
      try {
        data = await getProfileData(domainName);
      } catch {}
      try {
        const {data: metaDomainsRecords} = await getMetadataDomainsRecords({
          domains: [domainName],
          key: 'social.picture.value',
        });
        meta = metaDomainsRecords[0]?.records;
      } catch {}
      setAuthDomainAvatar(
        getDomainAvatarFromProfileAndMetadata(domainName, data, meta),
      );
    };

    // set state
    setIsOwner(domainOwner.toLowerCase() === authAddress.toLowerCase());
    fetchData(authDomain).catch(console.error);
  }, [authAddress, authDomain]);

  const showDropDown = () => {
    setDropDownShown(prev => !prev);
  };

  const getDomainAvatarFromProfileAndMetadata = (
    avatarDomain: string,
    profile?: SerializedPublicDomainProfileData,
    metadata?: MetadataDomainRecords,
  ): string => {
    const metadataImage = metadata?.['social.picture.value']
      ? `https://api.unstoppabledomains.com/metadata/image-src/${avatarDomain}?withOverlay=false`
      : null;
    const uploadedImagePath = profile?.profile.imagePath
      ? getImageUrl(profile.profile.imagePath)
      : null;
    const collectibleImage = profile?.profile.collectibleImage ?? null;

    const domainAvatar = metadataImage || uploadedImagePath || collectibleImage;
    return domainAvatar || '';
  };

  return (
    <Button
      variant="outlined"
      className={classes.profileButton}
      data-testid={'header-profile-button'}
      onClick={showDropDown}
      startIcon={
        authDomainAvatar ? (
          <img
            className={classes.round}
            src={authDomainAvatar}
            width={20}
            height={20}
          />
        ) : (
          <div
            className={cx(classes.round, classes.profilePlaceholderContainer)}
          >
            <ProfilePlaceholder className={classes.profilePlaceholder} />
          </div>
        )
      }
    >
      <span className={classes.domainName}>{authDomain}</span>
      <ExpandMoreIcon className={classes.expandMore} />
      {isDropDownShown && (
        <DropDownMenu
          isOwner={isOwner}
          domain={domain}
          authDomain={authDomain}
        />
      )}
    </Button>
  );
};
