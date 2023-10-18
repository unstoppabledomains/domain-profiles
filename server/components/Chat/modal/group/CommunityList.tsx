import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import type {Theme} from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import config from '@unstoppabledomains/config';
import {getDomainBadges} from 'actions/domainActions';
import Bluebird from 'bluebird';
import useTranslationContext from 'lib/i18n';
import type {SerializedCryptoWalletBadge} from 'lib/types/badge';
import {UD_BLUE_BADGE_CODE} from 'lib/types/domain';
import React, {useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {getProfileData} from 'actions/domainProfile';
import {getGroupInfo} from '../../protocol/push';
import CommunityPreview from './CommunityPreview';

const useStyles = makeStyles()((theme: Theme) => ({
  cardContainer: {
    margin: 0,
    padding: 0,
  },
  headerText: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(5),
    color: theme.palette.neutralShades[400],
  },
  emptyIcon: {
    width: 100,
    height: 100,
  },
  emptyButton: {
    marginTop: theme.spacing(2),
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(10),
    color: theme.palette.neutralShades[400],
  },
  loadingText: {
    marginTop: theme.spacing(1),
    color: 'inherit',
  },
  loadingSpinner: {
    color: 'inherit',
  },
}));

export const filteredBadgeCodes = [UD_BLUE_BADGE_CODE];

export type CommunityListProps = {
  address: string;
  domain: string;
  pushKey: string;
  searchTerm?: string;
  setActiveCommunity: (v: SerializedCryptoWalletBadge) => void;
};

export const CommunityList: React.FC<CommunityListProps> = ({
  address,
  domain,
  pushKey,
  searchTerm,
  setActiveCommunity,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const [badges, setBadges] = useState<SerializedCryptoWalletBadge[]>();
  const [inGroupMap, setInGroupMap] = useState<Record<string, boolean>>({});
  const [isUdBlue, setIsUdBlue] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>();

  useEffect(() => {
    // only load once when domain is first defined
    if (!domain || badges) {
      return;
    }
    void loadBadges();
  }, [domain]);

  const loadBadges = async () => {
    // query user badges
    setLoadingText(t('push.loadingCommunities'));
    const [badgeData, domainProfile] = await Promise.all([
      getDomainBadges(domain, {withoutPartners: true}),
      getProfileData(domain, Date.now()),
    ]);

    // determine group membership
    const groups: Record<string, boolean> = {};
    await Bluebird.map(
      badgeData.list,
      async b => {
        if (!b.groupChatId) {
          return;
        }
        const groupData = await getGroupInfo(b.groupChatId);
        if (groupData) {
          const groupWallets = groupData.members.map(m =>
            m.wallet.replace('eip155:', '').toLowerCase(),
          );
          groups[b.groupChatId] = groupWallets.includes(address.toLowerCase());
        }
        return;
      },
      {concurrency: 3},
    );

    // save user state
    setInGroupMap(groups);
    setBadges(badgeData.list.filter(b => !filteredBadgeCodes.includes(b.code)));
    if (domainProfile?.profile?.udBlue) {
      setIsUdBlue(domainProfile.profile.udBlue);
    }
    setLoadingText(undefined);
  };

  const inGroup = (chatId?: string) => {
    if (!chatId) {
      return false;
    }
    return inGroupMap[chatId];
  };

  const handleGetBadge = () => {
    window.location.href = `${config.UNSTOPPABLE_WEBSITE_URL}/manage?domain=${domain}`;
  };

  return loadingText ? (
    <Box className={classes.loadingContainer}>
      <CircularProgress className={classes.loadingSpinner} />
      <Typography className={classes.loadingText}>{loadingText}</Typography>
    </Box>
  ) : badges && badges.length > 0 ? (
    <Box className={classes.cardContainer}>
      {badges
        ?.sort((a, b) => {
          return (
            Number(inGroup(b.groupChatId)) - Number(inGroup(a.groupChatId)) ||
            a.name.localeCompare(b.name)
          );
        })
        .map((badge, i, sortedBadges) => (
          <>
            {i > 0 &&
              inGroup(sortedBadges[i - 1].groupChatId) &&
              !inGroup(badge.groupChatId) && (
                <Typography className={classes.headerText} variant="h6">
                  {t('push.availableCommunities')}
                </Typography>
              )}
            <CommunityPreview
              key={badge.code}
              address={address}
              badge={badge}
              inGroup={inGroup(badge.groupChatId)}
              isUdBlue={isUdBlue}
              pushKey={pushKey}
              onReload={loadBadges}
              searchTerm={searchTerm}
              setActiveCommunity={setActiveCommunity}
            />
          </>
        ))}
    </Box>
  ) : (
    <Box className={classes.emptyContainer}>
      <EmojiEventsOutlinedIcon className={classes.emptyIcon} />
      <Typography variant="h6">{t('push.communitiesCollect')}</Typography>
      <Button
        variant="contained"
        onClick={handleGetBadge}
        className={classes.emptyButton}
      >
        {t('push.joinCommunity')}
      </Button>
    </Box>
  );
};

export default CommunityList;
