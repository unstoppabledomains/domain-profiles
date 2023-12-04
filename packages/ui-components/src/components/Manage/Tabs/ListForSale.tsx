import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileUserData, setProfileUserData} from '../../../actions';
import {useWeb3Context} from '../../../hooks';
import type {SerializedUserDomainProfileData} from '../../../lib';
import {DomainFieldTypes, useTranslationContext} from '../../../lib';
import {notifyError} from '../../../lib/error';
import {ProfileManager} from '../../Wallet/ProfileManager';
import {DomainProfileTabType} from '../DomainProfile';
import BulkUpdateLoadingButton from './BulkUpdateLoadingButton';
import ManageInput from './Profile/ManageInput';
import {TabHeader} from './TabHeader';

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
  },
  infoContainer: {
    marginBottom: theme.spacing(3),
  },
  button: {
    marginTop: theme.spacing(4),
  },
  icon: {
    color: theme.palette.neutralShades[600],
    marginRight: theme.spacing(2),
    width: '75px',
    height: '75px',
  },
  descriptionText: {
    color: theme.palette.neutralShades[600],
  },
  enableDescription: {
    color: theme.palette.neutralShades[600],
  },
}));

export const ListForSale: React.FC<ListForSale> = ({
  address,
  domain,
  onUpdate,
}) => {
  const {classes} = useStyles();
  const {setWeb3Deps} = useWeb3Context();
  const [t] = useTranslationContext();
  const [fireRequest, setFireRequest] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isListingEnabled, setIsListingEnabled] = useState(false);
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
            setIsListingEnabled(
              !!existingData.profile?.publicDomainSellerEmail,
            );
            setIsLoaded(true);
          }
        } else if (userProfile) {
          // clear the value if enabled box not checked
          if (
            !isListingEnabled &&
            userProfile.profile?.publicDomainSellerEmail
          ) {
            userProfile.profile.publicDomainSellerEmail = '';
          }

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
            onUpdate(DomainProfileTabType.ListForSale, {
              ...userProfile,
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
    });
    setIsListingEnabled(false);
    if (id === 'publicDomainSellerEmail') {
      setIsInvalidEmail(
        !value.match(
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        ),
      );
    }
  };

  const handleEnabledChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsListingEnabled(event.target.checked);
    setDirtyFlag(true);
  };

  const handleSave = () => {
    setFireRequest(true);
  };

  return (
    <Box className={classes.container}>
      {isLoaded ? (
        <>
          <TabHeader
            icon={<SellOutlinedIcon />}
            description={t('manage.listForSaleDescription')}
            learnMoreLink="https://support.unstoppabledomains.com/support/solutions/articles/48001205861-list-domain-for-sale-on-our-website"
          />
          <ManageInput
            id="publicDomainSellerEmail"
            value={userProfile?.profile?.publicDomainSellerEmail}
            label={t('manage.listForSaleEmail')}
            placeholder={t('manage.enterListForSaleEmail')}
            onChange={handleInputChange}
            disableTextTrimming
            error={isInvalidEmail}
            errorText={t('manage.enterValidListForSaleEmail')}
            stacked={false}
          />
          <Box className={classes.checkboxContainer}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={handleEnabledChange}
                    className={classes.checkbox}
                    checked={isListingEnabled}
                    disabled={!userProfile?.profile?.publicDomainSellerEmail}
                  />
                }
                label={
                  <Box display="flex" flexDirection="column">
                    <Typography variant="body1">
                      {t('manage.enableListForSale', {domain})}
                    </Typography>
                    <Typography
                      variant="caption"
                      className={classes.enableDescription}
                    >
                      {t('manage.enableListForSaleDescription')}
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

export type ListForSale = {
  address: string;
  domain: string;
  onUpdate(
    tab: DomainProfileTabType,
    data?: SerializedUserDomainProfileData,
  ): void;
};
