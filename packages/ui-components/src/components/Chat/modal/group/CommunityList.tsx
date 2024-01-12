import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type {Theme} from '@mui/material/styles';
import Bluebird from 'bluebird';
import React, {useEffect, useState} from 'react';

import config from '@unstoppabledomains/config';
import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {useFeatureFlags} from '../../../../actions';
import {getDomainBadges} from '../../../../actions/domainActions';
import {getProfileData} from '../../../../actions/domainProfileActions';
import {notifyError} from '../../../../lib/error';
import useTranslationContext from '../../../../lib/i18n';
import type {SerializedCryptoWalletBadge} from '../../../../lib/types/badge';
import {
  DomainFieldTypes,
  UD_BLUE_BADGE_CODE,
} from '../../../../lib/types/domain';
import {getGroupInfo} from '../../protocol/push';
import CallToAction from '../CallToAction';
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

export const CommunityList: React.FC<CommunityListProps> = ({
  address,
  domain,
  pushKey,
  searchTerm,
  setActiveCommunity,
}) => {
  const {classes} = useStyles();
  const [t] = useTranslationContext();
  const {data: featureFlags} = useFeatureFlags(false, domain);
  const [badges, setBadges] = useState<SerializedCryptoWalletBadge[]>();
  const [inGroupMap, setInGroupMap] = useState<Record<string, boolean>>({});
  const [isUdBlue, setIsUdBlue] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>();
  const [isSorted, setIsSorted] = useState(false);

  useEffect(() => {
    // only load once when domain is first defined
    if (!domain || badges) {
      return;
    }
    void loadBadges();
  }, [domain]);

  useEffect(() => {
    if (!badges) {
      return;
    }
    const activeGroupCount = badges.filter(b => inGroup(b.groupChatId)).length;
    const renderedGroupCount = badges.filter(
      b => b.groupChatLatestMessage,
    ).length;
    setIsSorted(
      activeGroupCount === 0 || activeGroupCount === renderedGroupCount,
    );
  }, [badges]);

  const loadBadges = async () => {
    try {
      // query user badges
      setLoadingText(t('push.loadingCommunities'));
      const [badgeData, domainProfile] = await Promise.all([
        getDomainBadges(domain, {withoutPartners: true}),
        getProfileData(domain, [DomainFieldTypes.Profile], Date.now()),
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
            groups[b.groupChatId] = groupWallets.includes(
              address.toLowerCase(),
            );
          }
          return;
        },
        {concurrency: 3},
      );

      // save user state
      setInGroupMap(groups);
      setBadges(
        badgeData.list.filter(b => !filteredBadgeCodes.includes(b.code)),
      );
      setIsUdBlue(
        domainProfile?.profile?.udBlue ||
          !featureFlags.variations
            ?.ecommerceServiceUsersEnableChatCommunityUdBlue,
      );
    } catch (e) {
      notifyError(e, {msg: 'error loading badges'});
    }
    setLoadingText(undefined);
  };

  const refreshBadges = async () => {
    if (!badges) {
      return;
    }
    setBadges([...badges]);
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
            (b.groupChatTimestamp || 0) - (a.groupChatTimestamp || 0) ||
            Number(inGroup(b.groupChatId)) - Number(inGroup(a.groupChatId)) ||
            a.name.localeCompare(b.name)
          );
        })
        .map((badge, i, sortedBadges) => (
          <Box key={`community-container-${badge.code}`}>
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
              onRefresh={refreshBadges}
              searchTerm={searchTerm}
              setActiveCommunity={setActiveCommunity}
              visible={!inGroup(badge.groupChatId) || isSorted}
            />
          </Box>
        ))}
    </Box>
  ) : (
    <CallToAction
      icon="EmojiEventsOutlinedIcon"
      title={t('push.communitiesCollect')}
      buttonText={t('push.joinCommunity')}
      handleButtonClick={handleGetBadge}
    />
  );
};

export type CommunityListProps = {
  address: string;
  domain: string;
  pushKey: string;
  searchTerm?: string;
  setActiveCommunity: (v: SerializedCryptoWalletBadge) => void;
};

export const filteredBadgeCodes = [UD_BLUE_BADGE_CODE];

export default CommunityList;
