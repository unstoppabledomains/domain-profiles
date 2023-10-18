import type {SvgIconProps} from '@mui/material/SvgIcon';
import type {AllCurrenciesType} from 'lib/types/blockchain';
import {AllCurrencies} from 'lib/types/blockchain';
import dynamic from 'next/dynamic';
import React from 'react';

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
const Polygon = dynamic(
  () => import('@unstoppabledomains/ui-kit/icons/Polygon'),
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
  currency: AllCurrenciesType;
} & SvgIconProps;

export const CryptoIcon = React.forwardRef<SVGSVGElement, Props>(
  ({currency, ...rest}, ref) => {
    switch (currency) {
      case AllCurrencies.BTC:
        return <Bitcoin {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.ETH:
        return <Ethereum {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.LTC:
        return <Litecoin {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.XRP:
        return <Ripple {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.ZIL:
        return <Zilliqa {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.ETC:
        return <EthereumClassic {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.LINK:
        return <Chainlink {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.USDC:
        return <USDCoin {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.BAT:
        return <BasicAttentionToken {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.REP:
        return <Augur {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.ZRX:
        return <ZRX {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.DAI:
        return <Dai {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.BCH:
        return <BitcoinCash {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.XMR:
        return <Monero {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.DASH:
        return <Dash {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.NEO:
        return <Neo {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.DOGE:
        return <Doge {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.ZEC:
        return <Zcash {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.ADA:
        return <Cardano {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.EOS:
        return <EOS {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.XLM:
        return <StellarLumens {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.BNB:
        return <BinanceCoin {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.BTG:
        return <BitcoinGold {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.NANO:
        return <Nano {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.WAVES:
        return <WavesTech {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.KMD:
        return <Komodo {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.AE:
        return <Aeternity {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.WAN:
        return <Wanchain {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.UBQ:
        return <Ubiq {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.XTZ:
        return <Tezos {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.MIOTA:
        return <Iota {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.VET:
        return <VeChain {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.QTUM:
        return <Qtum {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.ICX:
        return <ICX {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.DGB:
        return <DigiByte {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.XZC:
        return <Zcoin {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.BURST:
        return <Burst {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.DCR:
        return <Decred {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.XEM:
        return <NEM {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.LSK:
        return <Lisk {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.ATOM:
        return <Cosmos {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.ONT:
        return <Ontology {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.SMART:
        return <SmartCash {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.TPAY:
        return <TokenPay {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.GRS:
        return <GroestIcoin {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.GAS:
        return <Gas {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.TRX:
        return <TRON {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.VTHO:
        return <VeThorToken {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.BCD:
        return <BitcoinDiamond {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.BTT:
        return <BitTorrent {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.KIN:
        return <Kin {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.RVN:
        return <Ravencoin {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.ARK:
        return <Ark {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.XVG:
        return <Verge {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.ALGO:
        return <Algorand {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.NEBL:
        return <Neblio {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.BNTY:
        return <Bounty {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.ONE:
        return <Harmony {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.HT:
        return <HuobiToken {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.ENJ:
        return <EnjinCoin {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.YFI:
        return <YearnFinance {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.COMP:
        return <Compound {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.BAL:
        return <Balancer {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.AMPL:
        return <Ampleforth {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.USDT:
        return <Tether {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.LEND:
        return <Lend {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.BSV:
        return <BitcoinSV {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.XDC:
        return <XinFin {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.CRO:
        return <CRO {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.FTM:
        return <Fantom {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.STRAT:
        return <Stratis {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.SWTH:
        return <Switcheo {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.FUSE:
        return <FuseNetwork {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.AR:
        return <Arweave {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.NIM:
        return <Nimiq {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.MATIC:
        return <Polygon {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.SOL:
        return <Solana {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.CUSDT:
        return <CompoundTether {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.AVAX:
        return <Avalanche {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.DOT:
        return <Polkadot {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.BUSD:
        return <BinanceUSD {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.SHIB:
        return <SHIB {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.LUNA:
        return <Terra {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.CAKE:
        return <PancakeSwap {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.MANA:
        return <MANA {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.EGLD:
        return <Elrond {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.SAND:
        return <SAND {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.HBAR:
        return <Hedera {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.WAXP:
        return <WAXP {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies['1INCH']:
        return <ONEINCH {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.BLOCKS:
        return <BLOCKS {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.THETA:
        return <THETA {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.HNT:
        return <Helium {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.SAFEMOON:
        return <SafeMoon {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.NEAR:
        return <NEARProtocol {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.FIL:
        return <Filecoin {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.AXS:
        return <AxieInfinity {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.AMP:
        return <Amp {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.CELO:
        return <Celo {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.KSM:
        return <Kusama {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.CSPR:
        return <Casper {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.UNI:
        return <Uniswap {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.CEL:
        return <Celsius {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.ERG:
        return <Ergo {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.KAVA:
        return <Kava {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.LRC:
        return <Loopring {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.POLY:
        return <Polymath {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.TFUEL:
        return <ThetaFuel {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.NEXO:
        return <Nexo {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.FLOW:
        return <Flow {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.ICP:
        return <InternetComputer {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.TUSD:
        return <TrueUSD {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.KLV:
        return <Klever {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.YLD:
        return <YieldApp {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.OKT:
        return <OKT {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.B2M:
        return <Bit2Me {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.DOG:
        return <TheDogeNFT {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.GALA:
        return <Gala {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.MOBX:
        return <Mobix {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.FAB:
        return <Fab {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.FIRO:
        return <Firo {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.FET:
        return <Fet {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.BEAM:
        return <Beam {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies['0ZK']:
        return <RailgunIcon {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.SUI:
        return <Sui {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.MOON:
        return <Moon {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.SWEAT:
        return <Sweat {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.DESO:
        return <Deso {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.FLR:
        return <FLR {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.SGB:
        return <SGB {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.POKT:
        return <POKT {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.XLA:
        return <XLA {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.KAI:
        return <KAI {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.APT:
        return <APT {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.GTH:
        return <GTH {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.HI:
        return <HI {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.VERSE:
        return <Verse {...rest} fr={undefined} iconRef={ref} />;
      case AllCurrencies.MCONTENT:
        return <MContent {...rest} fr={undefined} iconRef={ref} />;
      default:
        return null;
    }
  },
);
