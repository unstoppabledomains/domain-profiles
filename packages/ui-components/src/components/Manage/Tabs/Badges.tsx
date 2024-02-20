import CheckIcon from '@mui/icons-material/Check';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getDomainBadges, refreshUserBadges} from '../../../actions';
import {useWeb3Context} from '../../../hooks';
import type {
  SerializedCryptoWalletBadge,
  SerializedUserDomainProfileData,
} from '../../../lib';
import {useTranslationContext} from '../../../lib';
import {notifyEvent} from '../../../lib/error';
import {Badge} from '../../Badges';
import {ProfileManager} from '../../Wallet/ProfileManager';
import {DomainProfileTabType} from '../DomainProfile';
import {TabHeader} from '../common/TabHeader';

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
      marginRight: theme.spacing(-3),
    },
  },
  description: {
    color: theme.palette.neutralShades[600],
  },
  badgeContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

export const Badges: React.FC<BadgesProps> = ({address, domain, onUpdate}) => {
  const {classes} = useStyles();
  const {setWeb3Deps} = useWeb3Context();
  const [t] = useTranslationContext();
  const [fireRequest, setFireRequest] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<string>();
  const [badges, setBadges] = useState<SerializedCryptoWalletBadge[]>([]);
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string>();

  useEffect(() => {
    void loadBadges();
  }, []);

  const loadBadges = async () => {
    // set page to loading state
    setIsLoaded(false);

    // retrieve initial set of badges
    try {
      const badgeResponse = await getDomainBadges(domain);
      setBadges(badgeResponse?.list || []);
    } catch (e) {
      notifyEvent(e, 'warning', 'BADGES', 'Fetch', {
        msg: 'error retrieving badges',
      });
    }

    // set page to loaded state
    setIsLoaded(true);
  };

  // handleRefreshBadges request badge refresh
  const handleRefreshBadges = async (signature: string, expires: string) => {
    try {
      // only proceed if signature available
      if (domain && signature && expires) {
        // make authenticated request to refresh badges
        const updatedBadges = await refreshUserBadges(address, domain, {
          expires,
          signature,
        });

        // compare new and old badges
        const newBadges: SerializedCryptoWalletBadge[] = [];
        updatedBadges.map(newBadge => {
          if (
            badges.filter(existingBadge => existingBadge.code === newBadge.code)
              .length === 0
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
    } catch (e) {
      setUpdateErrorMessage(t('manage.badgeErrorMessage'));
      notifyEvent(e, 'error', 'PROFILE', 'Fetch', {
        msg: 'unable to manage user profile',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
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
        <>
          <Box mt={1} mb={5} display="flex">
            <LoadingButton
              variant="contained"
              onClick={handleSave}
              loading={isSaving}
              fullWidth
              disabled={refreshStatus !== undefined}
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
              {updateErrorMessage ||
                refreshStatus ||
                t('profile.refreshBadges')}
            </LoadingButton>
          </Box>
          {badges.length === 0 && (
            <Box display="flex" textAlign="center">
              <Typography variant="body1" className={classes.description}>
                {t('manage.badgesEmpty')}
              </Typography>
            </Box>
          )}
          <Grid container spacing={2}>
            {badges.map((badge, i) => (
              <Grid
                item
                xs={4}
                sm={3}
                key={`badge-manage-${badge.configId}-${i}`}
                className={classes.badgeContainer}
              >
                <Badge
                  domain={domain}
                  {...badge}
                  usageEnabled={false}
                  tooltipPlacement="top"
                  profile={true}
                  iconOnly={true}
                  setWeb3Deps={setWeb3Deps}
                  authWallet={address}
                  authDomain={domain}
                />
              </Grid>
            ))}
          </Grid>
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
        onSignature={handleRefreshBadges}
      />
    </Box>
  );
};

export type BadgesProps = {
  address: string;
  domain: string;
  onUpdate(
    tab: DomainProfileTabType,
    data?: SerializedUserDomainProfileData,
  ): void;
};
