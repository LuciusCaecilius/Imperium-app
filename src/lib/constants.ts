
import type { Vault } from './types';

export const VAULTS: Vault[] = [
  {
    id: '1',
    name: 'XAU.s',
    icon: 'Scale',
    iconHint: 'weighing scale balance',
    shortDescription: 'Stablecoin yield',
    description: "The vault employs a sophisticated yield-generating strategy by using the deposited XAUT as collateral to borrow stablecoins. These stablecoins are then strategically deployed across various DeFi protocols to generate yield. Profits are then auto-compounded back into XAU.s.",
    apy: 0, // REAL-TIME from Lagoon
    tvl: 0, // REAL-TIME from Lagoon
    address: '0x0963b1174a14d5c5a72257406d803c5b470cc00f',
    receiptTokenSymbol: 'XAU.s',
    exchangeRate: 1.0, // REAL-TIME from Lagoon
    performance: [], // REAL-TIME from Lagoon
    isLagoonVault: true,
  },
  {
    id: '2',
    name: 'XAU.r',
    icon: 'Building2',
    iconHint: 'real estate building',
    shortDescription: 'Real estate backed yield.',
    description: "This vault generates yield through real estate-backed assets. XAUT deposits serve as collateral for real estate investment vehicles that provide stable, tangible asset backing with attractive yield generation. Returns are auto-compounded into XAU.r.",
    apy: 4.5,
    tvl: 0,
    address: '0x0000000000000000000000000000000000000001',
    receiptTokenSymbol: 'XAU.r',
    exchangeRate: 1.0200,
    performance: [
      { date: '2024-05-01', price: 1.0000 },
      { date: '2024-05-08', price: 1.0035 },
      { date: '2024-05-15', price: 1.0072 },
      { date: '2024-05-22', price: 1.0112 },
      { date: '2024-05-29', price: 1.0155 },
      { date: '2024-06-05', price: 1.0200 },
    ],
  },
  {
    id: '3',
    name: 'XAU.c',
    icon: 'Banknote',
    iconHint: 'private credit banknote',
    shortDescription: 'Private credit backed yield.',
    description: "This vault specializes in private credit opportunities. Using XAUT as collateral, the vault provides capital to curated private credit instruments, generating superior yields compared to traditional markets. Profits are continuously auto-compounded into XAU.c.",
    apy: 6.0,
    tvl: 0,
    address: '0x0000000000000000000000000000000000000002',
    receiptTokenSymbol: 'XAU.c',
    exchangeRate: 1.0250,
    performance: [
      { date: '2024-05-01', price: 1.0000 },
      { date: '2024-05-08', price: 1.0044 },
      { date: '2024-05-15', price: 1.0090 },
      { date: '2024-05-22', price: 1.0138 },
      { date: '2024-05-29', price: 1.0189 },
      { date: '2024-06-05', price: 1.0250 },
    ],
  },
];

export function getVaultById(id: string): Vault | undefined {
    return VAULTS.find(v => v.id === id);
}
