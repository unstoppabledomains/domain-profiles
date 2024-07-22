import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import ProfilePlaceholder from '@unstoppabledomains/ui-kit/icons/ProfilePlaceholder';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileData} from '../../actions/domainProfileActions';
import DropDownMenu from '../../components/DropDownMenu';
import getImageUrl from '../../lib/domain/getImageUrl';
import {notifyEvent} from '../../lib/error';
import type {SerializedPublicDomainProfileData} from '../../lib/types/domain';
import {DomainFieldTypes} from '../../lib/types/domain';
import {DomainProfileTabType} from '../Manage/common/types';
import Modal from '../Modal';
import {Wallet} from '../Wallet/Wallet';

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
    whiteSpace: 'nowrap',
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  expandMore: {
    marginLeft: '10px',
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
    },
  },
  modalContainer: {
    marginTop: theme.spacing(1),
    maxWidth: '500px',
    minHeight: '400px',
  },
}));

export const AccountButton: React.FC<AccountButtonProps> = ({
  domainOwner,
  domain,
  authAddress,
  authDomain,
  setAuthAddress,
}) => {
  const {classes, cx} = useStyles();
  const [isOwner, setIsOwner] = useState(false);
  const [isDropDownShown, setDropDownShown] = useState(false);
  const [authDomainAvatar, setAuthDomainAvatar] = useState<string>('');
  const [isMpcWalletOpen, setIsMpcWalletOpen] = useState(false);
  const [buttonComponent, setButtonComponent] = useState<React.ReactNode>();
  const [domainProfileData, setDomainProfileData] =
    useState<SerializedPublicDomainProfileData>();

  useEffect(() => {
    if (!authAddress || !authDomain || !domainOwner) {
      return;
    }

    const fetchData = async (domainName: string) => {
      let profileData;
      try {
        profileData = await getProfileData(domainName, [
          DomainFieldTypes.Profile,
        ]);
        setDomainProfileData(profileData);
      } catch {}
      setAuthDomainAvatar(
        getDomainAvatarFromProfileAndMetadata(domainName, profileData),
      );
    };

    // set state
    setIsOwner(domainOwner.toLowerCase() === authAddress.toLowerCase());
    fetchData(authDomain).catch(e =>
      notifyEvent(e, 'error', 'Profile', 'Resolution'),
    );
  }, [authAddress, authDomain, domainOwner]);

  const showDropDown = () => {
    setDropDownShown(prev => !prev && !isMpcWalletOpen);
  };

  const getDomainAvatarFromProfileAndMetadata = (
    avatarDomain: string,
    profile?: SerializedPublicDomainProfileData,
  ): string => {
    const metadataImage = profile?.records?.['social.picture.value']
      ? `https://api.unstoppabledomains.com/metadata/image-src/${avatarDomain}?withOverlay=false`
      : null;
    const uploadedImagePath = profile?.profile?.imagePath
      ? getImageUrl(profile.profile?.imagePath)
      : null;
    const collectibleImage = profile?.profile?.collectibleImage ?? null;

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
          onWalletClicked={() => setIsMpcWalletOpen(true)}
        />
      )}
      {isMpcWalletOpen && (
        <Modal
          open={isMpcWalletOpen}
          onClose={() => setIsMpcWalletOpen(false)}
          noModalHeader
          noContentPadding
        >
          <Box className={classes.modalContainer}>
            <Wallet
              mode="portfolio"
              address={authAddress}
              domain={authDomain}
              avatarUrl={
                domainProfileData?.profile?.imageType !== 'default'
                  ? authDomainAvatar
                  : undefined
              }
              onUpdate={(_t: DomainProfileTabType) => {
                return;
              }}
              setButtonComponent={setButtonComponent}
              setAuthAddress={setAuthAddress}
            />
            {!authAddress && (
              <Box display="flex" flexDirection="column" width="100%" mt={2}>
                {buttonComponent}
              </Box>
            )}
          </Box>
        </Modal>
      )}
    </Button>
  );
};

export type AccountButtonProps = {
  domainOwner: string;
  domain: string;
  authAddress: string;
  authDomain: string;
  setAuthAddress?: (v: string) => void;
};
