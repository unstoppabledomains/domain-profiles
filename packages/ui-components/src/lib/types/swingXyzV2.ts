export interface Destination {
  address: string;
  chain: string;
  token: string;
  amount: string;
  amountUSD: string;
  hash?: string;
}

export interface Distribution {
  BaseSwapV3?: number;
  odos?: number;
  bebop?: number;
  UniswapV3?: number;
}

export interface Fee {
  type: string;
  amount: string;
  amountUSD: string;
  chainSlug: string;
  tokenSymbol: string;
  tokenAddress: string;
  decimals: number;
  deductedFromSourceToken: boolean;
}

export interface FromChain {
  chainId: number;
  name: string;
  slug: string;
  protocolType: string;
}

export interface FromToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
}

export interface Quote {
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
  priceImpact: string;
}

export interface Route {
  bridge: string;
  bridgeTokenAddress: string;
  steps: string[];
  name: string;
  part: number;
}

export interface RouteQuote {
  duration: number;
  gas: string;
  quote: Quote;
  route: Route[];
  distribution: Distribution;
  gasUSD: string;
}

export interface Source {
  address: string;
  chain: string;
  token: string;
  amount: string;
  amountUSD: string;
  hash?: string;
}

export interface SwingV2AllowanceRequest {
  bridge: string;
  fromAddress: string;
  fromChain: string;
  toChain: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenAmount?: string;
  toTokenSymbol: string;
  toTokenAddress: string;
  contractCall: boolean;
}

export interface SwingV2QuoteRequest {
  // information about source token
  fromChain: string;
  fromTokenAddress: string;
  fromUserAddress: string;
  tokenSymbol: string;
  tokenAmount: string;

  // information about destination token
  toChain: string;
  toTokenSymbol: string;
  toTokenAddress: string;
  toUserAddress: string;

  // information about project configuration
  projectId?: string;
  fee?: number;
}

export interface SwingV2QuoteResponse {
  routes: RouteQuote[];
  fromToken: FromToken;
  fromChain: FromChain;
  toToken: ToToken;
  toChain: ToChain;
}

export type SwingV2SendRequest = SwingV2QuoteRequest & {
  toTokenAmount: string;
  route: Route[];
  type: string;
  integration: string;
};

export interface SwingV2SendResponse {
  id: number;
  fromToken: FromToken;
  toToken: ToToken;
  fromChain: FromChain;
  toChain: ToChain;
  route: Route[];
  tx: Tx;
  error?: string;
  message?: string;
}

export interface SwingV2SwapStatus {
  id: string;
  type: string;
  status: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
  finishedAt?: string;
  integration: string;
  source: Source;
  destination: Destination;
}

export interface SwingV2Token {
  symbol: string;
  address: string;
  chain: string;
  decimals: number;
  logo: string;
  price: number;
}

export interface SwingV2TokenAllowance {
  allowance: string;
}

export interface SwingV2TokenApproval {
  tx: Tx[];
  fromChain: FromChain;
}

export interface ToChain {
  chainId: number;
  name: string;
  slug: string;
  protocolType: string;
}

export interface ToToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
}

export interface Tx {
  data: string;
  to: string;
  from: string;
  gas: string;
  value: string;
}
