import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import {useTheme} from '@mui/material/styles';
import type {Theme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, {useEffect, useState} from 'react';
import useIsMounted from 'react-is-mounted-hook';

import config from '@unstoppabledomains/config';
import ProfilePlaceholder from '@unstoppabledomains/ui-kit/icons/ProfilePlaceholder';
import UploadIcon from '@unstoppabledomains/ui-kit/icons/SendFile';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileData} from '../../../../actions';
import {
  DomainFieldTypes,
  MAX_UPLOAD_FILE_SIZE,
  kbToMb,
  useTranslationContext,
} from '../../../../lib';
import {AddAvatarPopup} from './AddAvatarPopup';
import SelectNftPopup from './SelectNftPopup';
import SelectUrlPopup from './SelectUrlPopup';

const AVATAR_SIZE = 120;
const AVATAR_PLACEHOLDER_SIZE = 132;

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    marginTop: -(AVATAR_PLACEHOLDER_SIZE / 2),
    paddingLeft: theme.spacing(3),
    flexWrap: 'nowrap',
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
    },
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
  selectImageIcon: {
    width: 24,
    height: 24,
    color: 'inherit',
  },
  pictureContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  pictureLoader: {
    backgroundColor: theme.palette.greyShades[50],
  },
  imageWrapper: {
    position: 'relative',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '50%',
    border: `6px solid ${theme.palette.white}`,
    cursor: 'pointer',
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
    '&:hover': {
      '&::before': {
        opacity: 1,
      },
    },
  },
  imagePlaceholderWrapper: {
    minWidth: AVATAR_PLACEHOLDER_SIZE,
    maxWidth: AVATAR_PLACEHOLDER_SIZE,
    height: AVATAR_PLACEHOLDER_SIZE,
    overflow: 'hidden',
  },
  profileImagePlaceholder: {
    fontSize: AVATAR_PLACEHOLDER_SIZE,
  },
  buttonsWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginLeft: `-${theme.spacing(1)}`,
    '&:first-of-type': {
      marginBottom: theme.spacing(2),
    },
    [theme.breakpoints.up('sm')]: {
      display: 'block',
      marginLeft: theme.spacing(5),
    },
  },
  buttonsRowWrapper: {
    minHeight: 40,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: theme.spacing(2.5),
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  },
  button: {
    display: 'flex',
  },
  buttonWhite: {
    color: theme.palette.white,
  },
  buttonDisabled: {
    '&.Mui-disabled': {
      opacity: 0.33,
      filter: 'grayscale(1)',
      color: theme.palette.neutralShades[600],
    },
  },
  buttonWhiteDisabled: {
    '&.Mui-disabled': {
      color: theme.palette.white,
    },
  },
  buttonIcon: {
    width: 24,
    height: 24,
  },
  deleteButton: {
    color: theme.palette.neutralShades[600],
  },
  iconWhite: {
    fill: theme.palette.white,
  },
  iconGrey: {
    width: 24,
    height: 24,
  },
  divider: {
    height: 24,
    margin: theme.spacing(0, 1.5),
    zIndex: 1,
  },
  dividerWhite: {
    backgroundColor: theme.palette.white,
    opacity: 0.24,
  },
}));

export type ProfilePictureProps = {
  domain: string;
  handleAvatarUpload: ({data, file}: {data: string; file: File | null}) => void;
  handleUrlEntry: (url: string) => void;
  handleUploadError: (message: string) => void;
  src: string | null;
  coverSrc: string | null;
  // Exposing maxSize as a prop makes testing file uploads easier
  maxSize?: number;
  ownerAddress: string;
  handlePictureChange: (picture: string) => void;
  uiDisabled: boolean;
  avatarValue?: string;
  handleCoverPopupOpen: () => void;
  handleCoverRemove: () => void;
  isExternalDomain: boolean;
};

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  domain,
  handleAvatarUpload,
  handleUrlEntry,
  handleUploadError,
  src,
  coverSrc,
  maxSize = MAX_UPLOAD_FILE_SIZE,
  ownerAddress,
  handlePictureChange,
  uiDisabled,
  avatarValue,
  handleCoverPopupOpen,
  handleCoverRemove,
  isExternalDomain,
}) => {
  const theme = useTheme();
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();
  const [avatarPopupOpen, setAvatarPopupOpen] = useState(false);
  const [urlPopupOpen, setUrlPopupOpen] = useState(false);
  const [nftPopupOpen, setNftPopupOpen] = useState(false);
  const [onChainImageUrl, setOnChainImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const isMounted = useIsMounted();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const hasMetadataImage = !!onChainImageUrl;
  const hasUploadedAvatar = !!src;
  const hasUploadedCover = !!coverSrc;

  const fetchMetadata = async () => {
    setImageLoading(true);

    try {
      const pictureKey = 'social.picture.value';
      const profileData = await getProfileData(domain, [
        DomainFieldTypes.Records,
      ]);
      const onChainPicture =
        profileData?.records && profileData.records[pictureKey];
      if (onChainPicture) {
        setOnChainImageUrl(
          `${config.UNSTOPPABLE_METADATA_ENDPOINT}/image-src/${domain}?withOverlay=false&ref=${onChainPicture}`,
        );
      }
    } finally {
      if (isMounted()) {
        setImageLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isMounted() && !isExternalDomain) {
      void fetchMetadata();
    }
  }, [isMounted]);

  const handleUrlPopupOpen = () => {
    setUrlPopupOpen(true);
  };

  const handleUrlPopupClose = () => {
    setUrlPopupOpen(false);
  };

  const handleNftPopupOpen = () => {
    setNftPopupOpen(true);
  };

  const handleNftPopupClose = () => {
    setNftPopupOpen(false);
  };

  const handleAvatarPopupOpen = () => {
    setAvatarPopupOpen(true);
  };

  const handleAvatarPopupClose = () => {
    setAvatarPopupOpen(false);
  };

  const removeAvatar = () => {
    if (!avatarValue && !hasMetadataImage && !hasUploadedAvatar) {
      return;
    }

    if (hasMetadataImage) {
      handlePictureChange('');
      setOnChainImageUrl(null);
    }

    if (hasUploadedAvatar) {
      handleAvatarUpload({data: '', file: null});
    }
  };

  const handleSelectUrlClick = async (url: string) => {
    // map .lgb to .png for now
    const usableUrl = url.slice(-4) === '.glb' ? url.slice(0, -3) + 'png' : url;
    removeAvatar();
    handleAvatarPopupClose();
    handleUrlEntry(usableUrl);
  };

  const handleSelectNftClick = async (nftSpec: string) => {
    removeAvatar();
    handleAvatarPopupClose();
    handleUrlEntry(
      // TODO need to lookup the NFT URL here
      'https://storage.googleapis.com/unstoppable-client-assets/images/common/hourglass-half.svg',
    );
  };

  const handleAvatarUploadClick = async (event: {target: HTMLInputElement}) => {
    removeAvatar();
    handleAvatarPopupClose();

    const files = event.target.files;

    if (!files) {
      return;
    }

    const file = files[0];

    if (file.size > maxSize) {
      handleUploadError(
        t('manage.uploadedPhotoExceedsLimit', {limit: kbToMb(maxSize)}),
      );
      return;
    } else if (
      file.type !== 'image/png' &&
      file.type !== 'image/jpeg' &&
      file.type !== 'image/gif'
    ) {
      handleUploadError(t('manage.imageMustBePngJpgOrGif'));
    }

    const reader = new FileReader();

    reader.onloadend = function () {
      // reader.result will always be a string because the result in our case is
      // a "data: URL" representing the image data.
      handleAvatarUpload({data: reader.result as string, file});
    };
    reader.readAsDataURL(file);
  };

  return (
    <Grid container className={classes.container}>
      <Grid item xs={4} sm={2} className={classes.pictureContainer}>
        {imageLoading && (
          <div>
            <Skeleton
              animation="wave"
              variant="circular"
              width={AVATAR_PLACEHOLDER_SIZE}
              height={AVATAR_PLACEHOLDER_SIZE}
              className={classes.pictureLoader}
            />
          </div>
        )}
        {!imageLoading && (hasMetadataImage || hasUploadedAvatar) && (
          <div className={classes.imageWrapper} onClick={handleAvatarPopupOpen}>
            <img
              className={classes.round}
              src={hasMetadataImage ? onChainImageUrl : src!}
              width={AVATAR_SIZE}
              height={AVATAR_SIZE}
              alt={t('manage.domainProfileImage')}
            />
          </div>
        )}
        {!imageLoading && !hasMetadataImage && !hasUploadedAvatar && (
          <div
            className={cx(
              classes.round,
              classes.imageWrapper,
              classes.imagePlaceholderWrapper,
            )}
            onClick={handleAvatarPopupOpen}
          >
            <ProfilePlaceholder className={classes.profileImagePlaceholder} />
          </div>
        )}
      </Grid>
      <Grid item xs={10} sm={10} className={classes.buttonsWrapper}>
        <div className={classes.buttonsRowWrapper}>
          <Button
            disabled={uiDisabled}
            onClick={handleCoverPopupOpen}
            className={cx(classes.button, {
              [classes.buttonWhite]: !isMobile,
            })}
            classes={{
              disabled: cx(classes.buttonDisabled, {
                [classes.buttonWhiteDisabled]: !isMobile,
              }),
            }}
            startIcon={
              <PhotoLibraryOutlinedIcon className={classes.buttonIcon} />
            }
          >
            {t('manage.addCover')}
          </Button>

          {hasUploadedCover && !isMobile && (
            <>
              <Divider
                orientation="vertical"
                className={cx(classes.divider, classes.dividerWhite)}
              />
              <IconButton
                classes={{
                  disabled: classes.buttonDisabled,
                }}
                disabled={uiDisabled}
                onClick={handleCoverRemove}
                aria-label={t('manage.removeCover')}
              >
                <DeleteOutlineOutlinedIcon className={classes.iconWhite} />
              </IconButton>
            </>
          )}

          {hasUploadedCover && isMobile && (
            <Button
              className={classes.deleteButton}
              classes={{
                disabled: classes.buttonDisabled,
              }}
              disabled={uiDisabled}
              onClick={handleCoverRemove}
              aria-label={t('manage.removeCover')}
              startIcon={
                <DeleteOutlineOutlinedIcon className={classes.iconGrey} />
              }
            >
              {t('common.delete')}
            </Button>
          )}
        </div>

        <div className={classes.buttonsRowWrapper}>
          <Button
            disabled={uiDisabled}
            onClick={handleAvatarPopupOpen}
            className={classes.button}
            startIcon={<UploadIcon className={classes.buttonIcon} />}
          >
            {t('manage.addAvatar')}
          </Button>

          {(hasMetadataImage || hasUploadedAvatar) && !isMobile && (
            <>
              <Divider orientation="vertical" className={classes.divider} />
              <IconButton
                classes={{
                  disabled: classes.buttonDisabled,
                }}
                disabled={uiDisabled}
                onClick={removeAvatar}
                aria-label={t('manage.removeAvatar')}
              >
                <DeleteOutlineOutlinedIcon />
              </IconButton>
            </>
          )}

          {(hasMetadataImage || hasUploadedAvatar) && isMobile && (
            <Button
              className={classes.deleteButton}
              classes={{
                disabled: classes.buttonDisabled,
              }}
              disabled={uiDisabled}
              onClick={removeAvatar}
              aria-label={t('manage.removeAvatar')}
              startIcon={
                <DeleteOutlineOutlinedIcon className={classes.iconGrey} />
              }
            >
              {t('common.delete')}
            </Button>
          )}
        </div>

        {avatarPopupOpen && (
          <AddAvatarPopup
            uiDisabled={uiDisabled}
            popupOpen={avatarPopupOpen}
            handleAvatarPopupClose={handleAvatarPopupClose}
            handleUrlPopupOpen={handleUrlPopupOpen}
            handleNftPopupOpen={handleNftPopupOpen}
            handleUploadClick={handleAvatarUploadClick}
          />
        )}
      </Grid>

      {urlPopupOpen && (
        <SelectUrlPopup
          popupOpen={urlPopupOpen}
          handlePopupClose={handleUrlPopupClose}
          handleSelectUrlClick={handleSelectUrlClick}
        />
      )}

      {nftPopupOpen && (
        <SelectNftPopup
          domain={domain}
          address={ownerAddress}
          popupOpen={nftPopupOpen}
          handlePopupClose={handleNftPopupClose}
          handleSelectNftClick={handleSelectNftClick}
        />
      )}
    </Grid>
  );
};

export default ProfilePicture;
