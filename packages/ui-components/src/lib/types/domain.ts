import type {WebacyRiskScore} from './webacy';

export enum AffiliateTier {
  EarlyAdopter = 'early-adopter',
  FirstOrder25 = 'first-order-25',
  FlatForty = 'flat-forty',
  FlatFortyFive = 'flat-forty-five',
  FlatFifty = 'flat-fifty',
  LastClick10 = 'last-click-10',
  LastClick20 = 'last-click-20',
  LastClick25 = 'last-click-25',
  LastClick30 = 'last-click-30',
  LastClick35 = 'last-click-35',
  LastClick40 = 'last-click-40',
  LastClick50 = 'last-click-50',
  MetaAffiliate = 'meta-affiliate',
  ReferAFriend = 'refer-a-friend',
  StandardJuly2019 = 'standard-july-2019',
  ThirtyJuly2019 = 'thirty-july-2019',
  TwentyFiveJuly2019 = 'twenty-five-july-2019',
  ThirtyFiveApril2022 = 'thirty-five-april-2022',
  ThirtyFebruary2022 = 'thirty-february-2022',
}
export const DOMAIN_PROFILE_VISIBILITY_VALUES: DomainProfileVisibilityValues = {
  displayNamePublic: false,
  descriptionPublic: false,
  locationPublic: false,
  web2UrlPublic: false,
  phoneNumberPublic: false,
  imagePathPublic: true,
  coverPathPublic: true,
};

export const DOMAIN_SOCIAL_VISIBILITY_VALUES: SocialProfileVisibilityValues = {
  youtubePublic: false,
  twitterPublic: false,
  discordPublic: false,
  redditPublic: false,
  telegramPublic: false,
  googlePublic: false,
  githubPublic: false,
  linkedinPublic: false,
};

export type DiscordUserInfo = {
  kind: DomainProfileSocialMedia.Discord;
  userName: string;
} | null;

export type DomainDescription = {
  name: string;
  label: string;
  extension: DomainSuffixes;
  sld: string | null;
};

export enum DomainFieldTypes {
  CryptoVerifications = 'cryptoVerifications',
  HumanityCheck = 'humanityCheck',
  Messaging = 'messaging',
  Profile = 'profile',
  SocialAccounts = 'socialAccounts',
  Records = 'records',
  ReferralCode = 'referralCode',
  ReferralTier = 'referralTier',
  WebacyScore = 'webacyScore',
}

export enum DomainProfileKeys {
  AuthAddress = 'authAddress',
  AuthDomain = 'authDomain',
  Messaging = 'web3-messaging',
  Signature = 'domain-sig',
  Resolution = 'reverse-resolution',
}

export enum DomainProfileSocialMedia {
  Twitter = 'twitter',
  Discord = 'discord',
  YouTube = 'youtube',
  Reddit = 'reddit',
  Telegram = 'telegram',
  Github = 'github',
  Linkedin = 'linkedin',
  Google = 'google',
}

// social media not configured by user but is displayed if exists
export enum DomainProfileSocialMediaAutoPopulated {
  Lens = 'lens',
}

export type DomainProfileVisibilityValues = {
  displayNamePublic: boolean;
  descriptionPublic: boolean;
  locationPublic: boolean;
  web2UrlPublic: boolean;
  phoneNumberPublic: boolean;
  imagePathPublic: boolean;
  coverPathPublic: boolean;
};

export enum DomainSuffixes {
  Crypto = 'crypto',
  Wallet = 'wallet',
  Blockchain = 'blockchain',
  Hi = 'hi',
  Klever = 'klever',
  Bitcoin = 'bitcoin',
  X = 'x',
  Number888 = '888',
  Nft = 'nft',
  Dao = 'dao',
  Polygon = 'polygon',
  Kresus = 'kresus',
  Anime = 'anime',
  Manga = 'manga',
  Binanceus = 'binanceus',
  Go = 'go',
  Zil = 'zil',
  Ens = 'eth',
  EnsReverse = 'reverse',
}

export const EXTERNAL_DOMAIN_SUFFIXES = ['eth'];

export type EnsDomainExpiryResponse = {
  expiresAt?: string | null;
  isAvailable?: boolean;
};

export type EnsDomainStatusResponse = EnsDomainExpiryResponse & {
  rentPrice?: number;
  registrationFees?: number;
};

export type GithubUserInfo = {
  kind: DomainProfileSocialMedia.Github;
  userName: string;
} | null;

export type GoogleUserInfo = {
  kind: DomainProfileSocialMedia.Google;
  userName: string;
} | null;

export type ImageData = {
  base64: string;
  type: string;
};

export type LensUserInfo = {
  kind: DomainProfileSocialMediaAutoPopulated.Lens;
  userName: string;
  url: string;
} | null;

export type LinkedinUserInfo = {
  kind: DomainProfileSocialMedia.Linkedin;
  url: string;
} | null;

export const MANAGEABLE_DOMAIN_LABEL = /^[a-z\d-]{1,253}$/;

export const MAX_BIO_LENGTH = 200;

export const MAX_UPLOAD_FILE_SIZE = 5 * 1000 * 1024;

export type MessagingAttributes = {
  disabled: boolean;
  resetRules?: boolean;
  thirdPartyMessagingEnabled: boolean;
  thirdPartyMessagingConfigType: string;
};

export type RedditUserInfo = {
  kind: DomainProfileSocialMedia.Reddit;
  name: string;
  totalKarma: number;
} | null;

export type SerializedDomainCryptoVerification = {
  id: number;
  symbol: string;
  address: string;
  plaintextMessage: string;
  signedMessage: string;
};

export type SerializedDomainProfileAttributes = {
  // profile fields
  displayName?: string;
  description?: string;
  location?: string;
  imagePath?: string;
  imageType?: 'default' | 'onChain' | 'offChain';
  coverPath?: string;
  web2Url?: string;
  publicDomainSellerEmail?: string;
  phoneNumber?: string;
  domainPurchased?: boolean;
  collectibleImage?: string;
  privateEmail?: string;

  // public toggles
  displayNamePublic?: boolean;
  descriptionPublic?: boolean;
  locationPublic?: boolean;
  imagePathPublic?: boolean;
  coverPathPublic?: boolean;
  web2UrlPublic?: boolean;

  // visibility toggles
  emailOnPublicDomainProfile?: boolean;
  tokenGalleryEnabled?: boolean;
  showDomainSuggestion?: boolean;
  showFeaturedCommunity?: boolean;
  showFeaturedPartner?: boolean;

  // UD blue status
  udBlue?: boolean;
};

export type SerializedDomainProfileSocialAccountsUserInfo = {
  [DomainProfileSocialMedia.Twitter]?: TwitterUserInfo;
  [DomainProfileSocialMedia.Reddit]?: RedditUserInfo;
  [DomainProfileSocialMedia.YouTube]?: YoutubeUserInfo;
  [DomainProfileSocialMedia.Discord]?: DiscordUserInfo;
  [DomainProfileSocialMedia.Telegram]?: TelegramUserInfo;
  [DomainProfileSocialMedia.Google]?: GoogleUserInfo;
  [DomainProfileSocialMedia.Github]?: GithubUserInfo;
  [DomainProfileSocialMedia.Linkedin]?: LinkedinUserInfo;
  [DomainProfileSocialMediaAutoPopulated.Lens]?: LensUserInfo;
};

export interface SerializedDomainRank {
  domain: string;
  count: number;
  rank: number;
}

export type SerializedDomainSocialAccount = {
  location?: string;
  verified?: boolean;
  public?: boolean;
};

export type SerializedFollowerListData = {
  data: Array<{
    domain: string;
  }>;
  meta: {
    total_count: number;
    pagination: {
      cursor: number;
      take: number;
    };
  };
  relationship_type: 'following' | 'followers';
  domain: string;
};

export type SerializedPublicDomainProfileData = {
  profile?: SerializedDomainProfileAttributes;
  social?: SerializedSocialAttributes;
  socialAccounts?: Record<
    DomainProfileSocialMedia | DomainProfileSocialMediaAutoPopulated,
    SerializedDomainSocialAccount
  >;
  cryptoVerifications?: SerializedDomainCryptoVerification[];
  records?: Record<string, string>;
  metadata?: Record<string, string>;
  referralCode?: string;
  referralTier?: AffiliateTier;
  webacy?: WebacyRiskScore;
  messaging?: MessagingAttributes;
};

export type SerializedSocialAttributes = {
  followingCount?: number;
  followerCount?: number;
};

export type SerializedUserDomainProfileData =
  SerializedPublicDomainProfileData & {
    storage?: {
      apiKey: string;
      type: string;
    };
  };

export type SocialAccountUserInfo =
  | TwitterUserInfo
  | RedditUserInfo
  | YoutubeUserInfo
  | DiscordUserInfo
  | TelegramUserInfo
  | GithubUserInfo
  | LinkedinUserInfo
  | LensUserInfo
  | GoogleUserInfo;

export type SocialProfileVisibilityValues = {
  youtubePublic: boolean;
  telegramPublic: boolean;
  twitterPublic: boolean;
  discordPublic: boolean;
  redditPublic: boolean;
  googlePublic: boolean;
  githubPublic: boolean;
  linkedinPublic: boolean;
};

export type TelegramUserInfo = {
  kind: DomainProfileSocialMedia.Telegram;
  userName: string;
} | null;

export type TwitterUserInfo = {
  kind: DomainProfileSocialMedia.Twitter;
  screenName: string;
  followersCount: number;
  followingCount: number;
  listedCount: number;
  tweetsCount: number;
} | null;

export const UD_BLUE_BADGE_CODE = 'UdBlue';

export enum Web2Suffixes {
  Com = 'com',
}

export const Web2SuffixesList = Object.entries(Web2Suffixes).map(([_, v]) => {
  return v.toString();
});

export type YoutubeUserInfo = {
  kind: DomainProfileSocialMedia.YouTube;
  title: string;
  channelId: string;
  channelUrl: string;
  subscriberCount: number;
} | null;

export const kbToMb = (kb: number): number => {
  return kb / 1000 / 1024;
};
