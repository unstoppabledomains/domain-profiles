import BadgeCount from '@mui/material/Badge';
import Grid from '@mui/material/Grid';
import type {TooltipProps} from '@mui/material/Tooltip';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import type {Theme} from '@mui/material/styles';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {getBadge} from 'actions/badgeActions';
import {useFeatureFlags} from 'actions/featureFlagActions';
import type {SerializedCryptoWalletBadge} from 'lib/types/badge';
import type {Web3Dependencies} from 'lib/types/web3';
import {useRouter} from 'next/router';
import React, {useCallback, useEffect, useState} from 'react';

import {makeStyles} from '@unstoppabledomains/ui-kit/styles';

import {filteredBadgeCodes} from '../Chat/modal/group/CommunityList';
import BadgePopupModal from './BadgePopupModal';

export const SMALL_BADGE_SIZE = 35;
export const MOBILE_BADGE_SIZE = 56;
export const DEFAULT_BADGE_SIZE = 80;
type StyleProps = {
  isMobile?: boolean;
  small?: boolean;
};
const useStyles = makeStyles<StyleProps>()(
  (theme: Theme, {isMobile, small}: StyleProps) => ({
    wrapper: {
      width: small ? 'auto' : '100%',
      columnGap: theme.spacing(2),
    },
    badgeIconContainer: {
      cursor: 'pointer',
      width: small
        ? SMALL_BADGE_SIZE
        : isMobile
        ? MOBILE_BADGE_SIZE
        : DEFAULT_BADGE_SIZE,
      height: small
        ? SMALL_BADGE_SIZE
        : isMobile
        ? MOBILE_BADGE_SIZE
        : DEFAULT_BADGE_SIZE,
    },
    badgeTierStandard: {
      border: `2px solid white`,
    },
    badgeTierFeatured2: {
      border: `2px solid ${theme.palette.neutralShades[500]}`,
    },
    badgeTierFeatured3: {
      border: `2px solid ${theme.palette.primaryShades[500]}`,
    },
    badgeEmojiContainerWithCircle: {
      boxShadow: theme.shadows[6],
      borderRadius: '50%',
      width: small
        ? SMALL_BADGE_SIZE
        : isMobile
        ? MOBILE_BADGE_SIZE
        : DEFAULT_BADGE_SIZE,
      height: small
        ? SMALL_BADGE_SIZE
        : isMobile
        ? MOBILE_BADGE_SIZE
        : DEFAULT_BADGE_SIZE,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize:
        (small
          ? SMALL_BADGE_SIZE
          : isMobile
          ? MOBILE_BADGE_SIZE
          : DEFAULT_BADGE_SIZE) / 1.5,
    },
    badgeIconContainerWithCircle: {
      boxShadow: theme.shadows[6],
      borderRadius: '50%',
      width: small
        ? SMALL_BADGE_SIZE
        : isMobile
        ? MOBILE_BADGE_SIZE
        : DEFAULT_BADGE_SIZE,
      height: small
        ? SMALL_BADGE_SIZE
        : isMobile
        ? MOBILE_BADGE_SIZE
        : DEFAULT_BADGE_SIZE,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeTitleWrapper: {
      paddingTop: theme.spacing(small ? 0 : isMobile ? 2 : 0),
      overflow: 'hidden',
    },
    title: {
      fontSize: small
        ? theme.typography.subtitle2.fontSize
        : theme.typography.subtitle1.fontSize,
      fontWeight: theme.typography.fontWeightMedium,
      color: small ? 'inherit' : theme.palette.common.black,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
    hiddenTitle: {
      color: theme.palette.neutralShades[400],
    },
    infoIcon: {
      fontSize: theme.typography.h6.fontSize,
      color: theme.palette.neutralShades[600],
    },
  }),
);

enum BadgePopupModalSettings {
  OpenBadgePopupModal = 'openBadgeCode',
}

type Props = SerializedCryptoWalletBadge & {
  small?: boolean;
  hidden?: boolean;
  usageEnabled?: boolean;
  iconOnly?: boolean;
  tooltipPlacement?: 'right' | 'top';
  profile?: boolean;
  domain?: string;
  setWeb3Deps?: (value: Web3Dependencies | undefined) => void;
  authWallet?: string;
  authDomain?: string;
};

const Badge: React.FC<Props> = ({
  small,
  iconOnly,
  hidden,
  code,
  logo,
  linkUrl,
  name,
  description,
  tooltipPlacement,
  usageEnabled,
  profile,
  domain,
  gallery,
  count,
  setWeb3Deps,
  authWallet,
  authDomain,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {classes, cx} = useStyles({isMobile, small});
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [holdersRemaining, setHoldersRemaining] = useState<number>();
  const [holdersFeatured, setHoldersFeatured] = useState<string[]>([]);
  const [holders, setHolders] = useState<number>();
  const [rank, setRank] = useState<number>();
  const [primarySponsor, setPrimarySponsor] = useState<string>();
  const [sponsorshipAvailable, setSponsorshipAvailable] = useState(false);
  const [allSponsors, setAllSponsors] = useState<string[]>();
  const [authorizedAddresses, setAuthorizedAddresses] = useState<string[]>([]);
  const {query} = useRouter();
  const {data: featureFlags} = useFeatureFlags(false, domain);

  useEffect(() => {
    //set badge modal open if query param matches badge code
    if (code === query[BadgePopupModalSettings.OpenBadgePopupModal]) {
      setIsOpenModal(true);
    }
  }, [query]);

  useEffect(() => {
    const loadBadgeUsage = async () => {
      // retrieve badge usage data
      const badgeData = await getBadge(code);
      if (!badgeData) return;
      if (badgeData?.usage) {
        setRank(badgeData.usage.rank);
        setHoldersFeatured(badgeData.usage.featured ?? []);
        const remaining =
          badgeData.usage.holders - (badgeData.usage.featured?.length || 0);
        if (remaining > 0) {
          setHoldersRemaining(remaining);
        }
        setHolders(badgeData.usage.holders);
      }
      if (badgeData?.sponsorship?.latest) {
        setPrimarySponsor(badgeData.sponsorship.latest);
      }
      if (badgeData?.sponsorship?.domains) {
        setAllSponsors(badgeData.sponsorship.domains.map(d => d.name));
      }
      if (badgeData?.sponsorship?.authorizedAddresses) {
        setAuthorizedAddresses(badgeData.sponsorship.authorizedAddresses);
      }
      // determine whether sponsorship is available
      const sponsorCount = badgeData.sponsorship?.domains
        ? badgeData.sponsorship.domains
            .map(d => d.count)
            .reduce((t, c) => t + c, 0)
        : 0;
      setSponsorshipAvailable(sponsorCount < badgeData.sponsorship.max);
    };
    if (usageEnabled) {
      void loadBadgeUsage();
    }
  }, [code, usageEnabled]);

  const handleShowModal = useCallback(async () => {
    if (hidden) return;
    setIsOpenModal(status => !status);
  }, [small, hidden]);

  const WithTooltip = (tooltipPlacement ? Tooltip : React.Fragment) as (
    props: TooltipProps,
  ) => JSX.Element;
  const tooltipProps = (
    tooltipPlacement
      ? {
          arrow: true,
          title: (
            <React.Fragment>{iconOnly ? name : description}</React.Fragment>
          ),
          TransitionComponent: Zoom,
          placement: tooltipPlacement,
        }
      : {}
  ) as TooltipProps;

  return (
    <div>
      <WithTooltip {...tooltipProps}>
        <BadgeCount
          badgeContent={!small && count && count > 1 ? count : undefined}
          overlap="circular"
          color="secondary"
          max={999}
        >
          <Grid
            container
            title={tooltipPlacement ? undefined : iconOnly ? name : description}
            alignItems="center"
            onClick={handleShowModal}
            data-testid="badgeWrapper"
            className={classes.wrapper}
            wrap={isMobile ? 'wrap' : 'nowrap'}
          >
            <Grid
              item
              container
              alignContent="center"
              className={cx(classes.badgeIconContainer)}
            >
              <img
                className={cx(
                  classes.badgeIconContainerWithCircle,
                  classes.badgeTierStandard,
                  {
                    [classes.badgeTierFeatured2]:
                      gallery?.tier === 2 &&
                      featureFlags.variations
                        ?.ecommerceServiceEnablePartnerTokenGallery,
                    [classes.badgeTierFeatured3]:
                      gallery?.tier === 3 &&
                      featureFlags.variations
                        ?.ecommerceServiceEnablePartnerTokenGallery,
                  },
                )}
                src={logo}
                alt="badge logo"
              />
            </Grid>
            {!iconOnly && (
              <Grid item className={classes.badgeTitleWrapper}>
                <div
                  className={cx(classes.title, {
                    [classes.hiddenTitle]: hidden,
                  })}
                >
                  {name}
                </div>
              </Grid>
            )}
          </Grid>
        </BadgeCount>
      </WithTooltip>
      <BadgePopupModal
        small={small}
        isOpenModal={isOpenModal}
        handleShowModal={handleShowModal}
        logo={logo}
        linkUrl={linkUrl}
        description={description}
        name={name}
        badgeCode={code}
        holdersFeatured={holdersFeatured}
        holdersRemaining={holdersRemaining}
        holders={holders}
        profile={profile}
        domain={domain}
        primarySponsor={primarySponsor}
        allSponsors={allSponsors}
        sponsorshipAvailable={sponsorshipAvailable}
        groupChatAvailable={
          featureFlags.variations?.ecommerceServiceUsersEnableChatCommunity &&
          !filteredBadgeCodes.includes(code)
        }
        rank={rank}
        setWeb3Deps={setWeb3Deps}
        authWallet={authWallet}
        authorizedAddresses={authorizedAddresses}
        authDomain={authDomain}
      />
    </div>
  );
};

export default Badge;
