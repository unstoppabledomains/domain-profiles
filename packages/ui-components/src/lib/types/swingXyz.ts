export interface SwingQuoteRequest {
  type: string;
  source: Source;
  destination: Destination;
  affiliate?: string;
}

export interface Source {
  token: string;
  chain: string;
  wallet: string;
  amount?: string;
}

export interface Destination {
  token: string;
  chain: string;
  wallet: string;
  amount?: string;
}

export type SwingQuoteResponse = SwingQuote[];

export interface SwingQuote {
  type: string;
  amount: string;
  amountUSD: string;
  duration: number;
  integration: string;
  fees: Fees;
}

export interface Fees {
  bridge: Bridge;
  gas: Gas;
  partner: Partner;
}

export interface Bridge {
  token: string;
  amount: string;
  amountUSD: string;
}

export interface Gas {
  token: string;
  amount: string;
  amountUSD: string;
}

export interface Partner {
  token: string;
  amount: string;
  amountUSD: string;
}

export interface SwingToken {
  symbol: string;
  address: string;
  chain: string;
  decimals: number;
  logo: string;
  price: number;
}
