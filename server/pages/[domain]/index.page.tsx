import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ChatIcon from '@mui/icons-material/Chat';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import IosShareIcon from '@mui/icons-material/IosShare';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ManageHistoryOutlinedIcon from '@mui/icons-material/ManageHistoryOutlined';
import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LeftBarContentCollapse from 'components/LeftBarContentCollapse';
import {format, isPast} from 'date-fns';
import {normalizeIpfsHash} from 'lib/ipfs';
import type {GetServerSideProps} from 'next';
import {NextSeo} from 'next-seo';
import {useSnackbar} from 'notistack';
import QueryString from 'qs';
import React, {useEffect, useState} from 'react';
import useIsMounted from 'react-is-mounted-hook';
import {useStyles} from 'styles/pages/domain.styles';
import {titleCase} from 'title-case';
import truncateEthAddress from 'truncate-eth-address';

import config from '@unstoppabledomains/config';
import type {
  Blockchain,
  DomainBadgesResponse,
  PersonaIdentity,
  SerializedDomainProfileSocialAccountsUserInfo,
  SerializedPublicDomainProfileData,
} from '@unstoppabledomains/ui-components';
import {
  AccountButton,
  Badge,
  Badges,
  ChipControlButton,
  CopyToClipboard,
  CryptoAddresses,
  CustomBadges,
  DomainFieldTypes,
  DomainListModal,
  DomainPreview,
  DomainProfileKeys,
  DomainProfileModal,
  DomainProfileTabType,
  DomainWalletList,
  FollowButton,
  ForSaleOnOpenSea,
  Link,
  LoginButton,
  LoginMethod,
  Logo,
  NFTGalleryCarousel,
  ProfilePicture,
  ProfileSearchBar,
  Registry,
  ShareMenu,
  ShowHideButton,
  SocialAccountCard,
  TokenGallery,
  UD_BLUE_BADGE_CODE,
  UnstoppableMessaging,
  formOpenSeaLink,
  getDomainBadges,
  getFollowers,
  getIdentity,
  getImageUrl,
  getProfileData,
  getSeoTags,
  isExternalDomain,
  parseRecords,
  useDomainConfig,
  useEnsDomainStatus,
  useFeatureFlags,
  useTokenGallery,
  useTranslationContext,
  useUnstoppableMessaging,
  useWeb3Context,
} from '@unstoppabledomains/ui-components';
import {getOwnerDomains} from '@unstoppabledomains/ui-components/src/actions/domainProfileActions';
import {notifyError} from '@unstoppabledomains/ui-components/src/lib/error';
import CopyContentIcon from '@unstoppabledomains/ui-kit/icons/CopyContent';

type DomainProfileServerSideProps = GetServerSideProps & {
  params: {
    domain: string;
  };
};

export type DomainProfilePageProps = {
  domain: string;
  profileData?: SerializedPublicDomainProfileData | null;
  identity?: PersonaIdentity;
};

const DomainProfile = ({
  domain,
  profileData: initialProfileData,
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [isReloadRequested, setIsReloadRequested] = useState(false);
  const {setWeb3Deps} = useWeb3Context();

  // state management
  const [profileData, setProfileData] = useState(initialProfileData);
  const [loginClicked, setLoginClicked] = useState<boolean>();
  const {isOpen: showManageDomainModal, setIsOpen: setShowManageDomainModal} =
    useDomainConfig();
  const [showOtherDomainsModal, setShowOtherDomainsModal] = useState(false);
  const [authAddress, setAuthAddress] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [displayQrCode, setDisplayQrCode] = useState(false);
  const [isOwner, setIsOwner] = useState<boolean>();
  const [someSocialsPublic, setIsSomeSocialsPublic] = useState<boolean>(false);
  const [badgeTypes, setBadgeTypes] = useState<string[]>([]);
  const [badges, setBadges] = useState<DomainBadgesResponse>();
  const [badgesDisabled, setBadgesDisabled] = useState(true);
  const [records, setRecords] = useState<Record<string, string>>({});
  const [metadata, setMetadata] = useState<Record<string, string | boolean>>(
    {},
  );
  const [showFeaturedCommunity, setShowFeaturedCommunity] = useState(
    profileData?.profile?.showFeaturedCommunity ?? false,
  );
  const [showFeaturedPartner, setShowFeaturedPartner] = useState(
    profileData?.profile?.showFeaturedPartner ?? false,
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

  const isEnsDomain = isExternalDomain(domain);
  const {data: ensDomainStatus} = useEnsDomainStatus(domain, isEnsDomain);

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
    const socialUser =
      profileData?.socialAccounts &&
      profileData?.socialAccounts[socialType]?.location;
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
  const domainSellerEmail = profileData?.profile?.publicDomainSellerEmail;
  const isForSale = Boolean(domainSellerEmail);
  const ipfsHash = records['ipfs.html.value'];
  const ownerAddress = (metadata.owner as string) || '';
  const openSeaLink = formOpenSeaLink({
    logicalOwnerAddress: ownerAddress,
    blockchain: metadata.blockchain as Blockchain,
    type: isEnsDomain ? Registry.ENS : Registry.UNS,
    ttl: 0,
    tokenId: metadata.tokenId as string,
    domain,
    namehash: metadata.namehash as string,
    registryAddress: metadata.registry as string,
    resolver: metadata.resolver as string,
    reverse: Boolean(metadata.reverse),
    networkId: null,
    owner: ownerAddress,
  });
  const hasMoreInfo =
    Boolean(profileData?.profile?.location) ||
    ipfsHash ||
    profileData?.profile?.web2Url ||
    profileData?.webacy ||
    ensDomainStatus?.expiresAt;

  const hasAddresses = Boolean(
    Object.keys(addressRecords.addresses ?? {}).length ||
      Object.keys(addressRecords.multicoinAddresses ?? {}).length,
  );
  const uploadedImagePath = profileData?.profile?.imagePath
    ? getImageUrl(profileData.profile?.imagePath)
    : null;

  const domainCover = profileData?.profile?.coverPath
    ? getImageUrl(profileData?.profile?.coverPath)
    : null;
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

  const handleViewFollowModalClose = async () => {
    setIsViewFollowModalOpen(false);
  };

  const handleOtherDomainsModalOpen = () => {
    setShowOtherDomainsModal(true);
  };

  const handleOtherDomainsModalClose = () => {
    setShowOtherDomainsModal(false);
  };

  const handleManageDomainModalUpdate = async (
    tab: DomainProfileTabType,
    updatedData?: SerializedPublicDomainProfileData,
  ): Promise<void> => {
    if (
      updatedData &&
      [DomainProfileTabType.Profile, DomainProfileTabType.ListForSale].includes(
        tab,
      )
    ) {
      setProfileData({
        ...profileData,
        ...updatedData,
      });
    } else if (tab === DomainProfileTabType.TokenGallery) {
      setIsReloadRequested(true);
    }
  };

  const handleManageDomainModalClose = async () => {
    setShowManageDomainModal(false);
    if (isReloadRequested) {
      setIsLoaded(false);
      await getProfileData(domain, [DomainFieldTypes.Profile]);
      setIsLoaded(true);
    }
  };

  const handleShareRiskScore = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURI(
        t('webacy.shareMessage'),
      )}&url=${encodeURI(`${config.UD_ME_BASE_URL}/${domain}`)}`,
      '_blank',
    );
  };

  const handleLoginComplete = (newAddress: string, newDomain: string) => {
    // ensure values are set
    if (!newAddress || !newDomain) {
      return;
    }

    // update state based on login result
    setAuthAddress(newAddress);
    setAuthDomain(newDomain);
    setIsOwner(ownerAddress.toLowerCase() === newAddress.toLowerCase());
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
    hasBadges ||
    ensDomainStatus;

  useEffect(() => {
    // wait until mounted
    if (!isMounted() || !isFeatureFlagSuccess || !ownerAddress) {
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
  }, [isMounted, isFeatureFlagSuccess, featureFlags, ownerAddress]);

  useEffect(() => {
    // determine social account status
    if (profileData?.socialAccounts) {
      setIsSomeSocialsPublic(
        Object.values(profileData?.socialAccounts).some(
          social => social.public,
        ),
      );
    }

    // retrieve additional profile data at page load time
    const loadAll = async () => {
      await Promise.all([
        loadCryptoRecords(),
        loadBadges(),
        loadFollowers(),
        loadWebacyScore(),
      ]);

      // page can be displayed now without flicker
      setIsLoaded(true);
    };
    void loadAll();
  }, []);

  useEffect(() => {
    if (profileData?.profile?.imagePath) {
      setImagePath(profileData.profile.imagePath);
    }
  }, [profileData]);

  const loadCryptoRecords = async () => {
    if (profileData) {
      try {
        const recordsData = await getProfileData(domain, [
          DomainFieldTypes.Records,
          DomainFieldTypes.CryptoVerifications,
        ]);
        if (recordsData?.cryptoVerifications) {
          profileData.cryptoVerifications = recordsData.cryptoVerifications;
        }
        if (recordsData?.metadata) {
          profileData.metadata = recordsData.metadata;
          setMetadata(recordsData.metadata);
        }
        if (recordsData?.records) {
          profileData.records = recordsData.records;
          setRecords(recordsData.records);
        }
        if (recordsData?.walletBalances) {
          profileData.walletBalances = recordsData.walletBalances;
        }
      } catch (e) {
        notifyError(e, {msg: 'error loading webacy score'});
      }
    }
  };

  // retrieve webacy score at page load time
  const loadWebacyScore = async () => {
    if (profileData) {
      try {
        const webacyData = await getProfileData(domain, [
          DomainFieldTypes.WebacyScore,
        ]);
        if (webacyData?.webacy) {
          profileData.webacy = webacyData.webacy;
        }
      } catch (e) {
        notifyError(e, {msg: 'error loading webacy score'});
      }
    }
  };

  // retrieve badges at page load time
  const loadBadges = async () => {
    try {
      const badgeData: DomainBadgesResponse = await getDomainBadges(domain);
      setBadges(badgeData);
      setBadgeTypes([
        ...new Set(
          badgeData?.list
            ?.filter(b => b.active)
            .map(b => b.type)
            .sort(),
        ),
      ]);
    } catch (e) {
      notifyError(e, {msg: 'error loading badges'});
    }
  };

  const loadFollowers = async () => {
    if (
      profileData?.social?.followerCount &&
      profileData.social.followerCount > 0
    ) {
      try {
        const loadedFollowers = await retrieveFollowers();
        if (loadedFollowers?.domains && loadedFollowers.domains.length > 0) {
          setFollowers([...loadedFollowers.domains]);
        }
      } catch (e) {
        notifyError(e, {msg: 'error loading followers'});
      }
    }
  };

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

  const retrieveFollowers = async (cursor?: number | string) => {
    const retData: {domains: string[]; cursor?: number} = {
      domains: [],
      cursor: undefined,
    };
    try {
      const followersData = await getFollowers(
        domain,
        viewFollowerRelationship,
        cursor as number,
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

  const retrieveOwnerDomains = async (cursor?: number | string) => {
    const retData: {domains: string[]; cursor?: string} = {
      domains: [],
      cursor: undefined,
    };
    try {
      const domainData = await getOwnerDomains(ownerAddress, cursor as string);
      if (domainData) {
        retData.domains = domainData.data.map(f => f.domain);
        retData.cursor = domainData.meta.pagination.cursor;
      }
    } catch (e) {
      console.error('error retrieving owner domains', e);
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
        <Logo className={classes.logo} url={config.UD_ME_BASE_URL} inverse />
        <div className={classes.head}>
          <div className={classes.topHeaderContainer}>
            <div className={classes.searchContainer}>
              <ProfileSearchBar setWeb3Deps={setWeb3Deps} />
            </div>
            {isOwner !== undefined && (
              <div className={classes.loginContainer}>
                {authDomain ? (
                  <>
                    {featureFlags?.variations
                      ?.ecommerceServiceUsersEnableChat && (
                      <div className={classes.chatContainer}>
                        <UnstoppableMessaging
                          address={authAddress}
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
                    method={LoginMethod.Wallet}
                    loading={false}
                    isWhiteBg
                    hidden={false}
                    clicked={loginClicked}
                    onLoginComplete={handleLoginComplete}
                  />
                )}
              </div>
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
                src={imagePath}
                domain={domain}
                imageType={profileData?.profile?.imageType}
                hasUdBlueBadge={hasUdBlueBadge}
              />
            </div>
            {profileData?.profile?.displayName && (
              <div>
                <Box mt={4}>
                  <Typography variant="h4" className={classes.displayName}>
                    {profileData.profile.displayName}
                  </Typography>
                </Box>
                <Box display="flex" className={classes.domainNameBox}>
                  <Typography
                    title={domain}
                    className={classes.domainName}
                    variant="h5"
                  >
                    {domain}
                  </Typography>
                  {humanityVerified && (
                    <Tooltip title={t('profile.humanityVerified')}>
                      <VerifiedIcon className={classes.infoIcon} />
                    </Tooltip>
                  )}
                </Box>
              </div>
            )}
            {isOwner !== undefined && (
              <Box className={classes.menuButtonContainer}>
                {!isOwner ? (
                  <>
                    <FollowButton
                      handleLogin={() => setLoginClicked(true)}
                      setWeb3Deps={setWeb3Deps}
                      authDomain={authDomain}
                      domain={domain}
                      authAddress={authAddress}
                      onFollowClick={handleFollowClick}
                      onUnfollowClick={handleUnfollowClick}
                    />
                    {authDomain && (
                      <ChipControlButton
                        data-testid="chat-button"
                        onClick={() => setOpenChat(domain)}
                        icon={<ChatIcon />}
                        label={t('push.chat')}
                        sx={{marginLeft: 1}}
                      />
                    )}
                  </>
                ) : (
                  <ChipControlButton
                    data-testid="edit-profile-button"
                    onClick={() => setShowManageDomainModal(true)}
                    icon={<EditOutlinedIcon />}
                    label={t('manage.manageProfile')}
                  />
                )}
                <Box ml={1}>
                  <ShareMenu
                    toggleQrCode={toggleQrCode}
                    displayQrCode={displayQrCode}
                    domain={domain}
                    onProfileLinkCopied={handleClickToCopy}
                  />
                </Box>
              </Box>
            )}
            {isLoaded && (
              <>
                <Box mt={3}>
                  <Typography className={classes.description}>
                    {profileData?.profile?.description
                      ? profileData?.profile?.description
                      : ''}
                  </Typography>
                </Box>
                <LeftBarContentCollapse
                  id="ownerAddress"
                  icon={<LockOutlinedIcon />}
                  header={
                    <Box display="flex" alignItems="center">
                      <Typography>
                        {t('profile.ownerAddress', {
                          address: truncateEthAddress(ownerAddress),
                        })}
                      </Typography>
                      <CopyToClipboard
                        stringToCopy={ownerAddress}
                        onCopy={handleClickToCopy}
                      >
                        <CopyContentIcon
                          className={classes.contentCopyIconButton}
                        />
                      </CopyToClipboard>
                    </Box>
                  }
                  content={
                    profileData?.portfolio?.wallet.primaryDomain ? (
                      <Chip
                        icon={<StarBorderOutlinedIcon />}
                        onClick={() =>
                          (window.location.href = `${config.UD_ME_BASE_URL}/${profileData?.portfolio?.wallet?.primaryDomain}`)
                        }
                        label={
                          <Typography variant="body2">
                            {t('profile.primaryDomain', {
                              domain:
                                profileData.portfolio.wallet.primaryDomain,
                            })}
                          </Typography>
                        }
                      />
                    ) : undefined
                  }
                />
                {profileData?.profile && (
                  <LeftBarContentCollapse
                    id="followers"
                    icon={<PeopleOutlinedIcon />}
                    header={
                      <Box display="flex">
                        <Box
                          className={classes.followCount}
                          onClick={handleViewFollowingClick}
                        >
                          {`${
                            profileData.social?.followingCount || 0
                          } following`}
                        </Box>
                        <Box className={classes.followCount}>·</Box>
                        <Box
                          className={classes.followCount}
                          onClick={handleViewFollowersClick}
                        >
                          {`${
                            (profileData.social?.followerCount || 0) +
                            optimisticFollowCount
                          } followers`}
                        </Box>
                      </Box>
                    }
                    content={
                      followers &&
                      followers.length > 2 && (
                        <div className={classes.followersPreviewContainer}>
                          <Typography className={classes.followersPreviewTyp}>
                            {t('profile.followedBy', {
                              followers: followers.slice(0, 2).join(', '),
                              othersCount:
                                (profileData.social?.followerCount || 0) - 3,
                            })}
                          </Typography>
                          <div className={classes.followersPreview}>
                            {followers.slice(0, 3).map(follower => (
                              <DomainPreview
                                domain={follower}
                                size={30}
                                chatUser={chatUser}
                                setOpenChat={setOpenChat}
                                setWeb3Deps={setWeb3Deps}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    }
                  />
                )}
                {Boolean(verifiedSocials.length) && someSocialsPublic && (
                  <LeftBarContentCollapse
                    id="socials"
                    icon={<AlternateEmailOutlinedIcon />}
                    header={
                      <Typography>
                        {t('profile.socialsCount', {
                          count: verifiedSocials.filter(account => {
                            return (
                              profileData?.socialAccounts &&
                              profileData.socialAccounts[account].location
                            );
                          }).length,
                        })}
                      </Typography>
                    }
                    content={
                      <Box mt={1} mb={1} display="flex" flexWrap="wrap">
                        {verifiedSocials
                          .filter(account => {
                            return (
                              profileData?.socialAccounts &&
                              profileData.socialAccounts[account].location
                            );
                          })
                          .map(account => {
                            return (
                              <Box mr={1}>
                                <SocialAccountCard
                                  socialInfo={socialsInfo[account]}
                                  handleClickToCopy={handleClickToCopy}
                                  verified={
                                    profileData!.socialAccounts![account]
                                      .verified
                                  }
                                  verificationSupported={
                                    featureFlags.variations
                                      ?.udMeServiceDomainsEnableSocialVerification
                                  }
                                  small
                                />
                              </Box>
                            );
                          })}
                      </Box>
                    }
                  />
                )}
                {hasAddresses && (
                  <LeftBarContentCollapse
                    id="addresses"
                    icon={<WalletOutlinedIcon />}
                    header={
                      <Typography>
                        {t('profile.addressCount', {
                          count:
                            (addressRecords.addresses
                              ? Object.keys(addressRecords.addresses).length
                              : 0) +
                            (addressRecords.multicoinAddresses
                              ? Object.keys(addressRecords.multicoinAddresses)
                                  .length
                              : 0),
                        })}
                      </Typography>
                    }
                    content={
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
                        showAll={true}
                      />
                    }
                  />
                )}
                {profileData?.portfolio?.account?.domainCount &&
                  profileData.portfolio.account.domainCount > 1 && (
                    <LeftBarContentCollapse
                      id="domains"
                      icon={<LanguageOutlinedIcon />}
                      header={
                        <Box
                          className={classes.otherDomainsLabel}
                          onClick={handleOtherDomainsModalOpen}
                        >
                          <Typography>
                            {t('profile.otherDomains', {
                              count:
                                profileData.portfolio.account.domainCount - 1,
                            })}
                          </Typography>
                        </Box>
                      }
                    />
                  )}
                {hasMoreInfo && (
                  <LeftBarContentCollapse
                    id="moreInfo"
                    icon={<InfoOutlinedIcon />}
                    header={t('profile.moreInformation')}
                    persist={true}
                    content={
                      <Box>
                        {ipfsHash && (
                          <LeftBarContentCollapse
                            icon={<LaunchOutlinedIcon />}
                            header={
                              <Link
                                external
                                href={`${
                                  config.IPFS_BASE_URL
                                }${normalizeIpfsHash(ipfsHash)}`}
                                className={classes.websiteLink}
                              >
                                {`${domain} (${ipfsHash.slice(
                                  0,
                                  10,
                                )}...${ipfsHash.slice(-4)})`}
                              </Link>
                            }
                            id="ipfs"
                          />
                        )}
                        {profileData?.profile?.web2Url && (
                          <LeftBarContentCollapse
                            icon={<LaunchOutlinedIcon />}
                            header={
                              <Link
                                external
                                href={profileData?.profile?.web2Url}
                                className={classes.websiteLink}
                              >
                                {profileData?.profile?.web2Url.replace(
                                  /^https?:\/\/|\/$/g,
                                  '',
                                )}
                              </Link>
                            }
                            id="web2Url"
                          />
                        )}
                        {profileData?.profile?.location && (
                          <LeftBarContentCollapse
                            icon={<FmdGoodOutlinedIcon />}
                            header={
                              <Typography>
                                {profileData?.profile?.location}
                              </Typography>
                            }
                            id="location"
                          />
                        )}
                        {isEnsDomain && ensDomainStatus?.expiresAt && (
                          <LeftBarContentCollapse
                            icon={<RestoreOutlinedIcon />}
                            header={
                              <Typography>
                                {t('profile.thisDomainExpires', {
                                  action: isPast(
                                    new Date(ensDomainStatus.expiresAt),
                                  )
                                    ? t('profile.expired')
                                    : t('profile.expires'),
                                  date: format(
                                    new Date(ensDomainStatus.expiresAt),
                                    'MMM d, yyyy',
                                  ),
                                })}
                              </Typography>
                            }
                            id="ensExpiration"
                          />
                        )}
                        {profileData?.market?.primary?.payment && (
                          <LeftBarContentCollapse
                            icon={<ManageHistoryOutlinedIcon />}
                            header={
                              <Typography>
                                {t('profile.purchasePrice', {
                                  date: format(
                                    new Date(
                                      profileData.market.primary.payment.date,
                                    ),
                                    'MMM d, yyyy',
                                  ),
                                  cost: profileData.market.primary.cost.toLocaleString(
                                    'en-US',
                                    {
                                      style: 'currency',
                                      currency: 'USD',
                                    },
                                  ),
                                })}
                              </Typography>
                            }
                            id="marketPrice"
                          />
                        )}
                        {profileData?.webacy && (
                          <LeftBarContentCollapse
                            icon={<HealthAndSafetyOutlinedIcon />}
                            header={
                              <Box display="flex" alignItems="center">
                                <Typography mr={1}>
                                  {t('webacy.riskScore')}:
                                </Typography>
                                <Tooltip
                                  title={
                                    profileData.webacy.issues.length > 0 ? (
                                      profileData.webacy.issues.map(issue => (
                                        <>
                                          <Typography variant="caption">
                                            {
                                              issue.categories
                                                ?.wallet_characteristics
                                                ?.description
                                            }
                                          </Typography>
                                          <List
                                            dense
                                            sx={{listStyleType: 'disc', pl: 4}}
                                          >
                                            {issue.tags.map(tag => (
                                              <ListItem
                                                sx={{display: 'list-item'}}
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
                                        {t('webacy.riskScoreDescription')}
                                      </Typography>
                                    )
                                  }
                                >
                                  <Chip
                                    color={
                                      profileData.webacy.high
                                        ? 'error'
                                        : profileData.webacy.medium
                                        ? 'default'
                                        : 'success'
                                    }
                                    size="small"
                                    icon={
                                      profileData.webacy.high ? (
                                        <OutlinedFlagIcon
                                          className={classes.riskScoreIcon}
                                        />
                                      ) : profileData.webacy.medium ? (
                                        <CheckCircleOutlinedIcon
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
                                        <IosShareIcon
                                          className={classes.riskScoreShareIcon}
                                        />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                              </Box>
                            }
                            id="webacy"
                          />
                        )}
                      </Box>
                    }
                  />
                )}
              </>
            )}
          </div>
        </Grid>
        {isLoaded ? (
          <Grid item xs={12} sm={12} md={8} className={classes.item}>
            {profileData?.walletBalances && (
              <DomainWalletList
                wallets={profileData.walletBalances}
                domain={domain}
                isOwner={isOwner}
              />
            )}
            {profileData?.cryptoVerifications &&
              profileData.cryptoVerifications.length > 0 && (
                <TokenGallery
                  domain={domain}
                  enabled={isFeatureFlagFetched}
                  isOwner={isOwner}
                  ownerAddress={ownerAddress}
                  profileServiceUrl={config.PROFILE.HOST_URL}
                  hideConfigureButton={true}
                  totalCount={profileData?.walletBalances
                    ?.map(w => (w.stats?.nfts ? parseInt(w.stats.nfts, 10) : 0))
                    .reduce((prev, curr) => prev + curr, 0)}
                />
              )}
            {isForSale && !nftShowAll && openSeaLink && domainSellerEmail && (
              <ForSaleOnOpenSea email={domainSellerEmail} link={openSeaLink} />
            )}
            {hasBadges && !nftShowAll && (
              <>
                {badgeTypes.map((badgeType, index) => {
                  const badgeList = badges.list?.filter(
                    b => b.type === badgeType,
                  );
                  return (
                    <div key={badgeType}>
                      <div className={classes.sectionHeaderContainer}>
                        <Box
                          className={cx(
                            classes.sectionHeader,
                            classes.badgeHeader,
                          )}
                        >
                          <WorkspacePremiumOutlinedIcon
                            className={classes.headerIcon}
                          />
                          <Typography variant="h6">
                            {titleCase(badgeType)}
                          </Typography>
                          <Typography
                            variant="body2"
                            className={classes.badgeCount}
                          >
                            (
                            {
                              badges.list?.filter(
                                b => b.type === badgeType && b.active,
                              ).length
                            }
                            )
                          </Typography>
                        </Box>
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
                      <Box mb={1}>
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
                      </Box>
                    </div>
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
                          <HandshakeOutlinedIcon
                            className={classes.headerIcon}
                          />
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
                                showPlaceholder={true}
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
                          <PeopleOutlinedIcon className={classes.headerIcon} />
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
                {metadata.blockchain
                  ? t('profile.emptyMinted')
                  : t('profile.emptyNotMinted')}
              </div>
            )}
          </Grid>
        ) : (
          <Grid item xs={12} sm={12} md={8} className={classes.item}>
            <Box className={classes.loadingContainer}>
              <CircularProgress className={classes.loadingSpinner} />
            </Box>
          </Grid>
        )}
      </Grid>
      {profileData && (
        <DomainListModal
          title={
            viewFollowerRelationship === 'followers'
              ? `${t('profile.followers')} (${
                  profileData.social?.followerCount || 0
                })`
              : `${t('profile.following')} (${
                  profileData.social?.followingCount || 0
                })`
          }
          retrieveDomains={retrieveFollowers}
          open={isViewFollowModalOpen}
          setWeb3Deps={setWeb3Deps}
          onClose={handleViewFollowModalClose}
        />
      )}
      {showOtherDomainsModal && profileData?.portfolio?.account.domainCount && (
        <DomainListModal
          title={t('profile.totalDomains', {
            count: profileData.portfolio.account.domainCount,
          })}
          retrieveDomains={retrieveOwnerDomains}
          open={showOtherDomainsModal}
          setWeb3Deps={setWeb3Deps}
          onClose={handleOtherDomainsModalClose}
        />
      )}
      {showManageDomainModal && (
        <DomainProfileModal
          domain={domain}
          address={ownerAddress}
          open={showManageDomainModal}
          onClose={handleManageDomainModalClose}
          onUpdate={handleManageDomainModalUpdate}
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
  let identity = null;
  try {
    const [profileDataObj, identityObj] = await Promise.allSettled([
      getProfileData(domain, [
        DomainFieldTypes.Messaging,
        DomainFieldTypes.Profile,
        DomainFieldTypes.SocialAccounts,
        DomainFieldTypes.Records,
        DomainFieldTypes.Market,
        DomainFieldTypes.Portfolio,
      ]),
      getIdentity({name: domain}),
    ]);
    profileData =
      profileDataObj.status === 'fulfilled' ? profileDataObj.value : undefined;
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
  if (profileData?.profile && !profileData.profile?.displayName) {
    profileData.profile.displayName = domain;
  }

  return {
    props: {
      profileServiceUrl,
      domain,
      profileData,
      identity,
    },
  };
}

export default DomainProfile;
