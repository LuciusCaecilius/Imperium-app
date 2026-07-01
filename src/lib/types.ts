
import type { BrowserProvider, JsonRpcSigner, ethers } from 'ethers';

export interface Vault {
  id: string;
  name: string;
  icon: string;
  iconHint: string;
  shortDescription: string;
  description: string;
  apy: number;
  tvl: number;
  address: string;
  receiptTokenSymbol: string;
  exchangeRate: number; // 1 XAUT to X receipt tokens
  performance?: { date: string; price: number }[];
  isLagoonVault?: boolean; // Real Lagoon Finance vault with live data
}

export interface Transaction {
    txHash: string;
    type: 'Deposit' | 'Withdraw' | 'Claim';
    vault?: string;
    amount: number;
    token: string;
    date: Date;
    status: 'Completed' | 'Pending' | 'Failed';
}

export interface WalletState {
    address: string;
    xautBalance: number;
    provider: BrowserProvider;
    signer: JsonRpcSigner;
}

export interface VaultDeposit {
    xautAmount: number;
    receiptTokenAmount: number;
    withdrawalRequestAmount: number;
}

export interface LiveVaultData {
    apy: number;
    tvl: number;
    exchangeRate: number;
}
