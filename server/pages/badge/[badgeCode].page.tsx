import LanguageIcon from '@mui/icons-material/Language';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {getBadge, getSponsorRankings} from 'actions/badgeActions';
import {getDomainRankings, getReverseResolution} from 'actions/domainActions';
import {useFeatureFlags} from 'actions/featureFlagActions';
import BadgeRankings from 'components/Badges/BadgeRankings';
import CollectionStats from 'components/Badges/CollectionStats';
import UnlockSponsorsLeaderboard from 'components/Badges/UnlockSponsorsLeaderboard';
import ProfilePicture from 'components/Domain/ProfilePicture';
import ShareMenu from 'components/Domain/ShareMenu';
import {AccountButton} from 'components/Header/AccountButton';
import {LoginButton, LoginMethod} from 'components/Header/LoginButton';
import Logo from 'components/Image/Logo';
import Link from 'components/Link';
import NftListing from 'components/TokenGallery/NftListing';
import getImageUrl from 'lib/domain/getImageUrl';
import useTranslationContext from 'lib/i18n';
import type {SerializedBadgeInfo} from 'lib/types/badge';
import type {SerializedDomainRank} from 'lib/types/domain';
import {DomainProfileKeys} from 'lib/types/domain';
import {getUAuth} from 'lib/uauth';
import type {GetServerSideProps} from 'next';
import {NextSeo} from 'next-seo';
import {useSnackbar} from 'notistack';
import React, {useEffect, useState} from 'react';
import useIsMounted from 'react-is-mounted-hook';
import useStyles from 'styles/pages/badge.styles';

import config from '@unstoppabledomains/config';

type BadgePageServerSideProps = GetServerSideProps & {
  params: {
    badgeCode: string;
  };
};

export type BadgePageProps = {
  badgeData: SerializedBadgeInfo;
  sponsorRankingData?: SerializedDomainRank[] | undefined;
  holderRankingData?: SerializedDomainRank[] | undefined;
};

const ShowMoreDescription = ({description}: {description: string}) => {
  const MAX_LENGTH = 124;
  const {classes} = useStyles();
  const [t] = useTranslationContext();

  const [showMore, setShowMore] = useState(false);

  const handleShowMore = () => {
    setShowMore(true);
  };

  let displayedDescription = '';
  let showMoreAvailable = false;

  showMoreAvailable = description.length > MAX_LENGTH;

  if (showMore) {
    displayedDescription = description;
  } else {
    displayedDescription = description.slice(0, MAX_LENGTH);
    if (showMoreAvailable) {
      displayedDescription += '...';
    }
  }

  return (
    <Box mt={2}>
      <Typography className={classes.description}>
        {displayedDescription}
        {!showMore && showMoreAvailable && (
          <span onClick={handleShowMore} className={classes.showMore}>
            {' ' + t('profile.showMore')}
          </span>
        )}
      </Typography>
    </Box>
  );
};

const BadgePage = ({
  badgeData,
  sponsorRankingData,
  holderRankingData,
}: BadgePageProps) => {
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();
  const isMounted = useIsMounted();
  const {enqueueSnackbar} = useSnackbar();

  // general state management
  const [authAddress, setAuthAddress] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [displayQrCode, setDisplayQrCode] = useState(false);
  const {data: featureFlags, isSuccess: isFeatureFlagSuccess} =
    useFeatureFlags(false);

  const logoImageUrl = getImageUrl(badgeData.badge.logo);
  const coverImageUrl = badgeData.badge.coverImage
    ? getImageUrl(badgeData.badge.coverImage)
    : logoImageUrl;

  const sponsorRankings = sponsorRankingData?.map(r => ({
    name: r.domain,
    rank: r.rank || 0,
    count: r.count,
    link: `${config.UD_ME_BASE_URL}/${r.domain}`,
    image: `${config.UNSTOPPABLE_METADATA_ENDPOINT}/image-src/${r.domain}?withOverlay=false`,
  }));
  const holderRankings = holderRankingData?.map(r => ({
    name: r.domain,
    rank: r.rank || 0,
    count: r.count,
    link: `${config.UD_ME_BASE_URL}/${r.domain}`,
    image: `${config.UNSTOPPABLE_METADATA_ENDPOINT}/image-src/${r.domain}?withOverlay=false`,
  }));

  const toggleQrCode = () => {
    setDisplayQrCode(!displayQrCode);
  };

  const handleClickToCopy = () => {
    enqueueSnackbar(t('common.copied'), {variant: 'success'});
  };

  const handleLoginClicked = async (): Promise<void> => {
    try {
      if (authDomain) {
        return;
      }

      // complete the login with UD flow
      const uauth = await getUAuth({
        clientId: config.LOGIN_WITH_UNSTOPPABLE.CLIENT_ID,
        redirectUri: config.LOGIN_WITH_UNSTOPPABLE.REDIRECT_URI,
      });
      const authorization = await uauth.loginWithPopup();
      if (!authorization.idToken.wallet_address) {
        throw new Error('wallet address not provided in claims');
      }

      // determine the user's primary domain (if available)
      const authOwnerAddress = authorization.idToken.wallet_address;
      const authPrimaryDomain = await getReverseResolution(authOwnerAddress);

      // store the domain to be displayed in the UX, defaulting to the
      // user's primary domain if available and falling back to the one
      // provided at login time if not available
      localStorage.setItem(
        DomainProfileKeys.AuthDomain,
        authPrimaryDomain || authorization.idToken.sub,
      );
      setAuthDomain(authPrimaryDomain || authorization.idToken.sub);

      // store the wallet address that was authenticated
      localStorage.setItem(DomainProfileKeys.AuthAddress, authOwnerAddress);
      setAuthAddress(authOwnerAddress);
    } catch (loginError) {
      console.error('login error', loginError);
    }
  };

  useEffect(() => {
    // wait until mounted
    if (!isMounted() || !isFeatureFlagSuccess) {
      return;
    }

    // set state from local storage
    const localAuthAddress =
      localStorage.getItem(DomainProfileKeys.AuthAddress) || '';
    const localAuthDomain =
      localStorage.getItem(DomainProfileKeys.AuthDomain) || '';
    if (localAuthAddress && localAuthDomain) {
      setAuthAddress(localAuthAddress);
      setAuthDomain(localAuthDomain);
    }
  }, [isMounted, isFeatureFlagSuccess, featureFlags]);

  const handleGetBadgeClick = () => {
    void window.open(
      `https://opensea.io/collection/${badgeData.badge.code.replace(
        'opensea-',
        '',
      )}`,
      '_blank',
    );
  };

  return (
    <>
      <NextSeo title={`${badgeData.badge.name} ${t('badge.badge')}`} />
      <Box className={classes.container}>
        <div
          className={cx(classes.headWrapper, classes.headWrapperWithCover)}
          style={{
            backgroundImage: `url(${coverImageUrl})`,
          }}
        >
          <Logo className={classes.logo} inverse />
          <div className={classes.head}>
            <div className={classes.shareMenuContainer}>
              <ShareMenu
                className={classes.shareMenu}
                toggleQrCode={toggleQrCode}
                displayQrCode={displayQrCode}
                domain={badgeData.badge.code}
                onProfileLinkCopied={handleClickToCopy}
                isBadge
              />
            </div>

            <div className={classes.profileButtonContainer}>
              {authDomain ? (
                <>
                  <AccountButton
                    domain={''}
                    domainOwner={''}
                    authAddress={authAddress}
                    authDomain={authDomain}
                  />
                </>
              ) : (
                <LoginButton
                  method={LoginMethod.Uauth}
                  loading={false}
                  isWhiteBg
                  hidden={false}
                  onClick={handleLoginClicked}
                />
              )}
            </div>
          </div>
        </div>
        <Grid
          container
          className={classes.content}
          data-testid="mainContentContainer"
        >
          <Grid item xs={12} sm={12} md={4} className={classes.item}>
            <div className={classes.leftPanel}>
              <div className={classes.profilePicture}>
                <ProfilePicture
                  src={logoImageUrl}
                  domain={badgeData.badge.name}
                  imageType={'jpg'}
                />
              </div>
              {badgeData.badge.name && (
                <div>
                  <Box mt={4} className={classes.headerContainer}>
                    <div className={classes.badgeCaption}>
                      {t('badge.badge')}
                    </div>
                    <Typography variant="h4" className={classes.displayName}>
                      {badgeData.badge.name}
                    </Typography>
                  </Box>
                </div>
              )}
              {badgeData.badge.description ? (
                <ShowMoreDescription
                  description={badgeData.badge.description}
                />
              ) : null}
              <Button
                variant="contained"
                className={classes.getBadgeButton}
                onClick={handleGetBadgeClick}
              >
                {t('badge.getBadge')}
              </Button>
              <Divider className={classes.divider} />
              <CollectionStats badgeData={badgeData} />
              {badgeData.badge.linkUrl ? (
                <Box mb={2} display="flex">
                  <LanguageIcon className={classes.sidebarIcon} />
                  <Link
                    external
                    href={badgeData.badge.linkUrl}
                    className={classes.websiteLink}
                  >
                    {badgeData.badge.linkUrl.replace(/^https?:\/\/|\/$/g, '')}
                  </Link>
                </Box>
              ) : null}
            </div>
          </Grid>
          <Grid
            container
            sm={12}
            md={8}
            className={classes.badgeListContainer}
            columnSpacing={{md: 3}}
            rowSpacing={{xs: 3}}
          >
            {holderRankings &&
              sponsorRankings &&
              (sponsorRankings.length >= badgeData.sponsorship.max ? (
                <>
                  <BadgeRankings
                    type="holders"
                    badgeCode={badgeData.badge.code}
                    domains={holderRankings.map(r => r.name)}
                  />
                  <BadgeRankings
                    type="sponsors"
                    badgeCode={badgeData.badge.code}
                    domains={sponsorRankings.map(r => r.name)}
                  />
                </>
              ) : // If sponsored by the badge creator, show the gallery holder rankings
              badgeData.badge.gallery?.enabled ? (
                <>
                  <BadgeRankings
                    type="holders"
                    badgeCode={badgeData.badge.code}
                    domains={holderRankings.map(r => r.name)}
                    fullWidth={!badgeData.badge.videoUrl}
                  />
                  {badgeData.badge.videoUrl && (
                    <Grid
                      item
                      xs={12}
                      md={6}
                      className={classes.videoContainer}
                    >
                      <video
                        className={classes.video}
                        src={badgeData.badge.videoUrl}
                        muted
                        playsInline
                        autoPlay
                        controls
                        loop
                        controlsList="nodownload noplaybackrate nofullscreen"
                        disablePictureInPicture
                        disableRemotePlayback
                        preload="auto"
                      />
                    </Grid>
                  )}
                </>
              ) : (
                <UnlockSponsorsLeaderboard
                  badgeData={badgeData}
                  sponsors={sponsorRankings.map(r => r.name)}
                />
              ))}
            {badgeData.badge.marketplace?.listings && (
              <Grid item xs={12}>
                <Typography className={classes.contentLabel}>
                  {t('badge.wantABadge', {badge: badgeData.badge.name})}
                </Typography>
                <NftListing listings={badgeData.badge.marketplace.listings} />
              </Grid>
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export async function getServerSideProps(props: BadgePageServerSideProps) {
  const {params} = props;
  const badgeCode = params.badgeCode;
  const redirectToLeaderboard = {
    redirect: {
      destination: '/leaderboard',
      permanent: false,
    },
  };

  let badgeData: SerializedBadgeInfo | undefined;
  let sponsorRankingData: SerializedDomainRank[] | undefined;
  let holderRankingData: SerializedDomainRank[] | undefined;
  try {
    [badgeData, sponsorRankingData, holderRankingData] = await Promise.all([
      getBadge(badgeCode),
      getSponsorRankings(200, badgeCode),
      getDomainRankings(200, false, badgeCode),
    ]);
  } catch (e) {
    console.error(`error loading badge for ${badgeCode}`, String(e));
  }
  if (!badgeData?.badge.code.startsWith('opensea-')) {
    return redirectToLeaderboard;
  }

  return {
    props: {
      badgeData,
      sponsorRankingData,
      holderRankingData,
    },
  };
}

export default BadgePage;
