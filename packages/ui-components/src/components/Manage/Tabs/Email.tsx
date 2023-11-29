import MailLockOutlinedIcon from '@mui/icons-material/MailLockOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileUserData, setProfileUserData} from '../../../actions';
import {useWeb3Context} from '../../../hooks';
import type {SerializedUserDomainProfileData} from '../../../lib';
import {DomainFieldTypes, useTranslationContext} from '../../../lib';
import {notifyError} from '../../../lib/error';
import Link from '../../Link';
import {ProfileManager} from '../../Wallet/ProfileManager';
import ManageInput from './Profile/ManageInput';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    margin: theme.spacing(1),
  },
  checkboxContainer: {
    marginTop: theme.spacing(2),
    maxWidth: '515px',
  },
  checkbox: {
    marginRight: theme.spacing(1),
  },
  button: {
    marginTop: theme.spacing(3),
  },
  mailIcon: {
    color: theme.palette.neutralShades[600],
    marginRight: theme.spacing(2),
    width: '75px',
    height: '75px',
  },
  mailDescription: {
    color: theme.palette.neutralShades[600],
    maxWidth: '450px',
  },
  enableDescription: {
    color: theme.palette.neutralShades[600],
  },
}));

export const Email: React.FC<EmailProps> = ({address, domain}) => {
  const {classes} = useStyles();
  const {setWeb3Deps} = useWeb3Context();
  const [t] = useTranslationContext();
  const [fireRequest, setFireRequest] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEmailDisabled, setIsEmailDisabled] = useState(true);
  const [dirtyFlag, setDirtyFlag] = useState(false);
  const [userProfile, setUserProfile] =
    useState<SerializedUserDomainProfileData>();

  useEffect(() => {
    setFireRequest(true);
  }, []);

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
            [DomainFieldTypes.Profile, DomainFieldTypes.Messaging],
            signature,
            expiry,
          );
          if (data) {
            setUserProfile(data);
            setIsEmailDisabled(
              data.messaging?.disabled === undefined || data.messaging.disabled,
            );
            setIsLoaded(true);
          }
        } else if (userProfile) {
          // update the domain's user data from profile API
          setIsSaving(true);
          await setProfileUserData(domain, userProfile, signature, expiry);
          setIsSaving(false);
          setDirtyFlag(false);
        }
      }
    } catch (e) {
      notifyError(e, {msg: 'unable to manage user profile'});
    }
  };

  const handleInputChange = (id: string, value: string) => {
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
      messaging: {
        disabled: isEmailDisabled,
        resetRules: !isEmailDisabled,
        thirdPartyMessagingConfigType: 'profileEmail',
        thirdPartyMessagingEnabled: false,
      },
    });
  };

  const handleEnabledChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsEmailDisabled(!event.target.checked);
    setDirtyFlag(true);
    setUserProfile({
      ...userProfile,
      messaging: {
        disabled: !event.target.checked,
        resetRules: event.target.checked,
        thirdPartyMessagingConfigType: 'profileEmail',
        thirdPartyMessagingEnabled: false,
      },
    });
  };

  const handleSave = () => {
    setFireRequest(true);
  };

  return (
    <Box className={classes.container}>
      {isLoaded ? (
        <>
          <Box display="flex" alignItems="center" alignContent="center">
            <MailLockOutlinedIcon className={classes.mailIcon} />
            <Typography variant="body2" className={classes.mailDescription}>
              {t('manage.emailDescription')}{' '}
              <Link
                external={true}
                to="https://support.unstoppabledomains.com/support/solutions/articles/48001218107-unstoppable-email"
              >
                {t('profile.learnMore')}
              </Link>
            </Typography>
          </Box>
          <ManageInput
            id="privateEmail"
            value={userProfile?.profile?.privateEmail}
            label={t('manage.privateEmail')}
            placeholder={t('manage.enterPrivateEmail')}
            onChange={handleInputChange}
            disableTextTrimming
            stacked={false}
          />
          <Box className={classes.checkboxContainer}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={handleEnabledChange}
                    className={classes.checkbox}
                    checked={
                      !isEmailDisabled && !!userProfile?.profile?.privateEmail
                    }
                    disabled={!userProfile?.profile?.privateEmail}
                  />
                }
                label={
                  <Box display="flex" flexDirection="column">
                    <Typography variant="body1">
                      {t('manage.enableEmailForAddress', {
                        privateAddress: userProfile?.profile?.privateEmail
                          ? userProfile.profile.privateEmail
                          : t('manage.yourPrivateEmail'),
                        udMeAddress: `${domain}@${config.MESSAGING.EMAIL_DOMAIN}`,
                      })}
                    </Typography>
                    <Typography
                      variant="caption"
                      className={classes.enableDescription}
                    >
                      {t('manage.enableEmailForAddressDescription', {
                        privateAddress: userProfile?.profile?.privateEmail
                          ? userProfile.profile.privateEmail
                          : t('manage.yourPrivateEmail'),
                        udMeAddress: `${domain}@${config.MESSAGING.EMAIL_DOMAIN}`,
                      })}
                    </Typography>
                  </Box>
                }
              />
            </FormGroup>
          </Box>
          <LoadingButton
            variant="contained"
            onClick={handleSave}
            loading={isSaving}
            className={classes.button}
            disabled={!dirtyFlag}
          >
            {t('common.save')}
          </LoadingButton>
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

export type EmailProps = {
  address: string;
  domain: string;
};
