import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ChatIcon from '@mui/icons-material/Chat';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import IosShareIcon from '@mui/icons-material/IosShare';
import LanguageIcon from '@mui/icons-material/Language';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import WarningOutlinedIcon from '@mui/icons-material/WarningOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {getDomainBadges, getReverseResolution} from 'actions/domainActions';
import {getFollowers, getProfileData} from 'actions/domainProfile';
import {useFeatureFlags} from 'actions/featureFlagActions';
import {getIdentity} from 'actions/identityActions';
import Badges from 'components/Badges';
import Badge from 'components/Badges/Badge';
import {UnstoppableMessaging} from 'components/Chat/UnstoppableMessaging';
import useUnstoppableMessaging from 'components/Chat/hooks/useUnstoppableMessaging';
import CopyToClipboard from 'components/CopyToClipboard';
import CryptoAddresses from 'components/CryptoAddresses';
import CustomBadges from 'components/CustomBadges';
import {DomainListModal} from 'components/Domain/DomainListModal';
import {DomainPreview} from 'components/Domain/DomainPreview';
import FollowButton from 'components/Domain/FollowButton';
import ProfilePicture from 'components/Domain/ProfilePicture';
import ShareMenu from 'components/Domain/ShareMenu';
import ShowHideButton from 'components/Domain/ShowHideButton';
import SocialAccountCard from 'components/Domain/SocialAccountCard';
import ForSaleOnOpenSea from 'components/ForSaleOnOpenSea';
import {AccountButton} from 'components/Header/AccountButton';
import {LoginButton, LoginMethod} from 'components/Header/LoginButton';
import ProfileSearchBar from 'components/Header/ProfileSearchBar';
import Logo from 'components/Image/Logo';
import Link from 'components/Link';
import NFTGalleryCarousel from 'components/TokenGallery/NFTGalleryCarousel';
import TokenGallery from 'components/TokenGallery/TokenGallery';
import {format, isPast} from 'date-fns';
import {useEnsDomainStatus} from 'hooks/useEnsDomainStatus';
import useTokenGallery from 'hooks/useTokenGallery';
import useWeb3Context from 'hooks/useWeb3Context';
import {
  isExternalDomainValidForManagement,
  splitDomain,
} from 'lib/domain/format';
import getImageUrl from 'lib/domain/getImageUrl';
import {parseRecords} from 'lib/domain/records';
import {formOpenSeaLink} from 'lib/formOpenseaLink';
import useTranslationContext from 'lib/i18n';
import {getSeoTags} from 'lib/seo';
import type {DomainBadgesResponse} from 'lib/types/badge';
import type {Blockchain} from 'lib/types/blockchain';
import {Registry} from 'lib/types/blockchain';
import type {
  SerializedDomainProfileSocialAccountsUserInfo,
  SerializedPublicDomainProfileData,
} from 'lib/types/domain';
import {DomainProfileKeys, UD_BLUE_BADGE_CODE} from 'lib/types/domain';
import type {PersonaIdentity} from 'lib/types/persona';
import {getUAuth} from 'lib/uauth';
import type {GetServerSideProps} from 'next';
import {NextSeo} from 'next-seo';
import {useSnackbar} from 'notistack';
import QueryString from 'qs';
import React, {useEffect, useState} from 'react';
import useIsMounted from 'react-is-mounted-hook';
import {useStyles} from 'styles/pages/domain.styles';
import {titleCase} from 'title-case';

import config from '@unstoppabledomains/config';
import CopyContentIcon from '@unstoppabledomains/ui-kit/icons/CopyContent';

type DomainProfileServerSideProps = GetServerSideProps & {
  params: {
    domain: string;
  };
};

export type DomainProfilePageProps = {
  domain: string;
  profileData?: SerializedPublicDomainProfileData | null;
  records: Record<string, string>;
  metadata: Record<string, string>;
  identity?: PersonaIdentity;
};

const DomainProfile = ({
  domain,
  profileData,
  records,
  metadata,
  identity,
}: DomainProfilePageProps) => {
  // hooks
  const [t] = useTranslationContext();
  const {classes, cx} = useStyles();
  const isMounted = useIsMounted();
  const [imagePath, setImagePath] = useState<string>();
  const {enqueueSnackbar} = useSnackbar();
  const {chatUser, setOpenChat} = useUnstoppableMessaging();
  const {nfts, nftSymbolVisible, expanded: nftShowAll} = useTokenGallery();
  const {setWeb3Deps} = useWeb3Context();

  // state management
  const [authAddress, setAuthAddress] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [displayQrCode, setDisplayQrCode] = useState(false);
  const [isOwner, setIsOwner] = useState<boolean>();
  const [someSocialsPublic, setIsSomeSocialsPublic] = useState<boolean>(false);
  const [badgeTypes, setBadgeTypes] = useState<string[]>([]);
  const [badges, setBadges] = useState<DomainBadgesResponse>();
  const [badgesDisabled, setBadgesDisabled] = useState(true);
  const [showFeaturedCommunity, setShowFeaturedCommunity] = useState(
    profileData?.profile.showFeaturedCommunity ?? false,
  );
  const [showFeaturedPartner, setShowFeaturedPartner] = useState(
    profileData?.profile.showFeaturedPartner ?? false,
  );
  const {
    data: featureFlags,
    isSuccess: isFeatureFlagSuccess,
    isFetched: isFeatureFlagFetched,
  } = useFeatureFlags(false, domain);

  const [followers, setFollowers] = useState<string[]>([]);
  const [isViewFollowModalOpen, setIsViewFollowModalOpen] = useState(false);
  const [viewFollowerRelationship, setViewFollowerRelationship] = useState(
    'followers' as 'following' | 'followers',
  );
  const [optimisticFollowCount, setOptimisticFollowCount] = useState(0);

  const isExternalDomain = isExternalDomainValidForManagement(domain);
  const {data: ethDomainStatus} = useEnsDomainStatus(domain, isExternalDomain);

  // format social platform data
  const socialsInfo: SerializedDomainProfileSocialAccountsUserInfo = {};
  const allSocials = profileData?.socialAccounts
    ? Object.keys(profileData.socialAccounts)
    : [];
  const verifiedSocials = allSocials.filter(socialType =>
    Boolean(
      (profileData?.socialAccounts &&
        profileData?.socialAccounts[socialType]?.verified) ||
        true,
    ),
  );
  verifiedSocials.forEach(socialType => {
    const socialUser = profileData?.socialAccounts[socialType]?.location;
    socialsInfo[socialType] = {
      kind: socialType,
      userName: socialUser,
      screenName: socialUser,
      name: socialUser,
      url: socialUser,
      title: socialUser,
    };
  });

  // humanity check status
  const humanityVerified = ['APPROVED', 'COMPLETED'].includes(
    identity?.status ?? 'NONE',
  );

  // retrieve on-chain record data
  const addressRecords = parseRecords(records || {});
  const isForSale =
    (records['whois.for_sale.value'] ?? '').toLowerCase() === 'true';
  const ipfsHash = records['ipfs.html.value'];
  const ownerAddress = metadata.owner || '';
  const ownerEmail = records['whois.email.value'];
  const {blockchain} = metadata;
  const {tokenId} = metadata;
  const openSeaLink = formOpenSeaLink({
    logicalOwnerAddress: ownerAddress,
    blockchain: blockchain as Blockchain,
    type: Registry.UNS,
    ttl: 0,
    tokenId,
    domain,
    namehash: metadata.namehash,
    registryAddress: metadata.registry,
    resolver: metadata.resolver,
    reverse: Boolean(metadata.reverse),
  });
  const needLeftSideDivider =
    Boolean(profileData?.profile.location) ||
    verifiedSocials.length > 0 ||
    humanityVerified ||
    ipfsHash ||
    profileData?.profile.web2Url;

  const hasAddresses = Boolean(
    Object.keys(addressRecords.addresses ?? {}).length ||
      Object.keys(addressRecords.multicoinAddresses ?? {}).length,
  );
  const uploadedImagePath = profileData?.profile.imagePath
    ? getImageUrl(profileData.profile.imagePath)
    : null;

  const domainCover = profileData?.profile.coverPath
    ? getImageUrl(profileData?.profile.coverPath)
    : null;
  const {label, sld, extension} = splitDomain(domain);
  const seoTags = getSeoTags({
    domain,
    title: t('nftCollection.unstoppableDomains'),
    profileData,
    socialsInfo,
    domainAvatar: uploadedImagePath,
  });

  const toggleQrCode = () => {
    setDisplayQrCode(!displayQrCode);
  };

  const handleClickToCopy = () => {
    enqueueSnackbar(t('common.copied'), {variant: 'success'});
  };

  const handleViewFollowingClick = () => {
    setViewFollowerRelationship('following');
    setIsViewFollowModalOpen(true);
  };

  const handleFollowClick = () => {
    setOptimisticFollowCount(currentValue => currentValue + 1);
  };

  const handleUnfollowClick = () => {
    setOptimisticFollowCount(currentValue => currentValue - 1);
  };

  const handleViewFollowersClick = () => {
    setViewFollowerRelationship('followers');
    setIsViewFollowModalOpen(true);
  };

  const handleViewFollowModalClose = () => {
    setIsViewFollowModalOpen(false);
  };

  const handleShareRiskScore = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURI(
        t('webacy.shareMessage'),
      )}&url=${encodeURI(`${config.UD_ME_BASE_URL}/${domain}`)}`,
      '_blank',
    );
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

      // set ownership flag
      setIsOwner(ownerAddress.toLowerCase() === authOwnerAddress.toLowerCase());
    } catch (loginError) {
      console.error('login error', loginError);
    }
  };

  const hasBadges =
    !badgesDisabled &&
    !!badges &&
    !!badges.badgesLastSyncedAt &&
    badges.countActive > 0 &&
    badges.list.filter(b => !b.expired).length > 0;

  const hasContent =
    Boolean(verifiedSocials.length) ||
    ipfsHash ||
    hasAddresses ||
    isForSale ||
    hasBadges;

  useEffect(() => {
    // wait until mounted
    if (!isMounted() || !isFeatureFlagSuccess) {
      return;
    }

    // disable badge rendering if owner address is on the list of wallet
    // addresses specified by launch darkly targeting
    setBadgesDisabled(
      featureFlags?.variations?.ecommerceServiceWalletsDisableBadges
        .map((v: string) => v.toLowerCase())
        .includes(ownerAddress.toLowerCase()),
    );

    // set state from local storage
    const localAuthAddress =
      localStorage.getItem(DomainProfileKeys.AuthAddress) || '';
    const localAuthDomain =
      localStorage.getItem(DomainProfileKeys.AuthDomain) || '';
    let isAuthorized = false;
    if (localAuthAddress && localAuthDomain) {
      setAuthAddress(localAuthAddress);
      setAuthDomain(localAuthDomain);
      isAuthorized =
        ownerAddress.toLowerCase() === localAuthAddress.toLowerCase();
    }
    setIsOwner(isAuthorized);

    // load initial set of followers
    void loadFollowers();
  }, [isMounted, isFeatureFlagSuccess, featureFlags, ownerAddress]);

  // Check for Social Account Visibility Status
  useEffect(() => {
    // determine social account status
    if (profileData?.socialAccounts) {
      setIsSomeSocialsPublic(
        Object.values(profileData?.socialAccounts).some(
          social => social.public,
        ),
      );
    }
    // retrieve badges
    const loadBadges = async () => {
      const badgeData = await getDomainBadges(domain);
      setBadges(badgeData);
      setBadgeTypes([
        ...new Set(
          badgeData?.list
            ?.filter(b => b.active)
            .map(b => b.type)
            .sort(),
        ),
      ]);
    };
    void loadBadges();
  }, []);

  useEffect(() => {
    if (profileData?.profile.imagePath) {
      setImagePath(profileData?.profile.imagePath);
    }
  }, [profileData]);

  if (isExternalDomain && !isFeatureFlagFetched) {
    return (
      <div className={classes.disabledPageWrapper}>
        <CircularProgress />
      </div>
    );
  }

  // getNftsForContract retrieves NFTs matching one of the specified smart
  // contract addresses
  const getNftsForContract = (contracts: string[]) => {
    return nfts
      ? nfts.filter(
          nft =>
            contracts &&
            contracts.filter(contract =>
              nft.mint?.toLowerCase().includes(contract.toLowerCase()),
            ).length > 0,
        )
      : [];
  };

  // featured community list
  const featuredCommunities = badges?.list?.filter(
    badge =>
      badge.gallery &&
      badge.gallery.tier === 2 &&
      badge.contracts &&
      getNftsForContract(badge.contracts).length > 0,
  );

  // featured partner list
  const featuredPartners = badges?.list?.filter(
    badge => badge.gallery && badge.gallery.tier > 2,
  );

  const loadFollowers = async () => {
    if (
      profileData?.social?.followerCount &&
      profileData.social.followerCount > 0
    ) {
      const loadedFollowers = await retrieveFollowers();
      if (loadedFollowers?.domains && loadedFollowers.domains.length > 0) {
        setFollowers([...loadedFollowers.domains]);
      }
    }
  };

  const retrieveFollowers = async (cursor?: number) => {
    const retData: {domains: string[]; cursor?: number} = {
      domains: [],
      cursor: undefined,
    };
    try {
      const followersData = await getFollowers(
        domain,
        viewFollowerRelationship,
        cursor,
      );
      if (followersData) {
        retData.domains = followersData.data.map(f => f.domain);
        retData.cursor = followersData.meta.pagination.cursor;
      }
    } catch (e) {
      console.error('error retrieving followers', e);
    }
    return retData;
  };

  const hasUdBlueBadge = badges?.list?.some(
    badge => badge.code === UD_BLUE_BADGE_CODE,
  );

  return (
    <Box className={classes.container}>
      <NextSeo {...seoTags} />
      <div
        className={cx(classes.headWrapper, {
          [classes.headWrapperWithCover]: !!domainCover,
        })}
        style={
          domainCover
            ? {
                backgroundImage: `url(${domainCover})`,
              }
            : undefined
        }
      >
        <Logo className={classes.logo} inverse absoluteUrl />
        <div className={classes.head}>
          <div className={classes.menuButtonContainer}>
            <ShareMenu
              toggleQrCode={toggleQrCode}
              displayQrCode={displayQrCode}
              domain={domain}
              className={cx(classes.shareMenu, {
                [classes.smallHidden]: domain !== authDomain,
              })}
              onProfileLinkCopied={handleClickToCopy}
            />
            {chatUser && chatUser.toLowerCase() !== domain.toLowerCase() && (
              <Button
                data-testid="chat-button"
                onClick={() => setOpenChat(domain)}
                className={cx(classes.shareMenu, {
                  [classes.smallHidden]: domain !== authDomain,
                })}
                startIcon={<ChatIcon />}
              >
                {t('push.chat')}
              </Button>
            )}
            {domain !== authDomain && (
              <FollowButton
                handleLogin={handleLoginClicked}
                setWeb3Deps={setWeb3Deps}
                authDomain={authDomain}
                domain={domain}
                authAddress={authAddress}
                onFollowClick={handleFollowClick}
                onUnfollowClick={handleUnfollowClick}
              />
            )}
          </div>
          <div className={classes.topHeaderContainer}>
            <div className={classes.searchContainer}>
              <ProfileSearchBar setWeb3Deps={setWeb3Deps} />
            </div>

            <div className={classes.loginContainer}>
              {authDomain ? (
                <>
                  {featureFlags?.variations
                    ?.ecommerceServiceUsersEnableChat && (
                    <div className={classes.chatContainer}>
                      <UnstoppableMessaging
                        address={authAddress}
                        domain={authDomain}
                        disableSupportBubble
                      />
                    </div>
                  )}
                  <AccountButton
                    domain={domain}
                    domainOwner={ownerAddress}
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
                src={imagePath}
                domain={domain}
                imageType={profileData?.profile?.imageType}
                hasUdBlueBadge={hasUdBlueBadge}
              />
            </div>
            {profileData?.profile.displayName && (
              <div>
                <Box mt={4}>
                  <Typography variant="h4" className={classes.displayName}>
                    {profileData?.profile.displayName
                      ? profileData?.profile.displayName
                      : ''}
                  </Typography>
                </Box>
                <Box mt={1} display="flex" className={classes.domainNameBox}>
                  <Typography
                    title={domain}
                    className={classes.domainName}
                    variant="h5"
                    component="div"
                  >
                    {sld ? `${label}.${sld}` : label}
                    <div className={classes.domainExtension}>
                      .{extension}
                      <CopyToClipboard
                        stringToCopy={domain}
                        onCopy={handleClickToCopy}
                      >
                        <IconButton
                          className={classes.copyIconButton}
                          aria-label={t('profile.copyDomainName')}
                          size="large"
                        >
                          <CopyContentIcon className={classes.copyIcon} />
                        </IconButton>
                      </CopyToClipboard>
                    </div>
                  </Typography>
                </Box>
              </div>
            )}
            {profileData?.profile && (
              <div>
                <Box mt={1} className={classes.followingContainer}>
                  <Button
                    variant="text"
                    className={classes.followCount}
                    onClick={handleViewFollowingClick}
                  >
                    {`${profileData.social.followingCount} following`}
                  </Button>
                  <Button
                    variant="text"
                    className={classes.followCount}
                    onClick={handleViewFollowersClick}
                  >
                    {`${
                      (profileData.social.followerCount || 0) +
                      optimisticFollowCount
                    } followers`}
                  </Button>
                </Box>
                {followers && followers.length > 2 && (
                  <div className={classes.followersPreviewContainer}>
                    <Typography className={classes.followersPreviewTyp}>
                      {t('profile.followedBy', {
                        followers: followers.slice(0, 2).join(', '),
                        othersCount:
                          (profileData.social.followerCount || 0) - 3,
                      })}
                    </Typography>
                    <div className={classes.followersPreview}>
                      {followers.slice(0, 3).map(follower => (
                        <DomainPreview
                          domain={follower}
                          size={30}
                          setWeb3Deps={setWeb3Deps}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {profileData?.profile.description ? (
              <Box mt={2}>
                <Typography className={classes.description}>
                  {profileData?.profile.description
                    ? profileData?.profile.description
                    : ''}
                </Typography>
              </Box>
            ) : null}
            {profileData?.webacy && (
              <Box className={classes.riskScoreContainer}>
                <Avatar
                  src="https://storage.googleapis.com/unstoppable-client-assets/images/webacy/logo.png"
                  className={classes.riskScoreLogo}
                  onClick={() => window.open('https://webacy.com', '_blank')}
                />
                <Typography className={classes.emailAndLocation}>
                  {t('webacy.riskScore')}:
                </Typography>
                <Tooltip
                  title={
                    profileData.webacy.issues.length > 0 ? (
                      profileData.webacy.issues.map(issue => (
                        <>
                          <Typography variant="caption">
                            {
                              issue.categories.wallet_characteristics
                                .description
                            }
                          </Typography>
                          <List dense sx={{listStyleType: 'disc', pl: 4}}>
                            {issue.tags.map(tag => (
                              <ListItem
                                sx={{display: 'list-item'}}
                                key={tag.key}
                              >
                                <Typography variant="caption">
                                  {tag.name}
                                </Typography>
                              </ListItem>
                            ))}
                          </List>
                        </>
                      ))
                    ) : (
                      <Typography variant="caption">
                        {t('webacy.riskScoreDescription', {
                          risk: profileData.webacy.high
                            ? t('webacy.high').toLowerCase()
                            : profileData.webacy.medium
                            ? t('webacy.medium').toLowerCase()
                            : t('webacy.low').toLowerCase(),
                        })}
                      </Typography>
                    )
                  }
                >
                  <Chip
                    color={
                      profileData.webacy.high
                        ? 'error'
                        : profileData.webacy.medium
                        ? 'warning'
                        : 'success'
                    }
                    size="small"
                    icon={
                      profileData.webacy.high ? (
                        <OutlinedFlagIcon className={classes.riskScoreIcon} />
                      ) : profileData.webacy.medium ? (
                        <WarningOutlinedIcon
                          className={classes.riskScoreIcon}
                        />
                      ) : (
                        <CheckCircleOutlinedIcon
                          className={classes.riskScoreIcon}
                        />
                      )
                    }
                    label={
                      profileData.webacy.high
                        ? t('webacy.high')
                        : profileData.webacy.medium
                        ? t('webacy.medium')
                        : t('webacy.low')
                    }
                  />
                </Tooltip>
                {isOwner &&
                  !profileData.webacy.high &&
                  !profileData.webacy.medium && (
                    <Tooltip
                      title={
                        <Typography variant="caption">
                          {t('webacy.share')}
                        </Typography>
                      }
                    >
                      <IconButton
                        size="small"
                        className={classes.riskScoreShareButton}
                        onClick={handleShareRiskScore}
                      >
                        <IosShareIcon className={classes.riskScoreShareIcon} />
                      </IconButton>
                    </Tooltip>
                  )}
              </Box>
            )}
            {hasAddresses && (
              <CryptoAddresses
                onCryptoAddressCopied={handleClickToCopy}
                profileData={profileData}
                domain={domain}
                isOwner={isOwner}
                showWarning={
                  featureFlags.variations
                    ?.ecommerceServiceUsersPublicProfileAddressVerifiedCheck ||
                  false
                }
                records={addressRecords}
                ownerAddress={ownerAddress}
              />
            )}
            {needLeftSideDivider && (
              <Box mt={3} mb={2}>
                <Divider />
              </Box>
            )}
            {Boolean(verifiedSocials.length) && someSocialsPublic && (
              <div>
                <Grid container spacing={1}>
                  {verifiedSocials.map(account => {
                    return (
                      <Grid key={account} item xs={2} md={3} lg={2}>
                        <SocialAccountCard
                          socialInfo={socialsInfo[account]}
                          handleClickToCopy={handleClickToCopy}
                          small
                        />
                      </Grid>
                    );
                  })}
                </Grid>
                {needLeftSideDivider && (
                  <Box mt={3} mb={2}>
                    <Divider />
                  </Box>
                )}
              </div>
            )}
            {humanityVerified && (
              <Tooltip
                placement="top"
                title={
                  <div className={classes.humanityVerifiedTooltipContent}>
                    {t('profile.useYourDomainToLoginToApplications')}
                    <Link
                      external
                      href="https://unstoppablemarketplace.com/"
                      className={classes.humanityVerifiedTooltipLink}
                    >
                      {t('profile.clickToSeeAllApplications')}
                    </Link>
                  </div>
                }
                arrow
              >
                <div>
                  <Link
                    external
                    href="https://unstoppablemarketplace.com/"
                    className={classes.humanityVerifiedLink}
                  >
                    <HowToRegOutlinedIcon
                      className={classes.humanityVerifiedIcon}
                    />
                    {t('profile.humanityVerified')}
                  </Link>
                </div>
              </Tooltip>
            )}
            {ipfsHash ? (
              <Box mb={2} display="flex">
                <LanguageIcon className={classes.sidebarIcon} />
                <Link
                  external
                  href={`${config.IPFS_BASE_URL}/${ipfsHash}`}
                  className={classes.websiteLink}
                >
                  {`${domain} (${ipfsHash.slice(0, 10)}...${ipfsHash.slice(
                    -4,
                  )})`}
                </Link>
              </Box>
            ) : null}
            {profileData?.profile.web2Url ? (
              <Box mb={2} display="flex">
                <LanguageIcon className={classes.sidebarIcon} />
                <Link
                  external
                  href={profileData?.profile.web2Url}
                  className={classes.websiteLink}
                >
                  {profileData?.profile.web2Url.replace(
                    /^https?:\/\/|\/$/g,
                    '',
                  )}
                </Link>
              </Box>
            ) : null}
            {profileData?.profile.location ? (
              <Box mb={2} display="flex">
                <FmdGoodOutlinedIcon className={classes.sidebarIcon} />
                <Typography className={classes.emailAndLocation}>
                  {profileData?.profile.location}
                </Typography>
              </Box>
            ) : null}
            {needLeftSideDivider && (
              <Box
                mt={2}
                mb={2}
                className={classes.emailAndLocationSecondDivider}
              >
                <Divider />
              </Box>
            )}
          </div>
        </Grid>

        <Grid item xs={12} sm={12} md={8} className={classes.item}>
          <TokenGallery
            domain={domain}
            enabled={!isExternalDomain && isFeatureFlagFetched}
            isOwner={isOwner}
            ownerAddress={ownerAddress}
            profileServiceUrl={config.PROFILE.HOST_URL}
          />
          {isForSale && !nftShowAll && openSeaLink && (
            <ForSaleOnOpenSea email={ownerEmail} link={openSeaLink} />
          )}
          {hasBadges && !nftShowAll && (
            <>
              {badgeTypes.map((badgeType, index) => {
                const badgeList = badges.list?.filter(
                  b => b.type === badgeType,
                );
                return (
                  <>
                    <div className={classes.sectionHeaderContainer}>
                      <Typography
                        className={cx(
                          classes.sectionHeader,
                          classes.badgeHeader,
                        )}
                        variant="h6"
                      >
                        {titleCase(badgeType)}
                      </Typography>
                      {index === 0 && (
                        <div
                          className={cx(
                            classes.sectionHeader,
                            classes.sectionHeaderLinks,
                          )}
                        >
                          <div
                            className={cx(
                              classes.sectionHeaderLink,
                              classes.sectionHeaderLinks,
                            )}
                          >
                            <CustomBadges />
                          </div>
                        </div>
                      )}
                    </div>
                    <Badges
                      profile
                      domain={domain}
                      list={badgeList}
                      countActive={
                        badges.list?.filter(
                          b => b.type === badgeType && b.active,
                        ).length
                      }
                      countTotal={badgeList.length}
                      badgesLastSyncedAt={badges.badgesLastSyncedAt}
                      usageEnabled
                      setWeb3Deps={setWeb3Deps}
                      authWallet={authAddress}
                      authDomain={authDomain}
                    />
                  </>
                );
              })}
              <Box sx={{marginTop: '25px'}} />
              {(isOwner || showFeaturedPartner) &&
                featuredPartners &&
                featuredPartners.length > 0 && (
                  <>
                    <div className={classes.sectionHeaderContainer}>
                      <Typography
                        className={cx(
                          classes.sectionHeader,
                          classes.badgeHeader,
                        )}
                        variant="h6"
                      >
                        {t('badges.featuredPartners')}
                        <Tooltip
                          title={
                            <div>
                              {t('badges.featuredPartnerInquiry')}{' '}
                              <Link
                                href="mailto:bd@unstoppabledomains.com"
                                className={classes.featuredTooltipLink}
                              >
                                bd@unstoppabledomains.com
                              </Link>
                            </div>
                          }
                          placement="top"
                          arrow
                        >
                          <InfoOutlinedIcon className={classes.infoIcon} />
                        </Tooltip>
                      </Typography>
                      {isOwner && (
                        <div
                          data-testid="showhide-featuredPartners"
                          className={cx(
                            classes.sectionHeader,
                            classes.sectionHeaderLinks,
                          )}
                        >
                          <Box
                            className={cx(
                              classes.sectionHeaderLink,
                              classes.sectionHeaderLinks,
                            )}
                          >
                            <ShowHideButton
                              domain={domain}
                              ownerAddress={ownerAddress}
                              showDomain={showFeaturedPartner}
                              setShowDomain={setShowFeaturedPartner}
                              recordName="showFeaturedPartner"
                              setWeb3Deps={setWeb3Deps}
                              tooltip={
                                showFeaturedPartner
                                  ? t('badges.hide')
                                  : t('badges.show')
                              }
                            />
                          </Box>
                        </div>
                      )}
                    </div>
                    {showFeaturedPartner ? (
                      <Grid container spacing={2}>
                        {featuredPartners.map(badge => (
                          <Grid item xs={12}>
                            <Badge
                              domain={domain}
                              {...badge}
                              small
                              usageEnabled
                              tooltipPlacement="top"
                              profile
                              iconOnly={false}
                              setWeb3Deps={setWeb3Deps}
                            />
                            <NFTGalleryCarousel
                              domain={domain}
                              nfts={getNftsForContract(badge.contracts || [])}
                              nftSymbolVisible={nftSymbolVisible || {}}
                              autoPlay={false}
                              minNftCount={2}
                              maxNftCount={4}
                              showPlaceholder
                              badgeData={badge}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography
                        className={classes.featuredContentHidden}
                        variant="body2"
                      >
                        {t('badges.featuredContentHidden', {
                          type: t('badges.partner'),
                        })}
                      </Typography>
                    )}
                  </>
                )}
              {(isOwner || showFeaturedCommunity) &&
                featuredCommunities &&
                featuredCommunities.length > 0 &&
                nfts &&
                nfts.length > 0 && (
                  <>
                    <div className={classes.sectionHeaderContainer}>
                      <Typography
                        className={cx(
                          classes.sectionHeader,
                          classes.badgeHeader,
                        )}
                        variant="h6"
                      >
                        {t('badges.featuredCommunities')}
                        <Tooltip
                          title={t('badges.featuredCommunityInquiry')}
                          placement="top"
                          arrow
                        >
                          <InfoOutlinedIcon className={classes.infoIcon} />
                        </Tooltip>
                      </Typography>
                      {isOwner && (
                        <div
                          className={cx(
                            classes.sectionHeader,
                            classes.sectionHeaderLinks,
                          )}
                        >
                          <Box
                            className={cx(
                              classes.sectionHeaderLink,
                              classes.sectionHeaderLinks,
                            )}
                          >
                            <ShowHideButton
                              domain={domain}
                              ownerAddress={ownerAddress}
                              showDomain={showFeaturedCommunity}
                              setShowDomain={setShowFeaturedCommunity}
                              recordName="showFeaturedCommunity"
                              setWeb3Deps={setWeb3Deps}
                              tooltip={
                                showFeaturedCommunity
                                  ? t('badges.hide')
                                  : t('badges.show')
                              }
                            />
                          </Box>
                        </div>
                      )}
                    </div>
                    {showFeaturedCommunity ? (
                      <Grid container spacing={2}>
                        {featuredCommunities.map(badge => (
                          <Grid item xs={6} md={3}>
                            <Badge
                              domain={domain}
                              {...badge}
                              small
                              usageEnabled
                              tooltipPlacement="top"
                              profile
                              iconOnly={false}
                              setWeb3Deps={setWeb3Deps}
                            />
                            <NFTGalleryCarousel
                              domain={domain}
                              nfts={getNftsForContract(badge.contracts || [])}
                              nftSymbolVisible={nftSymbolVisible || {}}
                              autoPlay={false}
                              minNftCount={1}
                              maxNftCount={1}
                              showPlaceholder
                            />
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography
                        className={classes.featuredContentHidden}
                        variant="body2"
                      >
                        {t('badges.featuredContentHidden', {
                          type: t('badges.community'),
                        })}
                      </Typography>
                    )}
                  </>
                )}
            </>
          )}
          {!hasContent && !nftShowAll && (
            <div className={classes.empty}>
              <AutoAwesomeOutlinedIcon className={classes.emptyIcon} />

              {blockchain
                ? t('profile.emptyMinted')
                : t('profile.emptyNotMinted')}
            </div>
          )}
          {isExternalDomain && ethDomainStatus?.expiresAt && (
            <div className={classes.empty}>
              {t('profile.thisDomainExpires', {
                action: isPast(new Date(ethDomainStatus.expiresAt))
                  ? 'expired'
                  : 'is set to expire',
                date: format(
                  new Date(ethDomainStatus.expiresAt),
                  'MMM d, yyyy',
                ),
              })}
            </div>
          )}
        </Grid>
      </Grid>
      {profileData && (
        <DomainListModal
          title={
            viewFollowerRelationship === 'followers'
              ? `${t('profile.followers')} ${
                  profileData.social.followerCount || 0
                }`
              : `${t('profile.following')} ${
                  profileData.social.followingCount || 0
                }`
          }
          retrieveDomains={retrieveFollowers}
          open={isViewFollowModalOpen}
          setWeb3Deps={setWeb3Deps}
          onClose={handleViewFollowModalClose}
        />
      )}
    </Box>
  );
};

export async function getServerSideProps(props: DomainProfileServerSideProps) {
  const {params} = props;
  const profileServiceUrl = config.PROFILE.HOST_URL;
  const domain = params.domain.toLowerCase();
  const redirectToSearch = {
    redirect: {
      destination: `${
        config.UNSTOPPABLE_WEBSITE_URL
      }/search?${QueryString.stringify({
        searchTerm: domain,
        searchRef: 'domainprofile',
      })}`,
      permanent: false,
    },
  };

  let profileData: SerializedPublicDomainProfileData | undefined;
  let records: Record<string, string> = {};
  let metadata: Record<string, string> = {};
  let identity = null;
  try {
    const [profileDataObj, identityObj] = await Promise.allSettled([
      getProfileData(domain),
      getIdentity({name: domain}),
    ]);
    profileData =
      profileDataObj.status === 'fulfilled' ? profileDataObj.value : undefined;
    records = profileData?.records ? profileData.records : {};
    metadata = profileData?.metadata ? profileData.metadata : {};
    identity =
      identityObj.status === 'fulfilled' && identityObj.value
        ? identityObj.value
        : null;
  } catch (e) {
    console.error(`error loading domain profile for ${domain}`, String(e));
  }

  // Redirecting to /search if the domain isn't purchased yet, trying to increase conversion
  if (!profileData?.profile?.domainPurchased) {
    return redirectToSearch;
  }

  // set display name to domain if not already set
  if (profileData?.profile && !profileData.profile.displayName) {
    profileData.profile.displayName = domain;
  }

  return {
    props: {
      profileServiceUrl,
      domain,
      profileData,
      records,
      metadata,
      identity,
    },
  };
}

export default DomainProfile;
