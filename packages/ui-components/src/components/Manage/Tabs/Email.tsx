import MailLockOutlinedIcon from '@mui/icons-material/MailLockOutlined';
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
import {ProfileManager} from '../../Wallet/ProfileManager';
import BulkUpdateLoadingButton from '../common/BulkUpdateLoadingButton';
import ManageInput from '../common/ManageInput';
import {TabHeader} from '../common/TabHeader';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(-3),
    },
  },
  checkboxContainer: {
    marginTop: theme.spacing(2),
  },
  checkbox: {
    marginRight: theme.spacing(0),
    marginTop: theme.spacing(-1),
    alignSelf: 'flex-start',
  },
  infoContainer: {
    marginBottom: theme.spacing(3),
  },
  button: {
    marginTop: theme.spacing(4),
  },
  mailIcon: {
    color: theme.palette.neutralShades[600],
    marginRight: theme.spacing(2),
    width: '75px',
    height: '75px',
  },
  mailDescription: {
    color: theme.palette.neutralShades[600],
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
  const [isInvalidEmail, setIsInvalidEmail] = useState(false);
  const [isBulkUpdate, setIsBulkUpdate] = useState(false);
  const [updatedCount, setUpdatedCount] = useState(0);
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string>();
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
        // retrieve user profile data from profile API
        const existingData = await getProfileUserData(
          domain,
          [DomainFieldTypes.Profile, DomainFieldTypes.Messaging],
          signature,
          expiry,
        );
        if (!isLoaded) {
          if (existingData) {
            setUserProfile(existingData);
            setIsEmailDisabled(
              existingData.messaging?.disabled === undefined ||
                existingData.messaging.disabled,
            );
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
            undefined,
            undefined,
            isBulkUpdate,
          );

          // saving profile complete
          if (updateResult?.success) {
            setUpdatedCount(updateResult.domains.length);
            setIsSaving(false);
            setDirtyFlag(false);
          } else {
            setUpdateErrorMessage(t('manage.updateError'));
          }
        }
      }
    } catch (e) {
      setUpdateErrorMessage(t('manage.updateError'));
      notifyError(e, 'error', 'PROFILE', 'Fetch', {
        msg: 'unable to manage user profile',
      });
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

    if (id === 'privateEmail') {
      setIsInvalidEmail(
        !value.match(
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        ),
      );
    }
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
      <TabHeader
        icon={<MailLockOutlinedIcon />}
        description={t('manage.emailDescription')}
        learnMoreLink="https://support.unstoppabledomains.com/support/solutions/articles/48001218107-unstoppable-email"
      />
      {isLoaded ? (
        <>
          <ManageInput
            id="privateEmail"
            value={userProfile?.profile?.privateEmail}
            label={t('manage.privateEmail')}
            placeholder={t('manage.enterPrivateEmail')}
            onChange={handleInputChange}
            disableTextTrimming
            error={isInvalidEmail}
            errorText={t('manage.enterValidEmail', {
              domain: `${domain}@${config.MESSAGING.EMAIL_DOMAIN}`,
            })}
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
          <BulkUpdateLoadingButton
            address={address}
            count={updatedCount}
            isBulkUpdate={isBulkUpdate}
            setIsBulkUpdate={setIsBulkUpdate}
            variant="contained"
            onClick={handleSave}
            loading={isSaving}
            className={classes.button}
            disabled={!dirtyFlag}
            errorMessage={updateErrorMessage}
          />
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
