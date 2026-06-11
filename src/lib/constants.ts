
import type { Vault } from './types';

export const VAULTS: Vault[] = [
  {
    id: '1',
    name: 'XAU.S',
    icon: 'Scale',
    iconHint: 'weighing scale balance',
    shortDescription: 'Low-risk stablecoin yield.',
    description: "The vault employs a sophisticated yield-generating strategy by using the deposited XAUT as collateral to borrow stablecoins. These stablecoins are then strategically deployed across various DeFi protocols to generate yield. Profits are then auto-compounded back into XAU.S",
    apy: 2.0,
    tvl: 0, 
    address: '0x0963b1174A14D5C5A72257406D803C5B470CC00F',
    receiptTokenSymbol: 'XAU.S',
    exchangeRate: 1.015,
    performance: [
      { date: '2024-05-01', price: 1.0000 },
      { date: '2024-05-08', price: 1.0025 },
      { date: '2024-05-15', price: 1.0052 },
      { date: '2024-05-22', price: 1.0081 },
      { date: '2024-05-29', price: 1.0112 },
      { date: '2024-06-05', price: 1.0150 },
    ],
  },
];

export function getVaultById(id: string): Vault | undefined {
    return VAULTS.find(v => v.id === id);
}
