import type {DnsRecordType} from '@unstoppabledomains/resolution';

import type {ResolverKeyName} from './resolverKeys';

export enum AdditionalCurrenciesEnum {
  ZIL = 'ZIL',
  LTC = 'LTC',
  XRP = 'XRP',
  ETC = 'ETC',
  EQL = 'EQL',
  LINK = 'LINK',
  USDC = 'USDC',
  BAT = 'BAT',
  REP = 'REP',
  ZRX = 'ZRX',
  DAI = 'DAI',
  BCH = 'BCH',
  XMR = 'XMR',
  DASH = 'DASH',
  NEO = 'NEO',
  DOGE = 'DOGE',
  ZEC = 'ZEC',
  EOS = 'EOS',
  XLM = 'XLM',
  BNB = 'BNB',
  BTG = 'BTG',
  NANO = 'NANO',
  WAVES = 'WAVES',
  KMD = 'KMD',
  AE = 'AE',
  RSK = 'RSK',
  WAN = 'WAN',
  STRAT = 'STRAT',
  UBQ = 'UBQ',
  XTZ = 'XTZ',
  MIOTA = 'MIOTA',
  VET = 'VET',
  QTUM = 'QTUM',
  ICX = 'ICX',
  DGB = 'DGB',
  XZC = 'XZC',
  BURST = 'BURST',
  DCR = 'DCR',
  XEM = 'XEM',
  LSK = 'LSK',
  ATOM = 'ATOM',
  ONG = 'ONG',
  ONT = 'ONT',
  SMART = 'SMART',
  TPAY = 'TPAY',
  GRS = 'GRS',
  BSV = 'BSV',
  GAS = 'GAS',
  TRX = 'TRX',
  VTHO = 'VTHO',
  BCD = 'BCD',
  BTT = 'BTT',
  KIN = 'KIN',
  RVN = 'RVN',
  ARK = 'ARK',
  XVG = 'XVG',
  ALGO = 'ALGO',
  NEBL = 'NEBL',
  BNTY = 'BNTY',
  ONE = 'ONE',
  SWTH = 'SWTH',
  CRO = 'CRO',
  TWT = 'TWT',
  SIERRA = 'SIERRA',
  VSYS = 'VSYS',
  HIVE = 'HIVE',
  HT = 'HT',
  ENJ = 'ENJ',
  YFI = 'YFI',
  MTA = 'MTA',
  COMP = 'COMP',
  BAL = 'BAL',
  AMPL = 'AMPL',
  LEND = 'AAVE',
  USDT = 'USDT',
  FTM = 'FTM',
  FUSE = 'FUSE',
  TLOS = 'TLOS',
  XDC = 'XDC',
  AR = 'AR',
  NIM = 'NIM',
  CUSDT = 'CUSDT',
  AVAX = 'AVAX',
  DOT = 'DOT',
  BUSD = 'BUSD',
  SHIB = 'SHIB',
  LUNA = 'LUNA',
  CAKE = 'CAKE',
  MANA = 'MANA',
  EGLD = 'EGLD',
  SAND = 'SAND',
  WAXP = 'WAXP',
  '1INCH' = '1INCH',
  THETA = 'THETA',
  HNT = 'HNT',
  SAFEMOON = 'SAFEMOON',
  NEAR = 'NEAR',
  FIL = 'FIL',
  AXS = 'AXS',
  AMP = 'AMP',
  CELO = 'CELO',
  KSM = 'KSM',
  CSPR = 'CSPR',
  UNI = 'UNI',
  CEL = 'CEL',
  ERG = 'ERG',
  KAVA = 'KAVA',
  LRC = 'LRC',
  POLY = 'POLY',
  TFUEL = 'TFUEL',
  NEXO = 'NEXO',
  FLOW = 'FLOW',
  ICP = 'ICP',
  TUSD = 'TUSD',
  KLV = 'KLV',
  BLOCKS = 'BLOCKS',
  YLD = 'YLD',
  OKT = 'OKT',
  B2M = 'B2M',
  DOG = 'DOG',
  GALA = 'GALA',
  MOBX = 'MOBX',
  FAB = 'FAB',
  FIRO = 'FIRO',
  FET = 'FET',
  BEAM = 'BEAM',
  '0ZK' = '0ZK',
  SUI = 'SUI',
  MOON = 'MOON',
  SWEAT = 'SWEAT',
  DESO = 'DESO',
  FLR = 'FLR',
  SGB = 'SGB',
  POKT = 'POKT',
  XLA = 'XLA',
  KAI = 'KAI',
  APT = 'APT',
  GTH = 'GTH',
  HI = 'HI',
  MCONTENT = 'MCONTENT',
  VERSE = 'VERSE',
  ADA = 'ADA',
  HBAR = 'HBAR',
  BASE = 'BASE',
}

export enum AllInitialCurrenciesEnum {
  BTC = 'BTC',
  ETH = 'ETH',
  MATIC = 'MATIC',
  SOL = 'SOL',
}

export enum Blockchain {
  ETH = 'ETH',
  ZIL = 'ZIL',
  MATIC = 'MATIC',
}

export const Currencies = {
  ...AllInitialCurrenciesEnum,
  ...AdditionalCurrenciesEnum,
};

export type CurrenciesType =
  | AllInitialCurrenciesEnum
  | AdditionalCurrenciesEnum;

export const CurrencyToName = {
  [Currencies.BTC]: 'Bitcoin',
  [Currencies.ETH]: 'Ethereum',
  [Currencies.ZIL]: 'Zilliqa',
  [Currencies.LTC]: 'Litecoin',
  [Currencies.XRP]: 'XRP', // XRP is the full name of the currency (not Ripple, a company that uses XRP)
  [Currencies.ETC]: 'Ethereum Classic',
  [Currencies.EQL]: 'Equal',
  [Currencies.LINK]: 'Chainlink',
  [Currencies.USDC]: 'USD Coin',
  [Currencies.BAT]: 'Basic Attention Token',
  [Currencies.REP]: 'Augur',
  [Currencies.ZRX]: '0x',
  [Currencies.DAI]: 'Dai',
  [Currencies.BCH]: 'Bitcoin Cash',
  [Currencies.XMR]: 'Monero',
  [Currencies.DASH]: 'Dash',
  [Currencies.NEO]: 'Neo',
  [Currencies.DOGE]: 'Dogecoin',
  [Currencies.ZEC]: 'Zcash',
  [Currencies.ADA]: 'Cardano',
  [Currencies.EOS]: 'EOS',
  [Currencies.XLM]: 'Stellar Lumens',
  [Currencies.BNB]: 'Binance Coin',
  [Currencies.BTG]: 'Bitcoin Gold',
  [Currencies.NANO]: 'Nano',
  [Currencies.WAVES]: 'Waves',
  [Currencies.KMD]: 'Komodo',
  [Currencies.AE]: 'Aeternity',
  [Currencies.RSK]: 'RSK',
  [Currencies.WAN]: 'Wanchain',
  [Currencies.STRAT]: 'Stratis',
  [Currencies.UBQ]: 'Ubiq',
  [Currencies.XTZ]: 'Tezos',
  [Currencies.MIOTA]: 'IOTA',
  [Currencies.VET]: 'VeChain',
  [Currencies.QTUM]: 'Qtum',
  [Currencies.ICX]: 'ICON',
  [Currencies.DGB]: 'DigiByte',
  [Currencies.XZC]: 'Zcoin',
  [Currencies.BURST]: 'Burst',
  [Currencies.DCR]: 'Decred',
  [Currencies.XEM]: 'NEM',
  [Currencies.LSK]: 'Lisk',
  [Currencies.ATOM]: 'Cosmos',
  [Currencies.ONG]: 'Ontology Gas',
  [Currencies.ONT]: 'Ontology',
  [Currencies.SMART]: 'SmartCash',
  [Currencies.TPAY]: 'TokenPay',
  [Currencies.GRS]: 'GroestIcoin',
  [Currencies.BSV]: 'Bitcoin SV',
  [Currencies.GAS]: 'Gas',
  [Currencies.TRX]: 'TRON',
  [Currencies.VTHO]: 'VeThor Token',
  [Currencies.BCD]: 'Bitcoin Diamond',
  [Currencies.BTT]: 'BitTorrent',
  [Currencies.KIN]: 'Kin',
  [Currencies.RVN]: 'Ravencoin',
  [Currencies.ARK]: 'Ark',
  [Currencies.XVG]: 'Verge',
  [Currencies.ALGO]: 'Algorand',
  [Currencies.NEBL]: 'Neblio',
  [Currencies.BNTY]: 'Bounty0x',
  [Currencies.ONE]: 'Harmony',
  [Currencies.SWTH]: 'Switcheo',
  [Currencies.CRO]: 'Cronos',
  [Currencies.TWT]: 'TWT',
  [Currencies.SIERRA]: 'SIERRA',
  [Currencies.VSYS]: 'VSYS',
  [Currencies.HIVE]: 'HIVE',
  [Currencies.HT]: 'Huobi Token',
  [Currencies.ENJ]: 'Enjin Coin',
  [Currencies.YFI]: 'yearn.finance',
  [Currencies.MTA]: 'MTA',
  [Currencies.COMP]: 'Compound',
  [Currencies.BAL]: 'Balancer',
  [Currencies.AMPL]: 'Ampleforth',
  [Currencies.LEND]: 'AAVE (LEND)',
  [Currencies.USDT]: 'Tether',
  [Currencies.FTM]: 'Fantom',
  [Currencies.FUSE]: 'Fuse Network',
  [Currencies.TLOS]: 'Telos',
  [Currencies.XDC]: 'XinFin',
  [Currencies.AR]: 'Arweave',
  [Currencies.NIM]: 'Nimiq',
  [Currencies.MATIC]: 'Polygon',
  [Currencies.SOL]: 'Solana',
  [Currencies.CUSDT]: 'Compound USDT',
  [Currencies.AVAX]: 'Avalanche',
  [Currencies.DOT]: 'Polkadot',
  [Currencies.BUSD]: 'Binance USD',
  [Currencies.SHIB]: 'SHIBA INU',
  [Currencies.LUNA]: 'Terra',
  [Currencies.CAKE]: 'PancakeSwap',
  [Currencies.MANA]: 'Decentraland',
  [Currencies.EGLD]: 'Elrond',
  [Currencies.SAND]: 'The Sandbox',
  [Currencies.HBAR]: 'Hedera',
  [Currencies.WAXP]: 'WAX',
  [Currencies['1INCH']]: '1inch',
  [Currencies.THETA]: 'THETA',
  [Currencies.HNT]: 'Helium',
  [Currencies.SAFEMOON]: 'SafeMoon',
  [Currencies.NEAR]: 'NEAR Protocol',
  [Currencies.FIL]: 'Filecoin',
  [Currencies.AXS]: 'Axie Infinity',
  [Currencies.AMP]: 'Amp',
  [Currencies.CELO]: 'Celo',
  [Currencies.KSM]: 'Kusama',
  [Currencies.CSPR]: 'Casper',
  [Currencies.UNI]: 'Uniswap',
  [Currencies.CEL]: 'Celsius',
  [Currencies.ERG]: 'Ergo',
  [Currencies.KAVA]: 'Kava',
  [Currencies.LRC]: 'Loopring',
  [Currencies.POLY]: 'Polymath',
  [Currencies.TFUEL]: 'Theta Fuel',
  [Currencies.NEXO]: 'Nexo',
  [Currencies.FLOW]: 'Flow',
  [Currencies.ICP]: 'Internet Computer',
  [Currencies.TUSD]: 'TrueUSD',
  [Currencies.KLV]: 'Klever',
  [Currencies.YLD]: 'Yield App',
  [Currencies.OKT]: 'OKC Token',
  [Currencies.B2M]: 'Bit2Me',
  [Currencies.DOG]: 'The Doge NFT',
  [Currencies.GALA]: 'Gala',
  [Currencies.MOBX]: 'MOBIX',
  [Currencies.FIRO]: 'Firo',
  [Currencies.BEAM]: 'Beam',
  [Currencies['0ZK']]: 'Railgun',
  [Currencies.SUI]: 'Sui',
  [Currencies.MOON]: 'MOON',
  [Currencies.SWEAT]: 'SWEAT',
  [Currencies.DESO]: 'DeSo',
  [Currencies.FLR]: 'Flare',
  [Currencies.SGB]: 'Songbird',
  [Currencies.POKT]: 'Pocket Network',
  [Currencies.XLA]: 'Scala',
  [Currencies.KAI]: 'KardiaChain',
  [Currencies.APT]: 'Aptos',
  [Currencies.GTH]: 'Gather',
  [Currencies.VERSE]: 'Verse',
  [Currencies.MCONTENT]: 'MContent',
} as const;

export type DnsRecord = {
  type: DnsRecordType;
  data: string;
  TTL?: number;
};

export type DomainAddressRecord = {
  key: ResolverKeyName;
  value: string;
};

export type DomainRawRecords = Partial<Record<ResolverKeyName, string>>;

export interface DomainRecords {
  addresses: Record<string, string>;
  dns: DnsRecord[];
  ipfs: {
    html?: string;
    redirect_domain?: string;
  };
  meta: Meta;
  multicoinAddresses: Record<string, Record<string, string>>;
  records: DomainRawRecords;
  social: Record<string, string>;
  /**
   * @deprecated We switched to off-chain storage if this data inside domain profiles
   */
  whois: {
    email?: string;
    for_sale?: boolean;
  };
}

export type EvmBlockchain = Blockchain.ETH | Blockchain.MATIC;

export type Meta = {
  logicalOwnerAddress: string | null;
  blockchain: Blockchain | null;
  type: Registry;
  networkId: string | null;
  owner: string | null;
  ttl: number;
  tokenId?: string;
  domain: string;
  namehash: string;
  registryAddress: string | null;
  resolver: string | null;
  reverse: boolean;
};

export enum Mirror {
  UNS = 'UNS',
  ENS = 'ENS',
  ZNS = 'ZNS',
}

/**
 * UNS resolver key for a multi-chain address record, i.e. "crypto.MATIC.version.ERC20.address"
 * @currency currency symbol, i.e. "MATIC"
 * @versions array of versions, i.e. [{key: "crypto.MATIC.version.ERC20.address", version: "ERC20", value: "0x1238686868576575465464654"}]
 */
export type MultiChainAddressRecord = {
  currency: CurrenciesType;
  versions: MultiChainAddressVersion[];
};

export type MultiChainAddressVersion = DomainAddressRecord & {version: string};

export type NewAddressRecord = {
  currency: CurrenciesType;
  versions: {key: ResolverKeyName; deprecated: boolean}[];
};

export enum Registry {
  CNS = 'CNS',
  UNS = 'UNS',
  ENS = 'ENS',
}

/**
 * Single-chain address record
 */
export type SingleChainAddressRecord = DomainAddressRecord & {
  currency: CurrenciesType;
};
