import CheckIcon from '@mui/icons-material/Check';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {
  getDomainBadges,
  refreshUserBadges,
  updateUserBadges,
} from '../../../actions';
import {useWeb3Context} from '../../../hooks';
import type {SerializedCryptoWalletBadge} from '../../../lib';
import {useTranslationContext} from '../../../lib';
import {notifyEvent} from '../../../lib/error';
import {Badge} from '../../Badges';
import {ProfileManager} from '../../Wallet/ProfileManager';
import {TabHeader} from '../common/TabHeader';
import {DomainProfileTabType} from '../common/types';
import type {ManageTabProps} from '../common/types';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  description: {
    color: theme.palette.neutralShades[600],
    marginBottom: theme.spacing(1),
  },
  badgeContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

export const Badges: React.FC<ManageTabProps> = ({
  address,
  domain,
  onUpdate,
  setButtonComponent,
}) => {
  const {classes} = useStyles();
  const {setWeb3Deps} = useWeb3Context();
  const [t] = useTranslationContext();
  const [fireRequest, setFireRequest] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<string>();
  const [badges, setBadges] = useState<SerializedCryptoWalletBadge[]>([]);
  const [badgeToUpdate, setBadgeToUpdate] =
    useState<SerializedCryptoWalletBadge>();
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string>();

  useEffect(() => {
    setIsLoaded(false);
    setButtonComponent(<></>);
    void loadBadges();
  }, [domain]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    setButtonComponent(
      <LoadingButton
        variant="contained"
        onClick={handleRefreshClick}
        loading={isRefreshing}
        fullWidth
        disabled={
          updateErrorMessage !== undefined || refreshStatus !== undefined
        }
        startIcon={
          updateErrorMessage ? (
            <ErrorOutlineOutlinedIcon />
          ) : refreshStatus ? (
            <CheckIcon />
          ) : (
            <RefreshOutlinedIcon />
          )
        }
      >
        {updateErrorMessage || refreshStatus || t('profile.refreshBadges')}
      </LoadingButton>,
    );
  }, [isRefreshing, updateErrorMessage, refreshStatus, isLoaded]);

  const loadBadges = async () => {
    // set page to loading state
    setIsLoaded(false);

    // retrieve initial set of badges
    try {
      const badgeResponse = await getDomainBadges(domain, {
        withoutPartners: true,
      });
      setBadges(badgeResponse?.list || []);
    } catch (e) {
      notifyEvent(e, 'warning', 'Badges', 'Fetch', {
        msg: 'error retrieving badges',
      });
    }

    // set page to loaded state
    setIsLoaded(true);
  };

  // handleUpdateBadges make a request to update badges
  const handleUpdateBadges = async (signature: string, expires: string) => {
    try {
      // only proceed if signature available
      if (domain && signature && expires) {
        // make authenticated request to refresh badges
        if (isRefreshing) {
          const updatedBadges = await refreshUserBadges(address, domain, {
            expires,
            signature,
          });

          // compare new and old badges
          const newBadges: SerializedCryptoWalletBadge[] = [];
          updatedBadges.map(newBadge => {
            if (
              badges.filter(
                existingBadge => existingBadge.code === newBadge.code,
              ).length === 0
            ) {
              newBadges.push(newBadge);
            }
          });

          // notify of changes
          setBadges([...newBadges, ...badges]);
          setRefreshStatus(
            newBadges.length > 0
              ? t('manage.badgesSuccess', {
                  count: newBadges.length,
                  s: newBadges.length === 1 ? '' : 's',
                })
              : t('manage.badgesNoNew'),
          );
          onUpdate(DomainProfileTabType.Badges);
        }

        // update the requested badge
        if (badgeToUpdate) {
          await updateUserBadges(address, domain, [badgeToUpdate], {
            expires,
            signature,
          });
          setBadgeToUpdate(undefined);
        }
      }
    } catch (e) {
      setUpdateErrorMessage(t('manage.badgeErrorMessage'));
      notifyEvent(e, 'error', 'Profile', 'Fetch', {
        msg: 'unable to manage user profile',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleShowHide = async (b: SerializedCryptoWalletBadge) => {
    b.active = !b.active;
    setBadgeToUpdate(b);
    setBadges([...badges]);
    setFireRequest(true);
  };

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    setFireRequest(true);
  };

  return (
    <Box className={classes.container}>
      <TabHeader
        icon={<EmojiEventsOutlinedIcon />}
        description={t('manage.badgesDescription')}
        learnMoreLink="https://support.unstoppabledomains.com/support/solutions/articles/48001215751-badges"
      />
      {isLoaded ? (
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12}>
            <Box display="flex" textAlign="center" justifyContent="center">
              <Typography variant="body2" className={classes.description}>
                {badges.length === 0
                  ? t('manage.badgesEmpty')
                  : t('manage.clickToChangeVisibility')}
              </Typography>
            </Box>
          </Grid>
          {badges
            .filter(badge => badge.active)
            .map((badge, i) => (
              <Grid
                item
                xs={3}
                sm={2}
                key={`badge-manage-${badge.configId}-${i}`}
                className={classes.badgeContainer}
                onClick={() => handleShowHide(badge)}
              >
                <Badge
                  domain={domain}
                  {...badge}
                  small
                  usageEnabled={false}
                  tooltipPlacement="top"
                  profile={true}
                  iconOnly={true}
                  disablePopup={true}
                  hidden={!badge.active}
                  setWeb3Deps={setWeb3Deps}
                  authWallet={address}
                  authDomain={domain}
                />
              </Grid>
            ))}
          {badges.filter(badge => !badge.active).length > 0 && (
            <>
              <Grid item xs={12}>
                <Divider>{t('profile.hidden')}</Divider>
              </Grid>
              {badges
                .filter(badge => !badge.active)
                .map((badge, i) => (
                  <Grid
                    item
                    xs={3}
                    sm={2}
                    key={`badge-manage-${badge.configId}-${i}`}
                    className={classes.badgeContainer}
                    onClick={() => handleShowHide(badge)}
                  >
                    <Badge
                      domain={domain}
                      {...badge}
                      small
                      usageEnabled={false}
                      tooltipPlacement="top"
                      profile={true}
                      iconOnly={true}
                      disablePopup={true}
                      hidden={!badge.active}
                      setWeb3Deps={setWeb3Deps}
                      authWallet={address}
                      authDomain={domain}
                    />
                  </Grid>
                ))}
            </>
          )}
        </Grid>
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
        onSignature={handleUpdateBadges}
      />
    </Box>
  );
};
