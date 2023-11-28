import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {fetcher} from '@xmtp/proto';
import {useSnackbar} from 'notistack';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileUserData, setProfileUserData} from '../../../../actions';
import {useWeb3Context} from '../../../../hooks';
import type {
  DomainProfileVisibilityValues,
  SerializedUserDomainProfileData,
  SocialProfileVisibilityValues,
} from '../../../../lib';
import {
  DOMAIN_PROFILE_VISIBILITY_VALUES,
  DOMAIN_SOCIAL_VISIBILITY_VALUES,
  DomainFieldTypes,
  MAX_BIO_LENGTH,
  isExternalDomainValidForManagement,
  useTranslationContext,
} from '../../../../lib';
import {notifyError} from '../../../../lib/error';
import {ProfileManager} from '../../../Wallet/ProfileManager';
import {Header} from './Header';
import ManageInput from './ManageInput';
import ManagePublicVisibility from './ManagePublicVisibility';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(3),
  },
  textLimit: {
    fontSize: '0.8125rem',
    marginTop: theme.spacing(1),
    color: theme.palette.neutralShades[600],
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  mainLockIcon: {
    fill: theme.palette.neutralShades[600],
    marginLeft: '8px',
  },
}));

export const Profile: React.FC<ProfileProps> = ({address, domain}) => {
  const {classes} = useStyles();
  const {enqueueSnackbar} = useSnackbar();
  const {setWeb3Deps} = useWeb3Context();
  const [t] = useTranslationContext();
  const [isLoaded, setIsLoaded] = useState(false);
  const [dirtyFlag, setDirtyFlag] = useState(false);
  const [fireRequest, setFireRequest] = useState(false);
  const [showMainInfoVizCard, setShowMainInfoVizCard] =
    useState<boolean>(false);
  const [isAllPrivate, setPrivateVisibilityFlag] = useState<boolean>(false);
  const [userProfile, setUserProfile] =
    useState<SerializedUserDomainProfileData>();
  const [publicVisibilityValues, setPublicVisibilityValues] =
    useState<DomainProfileVisibilityValues>(DOMAIN_PROFILE_VISIBILITY_VALUES);
  const [socialVisibilityValues, setSocialVisibilityValues] =
    useState<SocialProfileVisibilityValues>(DOMAIN_SOCIAL_VISIBILITY_VALUES);
  const [isCardOpen, setIsCardOpen] = useState<{
    cardOpen: boolean;
    id: string | null;
  }>({
    cardOpen: false,
    id: null,
  });
  const [profileImage, setProfileImage] = useState<{
    data: string | null;
    file: File | null;
  }>({data: null, file: null});
  const [profileCover, setProfileCover] = useState<{
    data: string | null;
    file: File | null;
  }>({data: null, file: null});

  useEffect(() => {
    setFireRequest(true);
  }, []);

  useEffect(() => {
    Object.keys(publicVisibilityValues).map(k => {
      handleInputChange(k, publicVisibilityValues[k]);
    });
  }, [publicVisibilityValues]);

  const handleSave = () => {
    setFireRequest(true);
  };

  // handleProfileData fired once the ProfileManager has obtained a primary domain
  // signature and expiration time from the user.
  const handleProfileData = async (signature: string, expiry: string) => {
    try {
      // only proceed if signature available
      if (domain && signature && expiry) {
        if (!isLoaded) {
          // retrieve user profile data from profile API
          const data = await getProfileUserData(
            domain,
            [DomainFieldTypes.Profile],
            signature,
            expiry,
          );
          if (data) {
            setUserProfile(data);
            setProfileImage({
              data: data.profile?.imagePath || null,
              file: null,
            });
            setProfileCover({
              data: data.profile?.coverPath || null,
              file: null,
            });
            setPublicVisibilityValues({
              displayNamePublic: data?.profile?.displayNamePublic || false,
              descriptionPublic: data?.profile?.descriptionPublic || false,
              locationPublic: data?.profile?.locationPublic || false,
              web2UrlPublic: data?.profile?.web2UrlPublic || false,
              phoneNumberPublic: false,
              imagePathPublic: true,
              coverPathPublic: true,
            });
            setSocialVisibilityValues({
              discordPublic: data?.socialAccounts?.discord.public || false,
              redditPublic: data?.socialAccounts?.reddit.public || false,
              telegramPublic: data?.socialAccounts?.telegram.public || false,
              twitterPublic: data?.socialAccounts?.twitter.public || false,
              youtubePublic: data?.socialAccounts?.youtube.public || false,
              googlePublic: data?.socialAccounts?.google.public || false,
              githubPublic: data?.socialAccounts?.github.public || false,
              linkedinPublic: data?.socialAccounts?.linkedin.public || false,
            });
            setIsLoaded(true);
          }
        } else if (userProfile) {
          // update the domain's user data from profile API
          await setProfileUserData(
            domain,
            userProfile,
            signature,
            expiry,
            profileImage?.file
              ? {
                  base64: fetcher.b64Encode(
                    new Uint8Array(await profileImage.file.arrayBuffer()),
                    0,
                    profileImage.file.size,
                  ),
                  type: profileImage.file.type,
                }
              : undefined,
            profileCover?.file
              ? {
                  base64: fetcher.b64Encode(
                    new Uint8Array(await profileCover.file.arrayBuffer()),
                    0,
                    profileCover.file.size,
                  ),
                  type: profileCover.file.type,
                }
              : undefined,
          );
          setDirtyFlag(false);
        }
      }
    } catch (e) {
      notifyError(e, {msg: 'unable to manage user profile'});
    }
  };

  const handleDismissingCardsGlobally = () => {
    setIsCardOpen({id: null, cardOpen: false});
    setShowMainInfoVizCard(false);
  };

  const handlePublicVisibilityChange = (id: string, flag?: string) => {
    if (!dirtyFlag) {
      setDirtyFlag(true);
    }
    const fieldId = `${id}Public`;
    handleInputChange(
      fieldId,
      !userProfile?.profile || !userProfile?.profile[fieldId],
    );
  };

  const handleGlobalPublicPrivateVisibility = (
    e: {
      currentTarget: {id: string};
    },
    flag?: string,
  ): void => {
    if (flag) {
      if (e.currentTarget.id === 'privateSocial') {
        setSocialVisibilityValues(() => {
          return {
            youtubePublic: false,
            twitterPublic: false,
            discordPublic: false,
            redditPublic: false,
            telegramPublic: false,
            googlePublic: false,
            githubPublic: false,
            linkedinPublic: false,
          };
        });
      } else if (e.currentTarget.id === 'publicSocial') {
        setSocialVisibilityValues(() => {
          return {
            youtubePublic: true,
            twitterPublic: true,
            discordPublic: true,
            redditPublic: true,
            telegramPublic: true,
            googlePublic: true,
            githubPublic: true,
            linkedinPublic: true,
          };
        });
      }
    } else {
      if (e.currentTarget.id === 'private') {
        setPublicVisibilityValues(() => {
          return {
            displayNamePublic: false,
            descriptionPublic: false,
            locationPublic: false,
            web2UrlPublic: false,
            phoneNumberPublic: false,
            imagePathPublic: true,
            coverPathPublic: true,
          };
        });
      } else if (e.currentTarget.id === 'public') {
        setPublicVisibilityValues(() => {
          return {
            displayNamePublic: true,
            descriptionPublic: true,
            locationPublic: true,
            web2UrlPublic: true,
            phoneNumberPublic: false,
            imagePathPublic: true,
            coverPathPublic: true,
          };
        });
      }
    }

    if (!dirtyFlag && (e.currentTarget.id === 'public' || 'private')) {
      setDirtyFlag(true);
    }
  };

  const handleInputChange = (id: string, value: string | boolean) => {
    if (!dirtyFlag) {
      setDirtyFlag(true);
    }

    const updatedUserProfile = userProfile || {};
    if (!updatedUserProfile?.profile) {
      updatedUserProfile.profile = {};
    }
    updatedUserProfile.profile[id] = value;
    setUserProfile({
      ...updatedUserProfile,
    });
  };

  const handleUrlEntry = (url: string) => {
    if (!dirtyFlag) {
      setDirtyFlag(true);
    }
    handleInputChange('imagePath', url);
    setProfileImage({data: url, file: null});
  };

  const handleAvatarUpload = async ({
    data,
    file,
  }: {
    data: string;
    file: File | null;
  }) => {
    if (!dirtyFlag) {
      setDirtyFlag(true);
    }
    handleInputChange('imagePath', '');
    handleInputChange('imageType', 'offChain');
    if (file) {
      setProfileImage({data, file});
    } else {
      setProfileImage({data: null, file: null});
    }
  };

  const handleCoverUpload = async ({
    data,
    file,
  }: {
    data: string;
    file: File | null;
  }) => {
    if (!dirtyFlag) {
      setDirtyFlag(true);
    }
    handleInputChange('coverPath', '');
    if (file) {
      setProfileCover({data, file});
    } else {
      setProfileCover({data: null, file: null});
    }
  };

  const handleUploadError = (message: string): void => {
    enqueueSnackbar(message, {variant: 'error'});
  };

  const handleNftAvatarChange = (nftValue: string) => {
    // not yet implemented
  };

  return (
    <Box className={classes.container} onClick={handleDismissingCardsGlobally}>
      {isLoaded ? (
        <>
          <Header
            domain={domain}
            src={
              userProfile?.profile?.imageType !== 'default'
                ? profileImage.data
                : null
            }
            coverSrc={profileCover.data}
            ownerAddress={address}
            uiDisabled={false}
            isExternalDomain={isExternalDomainValidForManagement(domain)}
            handleAvatarUpload={handleAvatarUpload}
            handleUrlEntry={handleUrlEntry}
            handleCoverUpload={handleCoverUpload}
            handleUploadError={handleUploadError}
            handlePictureChange={handleNftAvatarChange}
          />
          <Box className={classes.sectionHeader}>
            <Box display="flex">
              <Typography variant="h6">{t('manage.mainInfo')}</Typography>
              {isAllPrivate ? (
                <LockIcon
                  data-testid="lockIcon"
                  className={classes.mainLockIcon}
                />
              ) : (
                <LockOpenIcon
                  data-testid="openLockIcon"
                  className={classes.mainLockIcon}
                />
              )}
            </Box>
            <ManagePublicVisibility
              id="globalVisibility"
              publicVisibilityValues={publicVisibilityValues}
              showCard={showMainInfoVizCard}
              handleGlobalPublicPrivateVisibility={
                handleGlobalPublicPrivateVisibility
              }
              setCardVisibility={setShowMainInfoVizCard}
              setPrivateVisibilityFlagGlobal={setPrivateVisibilityFlag}
            />
          </Box>
          <ManageInput
            id="displayName"
            value={userProfile?.profile?.displayName}
            label={t('manage.displayName')}
            placeholder={t('manage.enterDisplayName')}
            onChange={handleInputChange}
            disableTextTrimming
            stacked={false}
            data-testid="displayNameInput"
            publicVisibilityValues={publicVisibilityValues}
            isCardOpen={isCardOpen}
            setPublicVisibilityValues={setPublicVisibilityValues}
            setIsCardOpen={setIsCardOpen}
          />
          <ManageInput
            id="description"
            value={userProfile?.profile?.description}
            label={t('manage.description')}
            placeholder={t('manage.enterDescription')}
            multiline
            rows={4}
            maxLength={MAX_BIO_LENGTH}
            onChange={handleInputChange}
            disableTextTrimming
            stacked={false}
            publicVisibilityValues={publicVisibilityValues}
            isCardOpen={isCardOpen}
            setPublicVisibilityValues={setPublicVisibilityValues}
            setIsCardOpen={setIsCardOpen}
          />
          <Box display="flex" justifyContent="end">
            <Typography color="textSecondary" className={classes.textLimit}>
              {userProfile?.profile?.description?.length || 0}/{MAX_BIO_LENGTH}
            </Typography>
          </Box>
          <ManageInput
            id="location"
            value={userProfile?.profile?.location}
            label={t('manage.location')}
            placeholder={t('manage.enterLocation')}
            onChange={handleInputChange}
            disableTextTrimming
            stacked={false}
            publicVisibilityValues={publicVisibilityValues}
            isCardOpen={isCardOpen}
            setPublicVisibilityValues={setPublicVisibilityValues}
            setIsCardOpen={setIsCardOpen}
          />
          <ManageInput
            id="web2Url"
            value={userProfile?.profile?.web2Url}
            label={t('manage.website')}
            placeholder={t('manage.addWebsite')}
            onChange={handleInputChange}
            disableTextTrimming
            stacked={false}
            publicVisibilityValues={publicVisibilityValues}
            isCardOpen={isCardOpen}
            setPublicVisibilityValues={setPublicVisibilityValues}
            setIsCardOpen={setIsCardOpen}
          />
          <Button
            variant="contained"
            onClick={handleSave}
            className={classes.button}
            disabled={!dirtyFlag}
          >
            {t('common.save')}
          </Button>
        </>
      ) : (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}
      <ProfileManager
        domain={domain}
        ownerAddress={address}
        setWeb3Deps={setWeb3Deps}
        saveClicked={fireRequest}
        setSaveClicked={setFireRequest}
        onSignature={handleProfileData}
      />
    </Box>
  );
};

export type ProfileProps = {
  address: string;
  domain: string;
};
