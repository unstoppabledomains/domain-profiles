import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import RedditIcon from '@mui/icons-material/Reddit';
import TelegramIcon from '@mui/icons-material/Telegram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import {fetcher} from '@xmtp/proto';
import {useSnackbar} from 'notistack';
import React, {useEffect, useState} from 'react';

import Discord from '@unstoppabledomains/ui-kit/icons/Discord';
import TwitterXIcon from '@unstoppabledomains/ui-kit/icons/TwitterX';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileUserData, setProfileUserData} from '../../../../actions';
import {useWeb3Context} from '../../../../hooks';
import {
  DomainProfileSocialMedia,
  DomainProfileSocialMediaAutoPopulated,
  DomainProfileVisibilityValues,
  SerializedDomainProfileAttributes,
  SerializedUserDomainProfileData,
} from '../../../../lib';
import {
  DOMAIN_PROFILE_VISIBILITY_VALUES,
  DomainFieldTypes,
  MAX_BIO_LENGTH,
  isExternalDomain,
  useTranslationContext,
} from '../../../../lib';
import {notifyEvent} from '../../../../lib/error';
import {ProfileManager} from '../../../Wallet/ProfileManager';
import BulkUpdateLoadingButton from '../../common/BulkUpdateLoadingButton';
import ManageInput, {ManageInputOnChange} from '../../common/ManageInput';
import {DomainProfileTabType} from '../../common/types';
import type {ManageTabProps} from '../../common/types';
import {Header} from './Header';
import ManagePublicVisibility from './ManagePublicVisibility';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  divider: {
    marginTop: theme.spacing(2),
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
  twitterIcon: {
    fill: '#000',
  },
  youtubeIcon: {
    fill: '#EB3323',
  },
  redditIcon: {
    fill: '#EC5428',
  },
  discordIcon: {
    color: '#5865F2',
  },
  telegramIcon: {
    fill: '#229ED9',
  },
  githubIcon: {
    fill: '#24292f',
  },
  linkedinIcon: {
    fill: '#3375B0',
  },
}));

export const Profile: React.FC<ManageTabProps> = ({
  address,
  domain,
  onUpdate,
  onLoaded,
  setButtonComponent,
}) => {
  const {classes} = useStyles();
  const {enqueueSnackbar} = useSnackbar();
  const {setWeb3Deps} = useWeb3Context();
  const [t] = useTranslationContext();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBulkUpdate, setIsBulkUpdate] = useState(false);
  const [updatedCount, setUpdatedCount] = useState(0);
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string>();
  const [isInvalidUrl, setIsInvalidUrl] = useState(false);
  const [dirtyFlag, setDirtyFlag] = useState(false);
  const [fireRequest, setFireRequest] = useState(false);
  const [showMainInfoVizCard, setShowMainInfoVizCard] =
    useState<boolean>(false);
  const [userProfile, setUserProfile] =
    useState<SerializedUserDomainProfileData>();
  const [publicVisibilityValues, setPublicVisibilityValues] =
    useState<DomainProfileVisibilityValues>(DOMAIN_PROFILE_VISIBILITY_VALUES);
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
    setIsLoaded(false);
    setButtonComponent(<></>);
    setFireRequest(true);
  }, [domain]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    setButtonComponent(
      <BulkUpdateLoadingButton
        address={address}
        count={updatedCount}
        isBulkUpdate={isBulkUpdate}
        setIsBulkUpdate={setIsBulkUpdate}
        variant="contained"
        loading={isSaving}
        onClick={handleSave}
        disabled={!dirtyFlag}
        errorMessage={updateErrorMessage}
      />,
    );
  }, [
    address,
    updatedCount,
    isBulkUpdate,
    isSaving,
    dirtyFlag,
    updateErrorMessage,
    isLoaded,
  ]);

  useEffect(() => {
    Object.keys(publicVisibilityValues).map(k => {
      const key = k as keyof DomainProfileVisibilityValues;
      handleInputChange(key, publicVisibilityValues[key]);
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
        // callback to indicate signature was collected
        if (onLoaded) {
          onLoaded(true);
        }

        // retrieve user profile data from profile API
        const existingData = await getProfileUserData(
          domain,
          [DomainFieldTypes.Profile, DomainFieldTypes.SocialAccounts],
          signature,
          expiry,
        );
        if (!isLoaded) {
          if (existingData) {
            setUserProfile(existingData);
            setProfileImage({
              data: existingData.profile?.imagePath || null,
              file: null,
            });
            setProfileCover({
              data: existingData.profile?.coverPath || null,
              file: null,
            });
            setPublicVisibilityValues({
              displayNamePublic:
                existingData?.profile?.displayNamePublic || false,
              descriptionPublic:
                existingData?.profile?.descriptionPublic || false,
              locationPublic: existingData?.profile?.locationPublic || false,
              web2UrlPublic: existingData?.profile?.web2UrlPublic || false,
              phoneNumberPublic: false,
              imagePathPublic: true,
              coverPathPublic: true,
            });
            setDirtyFlag(false);
            setIsLoaded(true);
          }
        } else if (userProfile) {
          // update the domain's user data from profile API
          setIsSaving(true);
          setUpdateErrorMessage('');
          const updateResult = await setProfileUserData(
            domain,
            existingData,
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
            isBulkUpdate,
          );

          // saving profile complete
          if (updateResult?.success) {
            setUpdatedCount(updateResult.domains.length);
            onUpdate(DomainProfileTabType.Profile, {
              ...userProfile,
              ...publicVisibilityValues,
            });
            setIsSaving(false);
            setDirtyFlag(false);
          } else {
            setUpdateErrorMessage(t('manage.updateError'));
          }
        }
      }
    } catch (e) {
      setUpdateErrorMessage(t('manage.updateError'));
      notifyEvent(e, 'error', 'Profile', 'Fetch', {
        msg: 'unable to manage user profile',
      });
    }
  };

  const handleDismissingCardsGlobally = () => {
    setIsCardOpen({id: null, cardOpen: false});
    setShowMainInfoVizCard(false);
  };

  const handleGlobalPublicPrivateVisibility = (e: {
    currentTarget: {id: string};
  }): void => {
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

    if (!dirtyFlag && (e.currentTarget.id === 'public' || 'private')) {
      setDirtyFlag(true);
    }
  };

  const handleInputChange = <T extends keyof SerializedDomainProfileAttributes>(
    id: T,
    value: SerializedDomainProfileAttributes[T],
  ) => {
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

    if (id === 'web2Url') {
      setIsInvalidUrl(
        value !== '' &&
          !String(value).match(
            /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/,
          ),
      );
    }
  };

  const handleSocialInputChange = (
    id: DomainProfileSocialMedia | DomainProfileSocialMediaAutoPopulated,
    value: string,
  ) => {
    if (!dirtyFlag) {
      setDirtyFlag(true);
    }

    const updatedUserProfile = userProfile || {};
    if (!updatedUserProfile?.socialAccounts) {
      updatedUserProfile.socialAccounts = {
        twitter: {},
        discord: {},
        youtube: {},
        reddit: {},
        telegram: {},
        github: {},
        linkedin: {},
        lens: {},
        farcaster: {},
      };
    }
    updatedUserProfile.socialAccounts[id] = {
      location: value,
      public: true,
      verified: false,
    };
    setUserProfile({
      ...updatedUserProfile,
    });
  };

  const handleUrlEntry = (url: string) => {
    if (!dirtyFlag) {
      setDirtyFlag(true);
    }
    handleInputChange('imagePath', url);
    handleInputChange('imageType', 'offChain');
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
      <Header
        domain={domain}
        src={
          userProfile?.profile?.imageType !== 'default'
            ? profileImage.data
            : null
        }
        coverSrc={profileCover.data}
        ownerAddress={address}
        uiDisabled={!isLoaded}
        isExternalDomain={isExternalDomain(domain)}
        handleAvatarUpload={handleAvatarUpload}
        handleUrlEntry={handleUrlEntry}
        handleCoverUpload={handleCoverUpload}
        handleUploadError={handleUploadError}
        handlePictureChange={handleNftAvatarChange}
      />

      <Box className={classes.sectionHeader}>
        <Box display="flex">
          <Typography variant="h6">{t('manage.mainInfo')}</Typography>
        </Box>
        <ManagePublicVisibility
          id="globalVisibility"
          publicVisibilityValues={publicVisibilityValues}
          showCard={showMainInfoVizCard}
          handleGlobalPublicPrivateVisibility={
            handleGlobalPublicPrivateVisibility
          }
          setCardVisibility={setShowMainInfoVizCard}
          setPrivateVisibilityFlagGlobal={() => {}}
        />
      </Box>
      <ManageInput
        mt={2}
        id="displayName"
        value={userProfile?.profile?.displayName}
        label={t('manage.displayName')}
        placeholder={t('manage.enterDisplayName')}
        onChange={handleInputChange as ManageInputOnChange}
        disableTextTrimming
        stacked={false}
        data-testid="displayNameInput"
        publicVisibilityValues={publicVisibilityValues}
        isCardOpen={isCardOpen}
        setPublicVisibilityValues={setPublicVisibilityValues}
        setIsCardOpen={setIsCardOpen}
        disabled={!isLoaded}
      />
      <ManageInput
        mt={2}
        id="description"
        value={userProfile?.profile?.description}
        label={t('manage.description')}
        placeholder={t('manage.enterDescription')}
        multiline
        rows={4}
        maxLength={MAX_BIO_LENGTH}
        onChange={handleInputChange as ManageInputOnChange}
        disableTextTrimming
        stacked={false}
        publicVisibilityValues={publicVisibilityValues}
        isCardOpen={isCardOpen}
        setPublicVisibilityValues={setPublicVisibilityValues}
        setIsCardOpen={setIsCardOpen}
        disabled={!isLoaded}
      />
      <Box display="flex" justifyContent="end">
        <Typography color="textSecondary" className={classes.textLimit}>
          {userProfile?.profile?.description?.length || 0}/{MAX_BIO_LENGTH}
        </Typography>
      </Box>
      <ManageInput
        mt={2}
        id="location"
        value={userProfile?.profile?.location}
        label={t('manage.location')}
        placeholder={t('manage.enterLocation')}
        onChange={handleInputChange as ManageInputOnChange}
        disableTextTrimming
        stacked={false}
        publicVisibilityValues={publicVisibilityValues}
        isCardOpen={isCardOpen}
        setPublicVisibilityValues={setPublicVisibilityValues}
        setIsCardOpen={setIsCardOpen}
        disabled={!isLoaded}
      />
      <ManageInput
        mt={2}
        id="web2Url"
        value={userProfile?.profile?.web2Url}
        label={t('manage.website')}
        placeholder={t('manage.addWebsite')}
        onChange={handleInputChange as ManageInputOnChange}
        disableTextTrimming
        stacked={false}
        error={isInvalidUrl}
        errorText={t('manage.enterValidUrl')}
        publicVisibilityValues={publicVisibilityValues}
        isCardOpen={isCardOpen}
        setPublicVisibilityValues={setPublicVisibilityValues}
        setIsCardOpen={setIsCardOpen}
        disabled={!isLoaded}
      />
      <Divider className={classes.divider} />
      <Box className={classes.sectionHeader}>
        <Box display="flex">
          <Typography variant="h6">{t('profile.socials')}</Typography>
        </Box>
      </Box>
      <ManageInput
        mt={2}
        id={DomainProfileSocialMedia.Twitter}
        value={userProfile?.socialAccounts?.twitter.location}
        label={'Twitter (X)'}
        labelIcon={<TwitterXIcon className={classes.twitterIcon} />}
        placeholder={t('manage.enterUsernameOrProfileURL')}
        onChange={handleSocialInputChange as ManageInputOnChange}
        disableTextTrimming
        stacked={false}
        disabled={!isLoaded}
      />
      <ManageInput
        mt={2}
        id={DomainProfileSocialMedia.Discord}
        value={userProfile?.socialAccounts?.discord.location}
        label={'Discord'}
        labelIcon={<Discord className={classes.discordIcon} />}
        placeholder={t('manage.enterUsername')}
        onChange={handleSocialInputChange as ManageInputOnChange}
        disableTextTrimming
        stacked={false}
        disabled={!isLoaded}
      />
      <ManageInput
        mt={2}
        id={DomainProfileSocialMedia.YouTube}
        value={userProfile?.socialAccounts?.youtube.location}
        label={'YouTube'}
        labelIcon={<YouTubeIcon className={classes.youtubeIcon} />}
        placeholder={t('manage.enterYoutubeChannel')}
        onChange={handleSocialInputChange as ManageInputOnChange}
        disableTextTrimming
        stacked={false}
        disabled={!isLoaded}
      />
      <ManageInput
        mt={2}
        id={DomainProfileSocialMedia.Reddit}
        value={userProfile?.socialAccounts?.reddit.location}
        label={'Reddit'}
        labelIcon={<RedditIcon className={classes.redditIcon} />}
        placeholder={t('manage.enterRedditUsernameOrProfileURL')}
        onChange={handleSocialInputChange as ManageInputOnChange}
        disableTextTrimming
        stacked={false}
        disabled={!isLoaded}
      />
      <ManageInput
        mt={2}
        id={DomainProfileSocialMedia.Telegram}
        value={userProfile?.socialAccounts?.telegram.location}
        label={'Telegram'}
        labelIcon={<TelegramIcon className={classes.telegramIcon} />}
        placeholder={t('manage.enterUsername')}
        onChange={handleSocialInputChange as ManageInputOnChange}
        disableTextTrimming
        stacked={false}
        disabled={!isLoaded}
      />
      <ManageInput
        mt={2}
        id={DomainProfileSocialMedia.Github}
        value={userProfile?.socialAccounts?.github.location}
        label={'Github'}
        labelIcon={<GitHubIcon className={classes.githubIcon} />}
        placeholder={t('manage.enterUsername')}
        onChange={handleSocialInputChange as ManageInputOnChange}
        disableTextTrimming
        stacked={false}
        disabled={!isLoaded}
      />
      <ManageInput
        mt={2}
        id={DomainProfileSocialMedia.Linkedin}
        value={userProfile?.socialAccounts?.linkedin.location}
        label={'Linkedin'}
        labelIcon={<LinkedInIcon className={classes.linkedinIcon} />}
        placeholder={t('manage.enterLinkedinUrl')}
        onChange={handleSocialInputChange as ManageInputOnChange}
        disableTextTrimming
        stacked={false}
        disabled={!isLoaded}
      />
      <ProfileManager
        domain={domain}
        ownerAddress={address}
        setWeb3Deps={setWeb3Deps}
        saveClicked={fireRequest}
        setSaveClicked={setFireRequest}
        onSignature={handleProfileData}
        closeAfterSignature={true}
      />
    </Box>
  );
};
