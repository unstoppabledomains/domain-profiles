import type {SvgIconProps} from '@mui/material/SvgIcon';
import dynamic from 'next/dynamic';
import React from 'react';

import type {CurrenciesType} from '../../lib/types/blockchain';
import {Currencies} from '../../lib/types/blockchain';

const Bitcoin = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Bitcoin'),
);
const Ethereum = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Ethereum'),
);
const Litecoin = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Litecoin'),
);
const Ripple = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Ripple'),
);
const Zilliqa = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Zilliqa'),
);
const EthereumClassic = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/EthereumClassic'),
);
const Chainlink = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Chainlink'),
);
const USDCoin = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/USDCoin'),
);
const BasicAttentionToken = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/BasicAttentionToken'),
);
const Augur = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Augur'),
);
const ZRX = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/ZRX'),
);
const Dai = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Dai'),
);
const BitcoinCash = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/BitcoinCash'),
);
const Monero = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Monero'),
);
const Dash = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Dash'),
);
const Neo = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Neo'),
);
const Doge = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Doge'),
);
const Zcash = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Zcash'),
);
const Cardano = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Cardano'),
);
const EOS = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/EOS'),
);
const StellarLumens = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/StellarLumens'),
);
const BinanceCoin = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/BinanceCoin'),
);
const BitcoinGold = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/BitcoinGold'),
);
const Nano = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Nano'),
);
const WavesTech = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/WavesTech'),
);
const Komodo = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Komodo'),
);
const Aeternity = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Aeternity'),
);
const Wanchain = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Wanchain'),
);
const Ubiq = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Ubiq'),
);
const Tezos = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Tezos'),
);
const Iota = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Iota'),
);
const VeChain = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/VeChain'),
);
const Qtum = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Qtum'),
);
const ICX = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/ICX'),
);
const DigiByte = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/DigiByte'),
);
const Zcoin = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Zcoin'),
);
const Burst = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Burst'),
);
const Decred = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Decred'),
);
const NEM = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/NEM'),
);
const Lisk = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Lisk'),
);
const Cosmos = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Cosmos'),
);
const Ontology = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Ontology'),
);
const SmartCash = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/SmartCash'),
);
const TokenPay = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/TokenPay'),
);
const GroestIcoin = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/GroestIcoin'),
);
const Gas = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Gas'),
);
const TRON = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/TRON'),
);
const VeThorToken = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/VeThorToken'),
);
const BitcoinDiamond = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/BitcoinDiamond'),
);
const BitTorrent = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/BitTorrent'),
);
const Kin = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Kin'),
);
const Ravencoin = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Ravencoin'),
);
const Ark = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Ark'),
);
const Verge = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Verge'),
);
const Algorand = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Algorand'),
);
const Neblio = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Neblio'),
);
const Bounty = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Bounty'),
);
const Harmony = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Harmony'),
);
const HuobiToken = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/HuobiToken'),
);
const EnjinCoin = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/EnjinCoin'),
);
const YearnFinance = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/YearnFinance'),
);
const Compound = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Compound'),
);
const Balancer = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Balancer'),
);
const Ampleforth = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Ampleforth'),
);
const Tether = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Tether'),
);
const Lend = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Lend'),
);
const BitcoinSV = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/BitcoinSV'),
);
const XinFin = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/XinFin'),
);
const CRO = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/CRO'),
);
const Fantom = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Fantom'),
);
const Stratis = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Stratis'),
);
const Switcheo = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Switcheo'),
);
const FuseNetwork = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/FuseNetwork'),
);
const Arweave = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Arweave'),
);
const Nimiq = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Nimiq'),
);
const Polygon = dynamic(() =>
  import('@unstoppabledomains/ui-kit/icons/Polygon').then(
    mod => mod.Polygon36x36,
  ),
);
const Solana = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Solana'),
);
const CompoundTether = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/CompoundTether'),
);
const Avalanche = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Avalanche'),
);
const Polkadot = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Polkadot'),
);
const BinanceUSD = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/BinanceUSD'),
);
const SHIB = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/SHIB'),
);
const Terra = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Terra'),
);
const PancakeSwap = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/PancakeSwap'),
);
const MANA = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/MANA'),
);
const Elrond = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Elrond'),
);
const SAND = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/SAND'),
);
const Hedera = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Hedera'),
);
const WAXP = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/WAXP'),
);
const ONEINCH = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/ONEINCH'),
);
const BLOCKS = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Blocks'),
);
const THETA = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/THETA'),
);
const Helium = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Helium'),
);
const SafeMoon = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/SafeMoon'),
);
const NEARProtocol = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/NEARProtocol'),
);
const Filecoin = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Filecoin'),
);
const AxieInfinity = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/AxieInfinity'),
);
const Amp = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Amp'),
);
const Celo = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Celo'),
);
const Kusama = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Kusama'),
);
const Casper = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Casper'),
);
const Uniswap = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Uniswap'),
);
const Celsius = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Celsius'),
);
const Ergo = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Ergo'),
);
const Kava = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Kava'),
);
const Loopring = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Loopring'),
);
const Polymath = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Polymath'),
);
const ThetaFuel = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/ThetaFuel'),
);
const Nexo = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Nexo'),
);
const Flow = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Flow'),
);
const InternetComputer = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/InternetComputer'),
);
const TrueUSD = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/TrueUSD'),
);
const Klever = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Klever'),
);
const YieldApp = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/YieldApp'),
);
const OKT = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/OKT'),
);
const Bit2Me = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Bit2Me'),
);
const TheDogeNFT = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/TheDogeNFT'),
);
const Gala = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Gala'),
);
const Mobix = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Mobix'),
);
const Fab = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Fabric'),
);
const Firo = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Firo'),
);
const Fet = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Fet'),
);
const Beam = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Beam'),
);
const RailgunIcon = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/RailgunIcon'),
);
const Sui = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Sui'),
);
const Moon = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/MOON'),
);
const Sweat = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Sweat'),
);
const Deso = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Deso'),
);
const FLR = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/FLR'),
);
const SGB = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/SGB'),
);
const POKT = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/PocketNetwork'),
);
const XLA = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Scala'),
);
const KAI = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/KardiaChain'),
);
const APT = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Aptos'),
);
const GTH = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Gather'),
);
const HI = dynamic(() => import('@unstoppabledomains/ui-kit/icons/crypto/HI'));
const Verse = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/Verse'),
);

const MContent = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/crypto/MContent'),
);

type Props = {
  currency: CurrenciesType;
} & SvgIconProps;

export const CryptoIcon = React.forwardRef<SVGSVGElement, Props>(
  ({currency, ...rest}, ref) => {
    switch (currency) {
      case Currencies.BTC:
        return <Bitcoin {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.ETH:
        return <Ethereum {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.LTC:
        return <Litecoin {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.XRP:
        return <Ripple {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.ZIL:
        return <Zilliqa {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.ETC:
        return <EthereumClassic {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.LINK:
        return <Chainlink {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.USDC:
        return <USDCoin {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.BAT:
        return <BasicAttentionToken {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.REP:
        return <Augur {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.ZRX:
        return <ZRX {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.DAI:
        return <Dai {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.BCH:
        return <BitcoinCash {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.XMR:
        return <Monero {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.DASH:
        return <Dash {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.NEO:
        return <Neo {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.DOGE:
        return <Doge {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.ZEC:
        return <Zcash {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.ADA:
        return <Cardano {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.EOS:
        return <EOS {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.XLM:
        return <StellarLumens {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.BNB:
        return <BinanceCoin {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.BTG:
        return <BitcoinGold {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.NANO:
        return <Nano {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.WAVES:
        return <WavesTech {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.KMD:
        return <Komodo {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.AE:
        return <Aeternity {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.WAN:
        return <Wanchain {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.UBQ:
        return <Ubiq {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.XTZ:
        return <Tezos {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.MIOTA:
        return <Iota {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.VET:
        return <VeChain {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.QTUM:
        return <Qtum {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.ICX:
        return <ICX {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.DGB:
        return <DigiByte {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.XZC:
        return <Zcoin {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.BURST:
        return <Burst {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.DCR:
        return <Decred {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.XEM:
        return <NEM {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.LSK:
        return <Lisk {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.ATOM:
        return <Cosmos {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.ONT:
        return <Ontology {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.SMART:
        return <SmartCash {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.TPAY:
        return <TokenPay {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.GRS:
        return <GroestIcoin {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.GAS:
        return <Gas {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.TRX:
        return <TRON {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.VTHO:
        return <VeThorToken {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.BCD:
        return <BitcoinDiamond {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.BTT:
        return <BitTorrent {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.KIN:
        return <Kin {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.RVN:
        return <Ravencoin {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.ARK:
        return <Ark {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.XVG:
        return <Verge {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.ALGO:
        return <Algorand {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.NEBL:
        return <Neblio {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.BNTY:
        return <Bounty {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.ONE:
        return <Harmony {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.HT:
        return <HuobiToken {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.ENJ:
        return <EnjinCoin {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.YFI:
        return <YearnFinance {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.COMP:
        return <Compound {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.BAL:
        return <Balancer {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.AMPL:
        return <Ampleforth {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.USDT:
        return <Tether {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.LEND:
        return <Lend {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.BSV:
        return <BitcoinSV {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.XDC:
        return <XinFin {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.CRO:
        return <CRO {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.FTM:
        return <Fantom {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.STRAT:
        return <Stratis {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.SWTH:
        return <Switcheo {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.FUSE:
        return <FuseNetwork {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.AR:
        return <Arweave {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.NIM:
        return <Nimiq {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.MATIC:
        return <Polygon {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.SOL:
        return <Solana {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.CUSDT:
        return <CompoundTether {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.AVAX:
        return <Avalanche {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.DOT:
        return <Polkadot {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.BUSD:
        return <BinanceUSD {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.SHIB:
        return <SHIB {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.LUNA:
        return <Terra {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.CAKE:
        return <PancakeSwap {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.MANA:
        return <MANA {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.EGLD:
        return <Elrond {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.SAND:
        return <SAND {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.HBAR:
        return <Hedera {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.WAXP:
        return <WAXP {...rest} fr={undefined} iconRef={ref} />;
      case Currencies['1INCH']:
        return <ONEINCH {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.BLOCKS:
        return <BLOCKS {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.THETA:
        return <THETA {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.HNT:
        return <Helium {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.SAFEMOON:
        return <SafeMoon {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.NEAR:
        return <NEARProtocol {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.FIL:
        return <Filecoin {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.AXS:
        return <AxieInfinity {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.AMP:
        return <Amp {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.CELO:
        return <Celo {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.KSM:
        return <Kusama {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.CSPR:
        return <Casper {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.UNI:
        return <Uniswap {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.CEL:
        return <Celsius {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.ERG:
        return <Ergo {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.KAVA:
        return <Kava {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.LRC:
        return <Loopring {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.POLY:
        return <Polymath {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.TFUEL:
        return <ThetaFuel {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.NEXO:
        return <Nexo {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.FLOW:
        return <Flow {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.ICP:
        return <InternetComputer {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.TUSD:
        return <TrueUSD {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.KLV:
        return <Klever {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.YLD:
        return <YieldApp {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.OKT:
        return <OKT {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.B2M:
        return <Bit2Me {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.DOG:
        return <TheDogeNFT {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.GALA:
        return <Gala {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.MOBX:
        return <Mobix {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.FAB:
        return <Fab {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.FIRO:
        return <Firo {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.FET:
        return <Fet {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.BEAM:
        return <Beam {...rest} fr={undefined} iconRef={ref} />;
      case Currencies['0ZK']:
        return <RailgunIcon {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.SUI:
        return <Sui {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.MOON:
        return <Moon {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.SWEAT:
        return <Sweat {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.DESO:
        return <Deso {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.FLR:
        return <FLR {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.SGB:
        return <SGB {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.POKT:
        return <POKT {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.XLA:
        return <XLA {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.KAI:
        return <KAI {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.APT:
        return <APT {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.GTH:
        return <GTH {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.HI:
        return <HI {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.VERSE:
        return <Verse {...rest} fr={undefined} iconRef={ref} />;
      case Currencies.MCONTENT:
        return <MContent {...rest} fr={undefined} iconRef={ref} />;
      default:
        return null;
    }
  },
);
