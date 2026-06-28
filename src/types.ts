export interface PlatformUser {
  id?: string;
  address: string;
  email?: string;
  kyc: 'Verified' | 'Pending' | 'Rejected';
  balance: number;
  joined: string;
  username?: string;
}

export interface NetworkConfig {
  id: string;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
}

export type TokenType = 'USDC' | 'USDT' | 'ETH' | 'SOL';

export interface FinancialRecord {
  id: string;
  date: string;
  type: 'Income' | 'Expense';
  amount: number;
  period: 'Daily' | 'Weekly' | 'Monthly' | 'One-off';
  description: string;
}

export interface BusinessOpportunity {
  id: string;
  title: string;
  category: string;
  location: string;
  country: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  minInvestment: number;
  expectedRor: number; // Rate of Return %
  termMonths: number;
  riskScore: 'Low' | 'Medium' | 'High';
  imageUrl: string;
  equityOrDebt: 'Equity' | 'Debt';
  ownerName: string;
  impactMetrics: string[];
  fundingType?: 'Static' | 'Generalized';
  preparationDays?: number;
  sharePrice?: number;
  totalShares?: number;
  availableShares?: number;
  financialRecords?: FinancialRecord[];
}

export interface Investment {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  opportunityLocation: string;
  amount: number;
  date: string;
  expectedRor: number;
  status: 'Active' | 'Completed' | 'Pending';
  termMonths: number;
  accruedReturn: number;
  sharesOwned?: number;
}
