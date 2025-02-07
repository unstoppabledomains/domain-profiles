export interface BitscrunchRiskScore {
  wallet: BitscrunchWallet;
}

export interface BitscrunchWallet {
    metadata:      BitscrunchMetadata;
    metric_values: BitscrunchMetricValues;
}

export interface BitscrunchMetadata {
    name:     string;
    address:  string;
    verified: boolean;
    chain_id: number;
}

export interface BitscrunchMetricValues {
    wallet_score: BitscrunchWalletScore;
}

export interface BitscrunchWalletScore {
    excellent?: number;
    good?: number;
    normal?: number;
    risk?: number;
    highRisk?: number;
    value: string;
    unit: string;
  }
  