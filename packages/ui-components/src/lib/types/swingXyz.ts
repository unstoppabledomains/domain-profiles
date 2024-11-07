interface FromChain {
  chainId: number;
  name: string;
  slug: string;
  protocolType: string;
}

interface FromToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
}

export interface RouteQuote {
  duration: number;
  gas: string;
  quote: Quote;
  route: RouteStep[];
  distribution: {[key: string]: number};
  gasUSD: string;
}

export interface RouteTransaction {
  bridge: string;
  bridgeTokenAddress: string;
  steps: string[];
  name: string;
  part: number;
}

interface Quote {
  integration: string;
  type: string;
  bridgeFee: string;
  bridgeFeeInNativeToken: string;
  amount: string;
  decimals: number;
  amountUSD: string;
  bridgeFeeUSD: string;
  bridgeFeeInNativeTokenUSD: string;
  fees: Fee[];
  priceImpact?: string;
}

interface Fee {
  type: string;
  amount: string;
  amountUSD: string;
  chainSlug: string;
  tokenSymbol: string;
  tokenAddress: string;
  decimals: number;
  deductedFromSourceToken: boolean;
}

interface RouteStep {
  bridge: string;
  bridgeTokenAddress: string;
  steps: string[];
  name: string;
  part: number;
}

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
}

interface Chain {
  chainId: number;
  name: string;
  slug: string;
  protocolType: string;
}

export interface SwingQuoteRequest {
  // information about source token
  fromChain: string;
  fromChainDecimal: number;
  fromTokenAddress?: string;
  fromUserAddress: string;
  tokenSymbol: string;
  tokenAmount: string;

  // information about destination token
  toChain: string;
  toChainDecimal: number;
  toTokenSymbol: string;
  toTokenAddress?: string;
  toUserAddress: string;

  // information about the project configuration
  projectId?: string;
  fee?: number;
}

export interface SwingQuoteResponse {
  routes: RouteQuote[];
  fromToken: Token;
  fromChain: Chain;
  toToken: Token;
  toChain: Chain;
}

export interface SwingToken {
  symbol: string;
  address: string;
  chain: string;
  decimals: number;
  logo: string;
  price: number;
}

export interface SwingTransactionResponse {
  id: number;
  fromToken: FromToken;
  toToken: ToToken;
  fromChain: FromChain;
  toChain: ToChain;
  route: RouteTransaction[];
  message: string;
  error: string;
  statusCode: number;
  tx: SwingTx;
}

export interface SwingTx {
  from: string;
  to: string;
  data: string;
  value: string;
  txId: string;
}

interface ToChain {
  chainId: number;
  name: string;
  slug: string;
  protocolType: string;
}

interface ToToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
}
