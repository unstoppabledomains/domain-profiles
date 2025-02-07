import {isEmailValid} from '../isEmailValid';
import type {WebacyRiskScore} from './webacy';
import type {BitscrunchRiskScore} from './bitscrunch';

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
  githubPublic: false,
  linkedinPublic: false,
};

export type DiscordUserInfo = {
  kind: DomainProfileSocialMedia.Discord;
  userName: string;
} | null;

export type DomainCryptoVerificationBodyPOST = {
  symbol: string;
  address: string;
  plaintextMessage: string;
  signedMessage: string;
};

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
  BitscrunchScore = 'bitscrunchScore',
  Market = 'market',
  Portfolio = 'portfolio',
  WalletBalances = 'walletBalances',
  IsListedForSale = 'isListedForSale',
}

export enum DomainProfileKeys {
  AccessToken = 'localAccessToken',
  AuthAddress = 'authAddress',
  AuthDomain = 'authDomain',
  Messaging = 'web3-messaging',
  Signature = 'domain-sig',
  Resolution = 'reverse-resolution',
  GenericKeyValue = 'kv',
  EncryptedPIN = 'encryptedPin',
  LockStatus = 'lockStatus',
  BannerHealthCheck = 'banner-health-check',
}

export enum DomainProfileSocialMedia {
  Twitter = 'twitter',
  Discord = 'discord',
  YouTube = 'youtube',
  Reddit = 'reddit',
  Telegram = 'telegram',
  Github = 'github',
  Linkedin = 'linkedin',
}

// social media not configured by user but is displayed if exists
export enum DomainProfileSocialMediaAutoPopulated {
  Lens = 'lens',
  Farcaster = 'farcaster',
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

export type FarcasterUserInfo = {
  kind: DomainProfileSocialMediaAutoPopulated.Farcaster;
  userName: string;
  url: string;
} | null;

export type GithubUserInfo = {
  kind: DomainProfileSocialMedia.Github;
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

export const MANAGE_DOMAIN_PARAM = 'manage';

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

export type SerializedAttachmentResponse = {
  url: string;
};

export type SerializedBulkDomainResponse = {
  success: boolean;
  domains: string[];
};

export type SerializedDomainCryptoVerification = {
  id: number;
  symbol: string;
  address: string;
  plaintextMessage: string;
  signedMessage: string;
  type: string;
};

export type SerializedDomainListData = {
  data: Array<{
    domain: string;
  }>;
  meta: {
    total_count: number;
    pagination: {
      cursor: string;
      take: number;
    };
  };
  address: string;
};

export type SerializedDomainMarket = {
  primary?: {
    type: 'mint' | 'purchase' | 'distribution';
    cost?: number;
    date?: Date;
    payment?: {
      method?: string;
      promoCredits?: number;
      collected?: number;
    };
  };
  secondary?: SerializedSecondarySale[];
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
  [DomainProfileSocialMedia.Github]?: GithubUserInfo;
  [DomainProfileSocialMedia.Linkedin]?: LinkedinUserInfo;
  [DomainProfileSocialMediaAutoPopulated.Lens]?: LensUserInfo;
  [DomainProfileSocialMediaAutoPopulated.Farcaster]?: FarcasterUserInfo;
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

export type SerializedFloorPrice = {
  marketPlaceName: string;
  marketPctChange24Hr?: number;
  history?: SerializedPriceHistory[];
  value: number;
  valueUsd: string;
  valueUsdAmt: number;
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

export type SerializedPortfolioSummary = {
  wallet: {
    address: string;
    primaryDomain?: string;
    domainCount: number;
    value?: string;
    valueAmt?: number;
  };
  account: {
    domainCount: number;
    spend?: {
      collected: number;
      storeCredit: number;
      promoCredit: number;
    };
    value?: string;
    valueAmt?: number;
  };
};

export type SerializedPriceHistory = {
  timestamp: Date;
  value: number;
};

export type SerializedProfileSearch = {
  name: string;
  imagePath: string;
  imageType: string;
  ownerAddress: string;
  linkUrl: string;
  market?: {
    price: number;
    location: 'primary' | 'secondary';
  };
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
  metadata?: Record<string, string | boolean>;
  referralCode?: string;
  referralTier?: AffiliateTier;
  walletBalances?: SerializedWalletBalance[];
  webacy?: WebacyRiskScore;
  bitscrunch?: BitscrunchRiskScore;
  messaging?: MessagingAttributes;
  market?: SerializedDomainMarket;
  portfolio?: SerializedPortfolioSummary;
  isListedForSale?: boolean;
};

export type SerializedRecommendation = {
  address: string;
  domain?: string;
  imageUrl?: string;
  imageType?: string;
  reasons: SerializedRecommendationReason[];
  score: number;
};

export type SerializedRecommendationReason = {
  id: string;
  description: string;
};

export type SerializedSecondarySale = {
  date: Date;
  txHash?: string;
  marketPlace?: string;
  payment?: {
    symbol: string;
    valueUsd: number;
    valueNative: number;
  };
};

export type SerializedSocialAttributes = {
  followingCount?: number;
  followerCount?: number;
};

export type SerializedTx = {
  hash: string;
  block: string;
  from: {
    address: string;
    link: string;
    label?: string;
  };
  to: {
    address: string;
    link: string;
    label?: string;
  };
  type: TokenType;
  imageUrl?: string;
  value: number;
  gas: number;
  method: string;
  timestamp: Date;
  link: string;
  success: boolean;
  symbol?: string;
};

export type SerializedTxns = {
  data: SerializedTx[];
  cursor?: string;
};

export type SerializedUserDomainProfileData =
  SerializedPublicDomainProfileData & {
    storage?: {
      apiKey: string;
      type: string;
    };
  };

export type SerializedWalletBalance = SerializedWalletToken & {
  firstTx?: Date;
  lastTx?: Date;
  stats?: {
    nfts?: string;
    collections?: string;
    transactions?: string;
    transfers?: string;
  };
  nfts?: SerializedWalletNftCollection[];
  txns?: SerializedTxns;
  tokens?: SerializedWalletToken[];
  blockchainScanUrl: string;
  totalValueUsd?: string;
  totalValueUsdAmt?: number;
  walletType?: string;
};

export type SerializedWalletNftCollection = {
  category?: string;
  contractAddresses: string[];
  collectionImageUrl?: string;
  description?: string;
  floorPrice?: SerializedFloorPrice[];
  latestAcquiredDate: Date;
  name: string;
  nftIds?: string[];
  ownedCount: number;
  totalOwners: number;
  totalSupply: number;
  totalValueUsd?: string;
  totalValueUsdAmt?: number;
};

export type SerializedWalletToken = {
  type: TokenType.Erc20 | TokenType.Native | TokenType.Spl;
  address: string;
  symbol: string;
  gasCurrency: string;
  name: string;
  logoUrl?: string;
  balance?: string;
  balanceAmt?: number;
  value?: {
    marketUsd?: string;
    marketUsdAmt?: number;
    marketPctChange24Hr?: number;
    history?: SerializedPriceHistory[];
    walletUsd?: string;
    walletUsdAmt?: number;
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
  | FarcasterUserInfo;

export type SocialProfileVisibilityValues = {
  youtubePublic: boolean;
  telegramPublic: boolean;
  twitterPublic: boolean;
  discordPublic: boolean;
  redditPublic: boolean;
  githubPublic: boolean;
  linkedinPublic: boolean;
};

export type TelegramUserInfo = {
  kind: DomainProfileSocialMedia.Telegram;
  userName: string;
} | null;

export enum TokenType {
  Native = 'native',
  Erc20 = 'erc20',
  Spl = 'spl',
  Nft = 'nft',
}

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
  Ac = 'ac',
  Academy = 'academy',
  Accountants = 'accountants',
  Actor = 'actor',
  Africa = 'africa',
  Ag = 'ag',
  Agency = 'agency',
  Ai = 'ai',
  Airforce = 'airforce',
  Apartments = 'apartments',
  Archi = 'archi',
  Army = 'army',
  Asia = 'asia',
  Associates = 'associates',
  Attorney = 'attorney',
  Auction = 'auction',
  Band = 'band',
  Bargains = 'bargains',
  Bayern = 'bayern',
  Bet = 'bet',
  Bike = 'bike',
  Bingo = 'bingo',
  Bio = 'bio',
  Biz = 'biz',
  Black = 'black',
  Blue = 'blue',
  Boston = 'boston',
  Bot = 'bot',
  Boutique = 'boutique',
  Broker = 'broker',
  Builders = 'builders',
  Business = 'business',
  Bz = 'bz',
  Ca = 'ca',
  Cab = 'cab',
  Cafe = 'cafe',
  Camera = 'camera',
  Camp = 'camp',
  Capital = 'capital',
  Cards = 'cards',
  Care = 'care',
  Careers = 'careers',
  Cash = 'cash',
  Casino = 'casino',
  Catering = 'catering',
  Cc = 'cc',
  Center = 'center',
  Charity = 'charity',
  Chat = 'chat',
  Cheap = 'cheap',
  Church = 'church',
  City = 'city',
  Claims = 'claims',
  Cleaning = 'cleaning',
  Clinic = 'clinic',
  Clothing = 'clothing',
  Club = 'club',
  Co = 'co',
  Coach = 'coach',
  Codes = 'codes',
  Coffee = 'coffee',
  Com = 'com',
  Comag = 'comag',
  Community = 'community',
  Company = 'company',
  Computer = 'computer',
  Condos = 'condos',
  Construction = 'construction',
  Consulting = 'consulting',
  Contact = 'contact',
  Contractors = 'contractors',
  Cool = 'cool',
  Coupons = 'coupons',
  Credit = 'credit',
  Creditcard = 'creditcard',
  Cruises = 'cruises',
  Dance = 'dance',
  Dating = 'dating',
  De = 'de',
  Deal = 'deal',
  Deals = 'deals',
  Degree = 'degree',
  Delivery = 'delivery',
  Democrat = 'democrat',
  Dental = 'dental',
  Dentist = 'dentist',
  Design = 'design',
  Diamonds = 'diamonds',
  Digital = 'digital',
  Direct = 'direct',
  Directory = 'directory',
  Discount = 'discount',
  Doctor = 'doctor',
  Dog = 'dog',
  Domains = 'domains',
  Education = 'education',
  Email = 'email',
  Energy = 'energy',
  Engineer = 'engineer',
  Engineering = 'engineering',
  Enterprises = 'enterprises',
  Equipment = 'equipment',
  Estate = 'estate',
  Events = 'events',
  Exchange = 'exchange',
  Expert = 'expert',
  Exposed = 'exposed',
  Express = 'express',
  Fail = 'fail',
  Family = 'family',
  Fan = 'fan',
  Farm = 'farm',
  Finance = 'finance',
  Financial = 'financial',
  Fish = 'fish',
  Fitness = 'fitness',
  Flights = 'flights',
  Florist = 'florist',
  Football = 'football',
  Forex = 'forex',
  Forsale = 'forsale',
  Foundation = 'foundation',
  Fun = 'fun',
  Fund = 'fund',
  Furniture = 'furniture',
  Futbol = 'futbol',
  Fyi = 'fyi',
  Gallery = 'gallery',
  Games = 'games',
  Gifts = 'gifts',
  Gives = 'gives',
  Glass = 'glass',
  Global = 'global',
  Gm = 'gm',
  Gmbh = 'gmbh',
  Gold = 'gold',
  Golf = 'golf',
  Graphics = 'graphics',
  Gratis = 'gratis',
  Green = 'green',
  Gripe = 'gripe',
  Group = 'group',
  Guide = 'guide',
  Guru = 'guru',
  Haus = 'haus',
  Healthcare = 'healthcare',
  Hockey = 'hockey',
  Holdings = 'holdings',
  Holiday = 'holiday',
  Hospital = 'hospital',
  Host = 'host',
  House = 'house',
  Id = 'id',
  Immo = 'immo',
  Immobilien = 'immobilien',
  Industries = 'industries',
  Info = 'info',
  Institute = 'institute',
  Insure = 'insure',
  International = 'international',
  Investments = 'investments',
  Io = 'io',
  It = 'it',
  Jetzt = 'jetzt',
  Jewelry = 'jewelry',
  Kaufen = 'kaufen',
  Kim = 'kim',
  Kitchen = 'kitchen',
  Land = 'land',
  Lawyer = 'lawyer',
  Lease = 'lease',
  Legal = 'legal',
  Lgbt = 'lgbt',
  Life = 'life',
  Lighting = 'lighting',
  Limited = 'limited',
  Limo = 'limo',
  Live = 'live',
  Llc = 'llc',
  Loans = 'loans',
  Lotto = 'lotto',
  Ltd = 'ltd',
  Ltda = 'ltda',
  Luxe = 'luxe',
  Maison = 'maison',
  Management = 'management',
  Market = 'market',
  Marketing = 'marketing',
  Markets = 'markets',
  Mba = 'mba',
  Me = 'me',
  Media = 'media',
  Melbourne = 'melbourne',
  Memorial = 'memorial',
  Miami = 'miami',
  Mn = 'mn',
  Mobi = 'mobi',
  Moda = 'moda',
  Moi = 'moi',
  Money = 'money',
  Mortgage = 'mortgage',
  Movie = 'movie',
  Navy = 'navy',
  Net = 'net',
  Netag = 'netag',
  Network = 'network',
  News = 'news',
  Ninja = 'ninja',
  Nl = 'nl',
  Now = 'now',
  Nrw = 'nrw',
  Nyc = 'nyc',
  Observer = 'observer',
  Onl = 'onl',
  Online = 'online',
  Org = 'org',
  Orgag = 'orgag',
  Organic = 'organic',
  Partners = 'partners',
  Parts = 'parts',
  Pet = 'pet',
  Photography = 'photography',
  Photos = 'photos',
  Pictures = 'pictures',
  Pink = 'pink',
  Pizza = 'pizza',
  Place = 'place',
  Plumbing = 'plumbing',
  Plus = 'plus',
  Poker = 'poker',
  Press = 'press',
  Pro = 'pro',
  Productions = 'productions',
  Promo = 'promo',
  Properties = 'properties',
  Pub = 'pub',
  Pw = 'pw',
  Realty = 'realty',
  Recipes = 'recipes',
  Red = 'red',
  Rehab = 'rehab',
  Reise = 'reise',
  Reisen = 'reisen',
  Rentals = 'rentals',
  Repair = 'repair',
  Report = 'report',
  Republican = 'republican',
  Restaurant = 'restaurant',
  Reviews = 'reviews',
  Rich = 'rich',
  Rip = 'rip',
  Rocks = 'rocks',
  Run = 'run',
  Sale = 'sale',
  Salon = 'salon',
  Sarl = 'sarl',
  Sc = 'sc',
  School = 'school',
  Schule = 'schule',
  Services = 'services',
  Sh = 'sh',
  Shiksha = 'shiksha',
  Shoes = 'shoes',
  Shopping = 'shopping',
  Show = 'show',
  Singles = 'singles',
  Site = 'site',
  Ski = 'ski',
  Sl = 'sl',
  Soccer = 'soccer',
  Social = 'social',
  Software = 'software',
  Solar = 'solar',
  Solutions = 'solutions',
  Space = 'space',
  Srl = 'srl',
  Store = 'store',
  Studio = 'studio',
  Style = 'style',
  Supplies = 'supplies',
  Supply = 'supply',
  Support = 'support',
  Surgery = 'surgery',
  Sydney = 'sydney',
  Systems = 'systems',
  Tax = 'tax',
  Taxi = 'taxi',
  Team = 'team',
  Tech = 'tech',
  Technology = 'technology',
  Tennis = 'tennis',
  Theater = 'theater',
  Tienda = 'tienda',
  Tips = 'tips',
  Tires = 'tires',
  Today = 'today',
  Tools = 'tools',
  Tours = 'tours',
  Town = 'town',
  Toys = 'toys',
  Trading = 'trading',
  Training = 'training',
  Uk = 'uk',
  University = 'university',
  Uno = 'uno',
  Us = 'us',
  Vacations = 'vacations',
  Vc = 'vc',
  Ventures = 'ventures',
  Vet = 'vet',
  Viajes = 'viajes',
  Video = 'video',
  Villas = 'villas',
  Vin = 'vin',
  Vip = 'vip',
  Vision = 'vision',
  Vote = 'vote',
  Voto = 'voto',
  Voyage = 'voyage',
  Watch = 'watch',
  Website = 'website',
  Wine = 'wine',
  Work = 'work',
  Works = 'works',
  World = 'world',
  Wtf = 'wtf',
  Xyz = 'xyz',
  Zone = 'zone',
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

export const getDomainSignatureExpiryKey = (domain: string): string => {
  return `${DomainProfileKeys.Signature}-expiry-${domain}`;
};

export const getDomainSignatureValueKey = (domain: string): string => {
  return `${DomainProfileKeys.Signature}-value-${domain}`;
};

export const isValidIdentity = (maybeIdentity: string): boolean => {
  return isEmailValid(maybeIdentity);
};

export const kbToMb = (kb: number): number => {
  return kb / 1000 / 1024;
};
