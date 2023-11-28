import Box from '@mui/material/Box';
import type {Theme} from '@mui/material/styles';
import React, {useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {
  MAX_UPLOAD_FILE_SIZE,
  getImageUrl,
  kbToMb,
  useTranslationContext,
} from '../../../../lib';
import {AddCoverPopup} from './AddCoverPopup';
import ProfilePicture from './ProfilePicture';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    position: 'relative',
    padding: theme.spacing(3.5, 3),
    backgroundColor: '#192B55',
    borderTopRightRadius: theme.shape.borderRadius,
    borderTopLeftRadius: theme.shape.borderRadius,
    color: theme.palette.white,
  },
  containerWithCover: {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: theme.palette.greyShades[900],
      opacity: 0.24,
      borderRadius: 'inherit',
    },
  },
  viewProfileButton: {
    zIndex: 1,
    borderColor: theme.palette.greyShades[300],
    fontWeight: theme.typography.fontWeightBold,
    color: 'inherit',
    '&:hover': {
      borderColor: theme.palette.white,
      backgroundColor: theme.palette.white,
      color: theme.palette.greyShades[900],
    },
  },
  buttonWhite: {
    borderColor: theme.palette.white,
    backgroundColor: theme.palette.white,
    color: theme.palette.greyShades[900],
    '&:hover': {
      borderColor: theme.palette.greyShades[50],
      backgroundColor: theme.palette.greyShades[50],
    },
  },
}));

type Props = {
  domain: string;
  handleAvatarUpload: ({data, file}: {data: string; file: File | null}) => void;
  handleUrlEntry: (url: string) => void;
  handleCoverUpload: ({data, file}: {data: string; file: File | null}) => void;
  handleUploadError: (message: string) => void;
  src: string | null;
  coverSrc: string | null;
  ownerAddress: string;
  handlePictureChange: (picture: string) => void;
  uiDisabled: boolean;
  avatarValue?: string;
  isExternalDomain: boolean;
};

export const Header: React.FC<Props> = ({
  domain,
  handleAvatarUpload,
  handleUrlEntry,
  handleCoverUpload,
  handleUploadError,
  src,
  coverSrc,
  ownerAddress,
  handlePictureChange,
  uiDisabled,
  avatarValue,
  isExternalDomain,
}) => {
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();
  const [coverPopupOpen, setCoverPopupOpen] = useState(false);
  const hasProfileCover = !!coverSrc;

  const handleCoverPopupOpen = () => {
    setCoverPopupOpen(true);
  };

  const handleCoverPopupClose = () => {
    setCoverPopupOpen(false);
  };

  const handleCoverUploadClick = (event: {target: HTMLInputElement}) => {
    handleCoverPopupClose();

    const files = event.target.files;

    if (!files) {
      return;
    }

    const file = files[0];

    if (file.size > MAX_UPLOAD_FILE_SIZE) {
      handleUploadError(
        t('manage.uploadedPhotoExceedsLimit', {
          limit: kbToMb(MAX_UPLOAD_FILE_SIZE),
        }),
      );
      return;
    } else if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
      handleUploadError(t('manage.imageMustBePngOrJpg'));
    }

    const reader = new FileReader();

    reader.onloadend = function () {
      // reader.result will always be a string because the result in our case is
      // a "data: URL" representing the image data.
      handleCoverUpload({data: reader.result as string, file});
    };
    reader.readAsDataURL(file);
  };

  const handleCoverRemove = () => {
    if (!hasProfileCover) {
      return;
    }

    handleCoverUpload({data: '', file: null});
  };

  return (
    <>
      <div
        className={cx(classes.container, {
          [classes.containerWithCover]: hasProfileCover,
        })}
        style={
          hasProfileCover
            ? {
                backgroundImage: `url(${getImageUrl(coverSrc)})`,
              }
            : undefined
        }
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <div />
        </Box>
      </div>
      <ProfilePicture
        domain={domain}
        handleAvatarUpload={handleAvatarUpload}
        handleUrlEntry={handleUrlEntry}
        handleUploadError={handleUploadError}
        src={src}
        coverSrc={coverSrc}
        ownerAddress={ownerAddress}
        handlePictureChange={handlePictureChange}
        uiDisabled={uiDisabled}
        avatarValue={avatarValue}
        handleCoverPopupOpen={handleCoverPopupOpen}
        handleCoverRemove={handleCoverRemove}
        isExternalDomain={isExternalDomain}
      />

      {coverPopupOpen && (
        <AddCoverPopup
          uiDisabled={uiDisabled}
          popupOpen={coverPopupOpen}
          handleCoverPopupClose={handleCoverPopupClose}
          handleUploadClick={handleCoverUploadClick}
        />
      )}
    </>
  );
};
