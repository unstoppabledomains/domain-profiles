export interface WebacyCategories {
  wallet_characteristics: WebacyWalletCharacteristics;
}

export interface WebacyIssue {
  score: number;
  tags: WebacyTag[];
  categories: WebacyCategories;
}

export interface WebacyRiskScore {
  count: number;
  medium: number;
  high: number;
  overallRisk: number;
  issues: WebacyIssue[];
}

export interface WebacyTag {
  name: string;
  description: string;
  type: string;
  severity: number;
  key: string;
}

export interface WebacyTags {
  insufficient_wallet_age: boolean;
  insufficient_wallet_balance: boolean;
  insufficient_wallet_transactions: boolean;
}

export interface WebacyWalletCharacteristics {
  key: string;
  name: string;
  description: string;
  tags: WebacyTags;
}
