/**
 * Lagoon Finance API Client
 * Single source of truth for XAU.s vault real-time data
 * Fetches directly from https://api.lagoon.finance/query
 */

export interface VaultState {
  totalAssets: string; // Wei as string
  totalSupply: string; // Wei as string
  pricePerShare: string; // Wei as string
  pricePerShareUsd: string;
  totalAssetsUsd: string;
  managementFee: string;
  performanceFee: string;
  syncMode: string;
}

export interface Asset {
  address: string;
  symbol: string;
  decimals: number;
}

export interface Chain {
  id: number;
  name: string;
}

export interface LagoonVault {
  address: string;
  name: string;
  symbol: string;
  creationDate: string;
  asset: Asset;
  chain: Chain;
  state: VaultState;
}

/**
 * Fetch XAU.s vault data from Lagoon Finance API
 * Using vaultByAddress query for real-time blockchain state
 */
export async function fetchXAUsVaultData(): Promise<LagoonVault | null> {
  try {
    const query = `
      query GetVault {
        vaultByAddress(
          address: "0x0963b1174a14d5c5a72257406d803c5b470cc00f"
          chainId: 1
        ) {
          address
          name
          symbol
          creationDate
          asset { address symbol decimals }
          chain { id name }
          state {
            totalAssets
            totalSupply
            pricePerShare
            pricePerShareUsd
            totalAssetsUsd
            managementFee
            performanceFee
            syncMode
          }
        }
      }
    `;

    const response = await fetch('https://api.lagoon.finance/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[v0] Lagoon API error:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.errors) {
      console.error('[v0] Lagoon GraphQL error:', data.errors);
      return null;
    }

    const vault = data.data?.vaultByAddress;
    if (!vault) {
      console.error('[v0] Vault not found in Lagoon response');
      return null;
    }

    console.log('[v0] XAU.s vault data fetched from Lagoon:', {
      name: vault.name,
      totalAssets: vault.state.totalAssets,
      pricePerShare: vault.state.pricePerShare,
      totalSupply: vault.state.totalSupply,
    });

    return vault;
  } catch (error) {
    console.error('[v0] Failed to fetch XAU.s data from Lagoon:', error);
    return null;
  }
}

/**
 * Convert wei string to decimal number with specified precision
 * @param weiString Wei value as string (e.g., from blockchain)
 * @param decimals Number of token decimals
 * @param precision Decimal places to round to (default 6)
 * @returns Number with specified precision
 */
export function formatWeiToDecimal(
  weiString: string,
  decimals: number,
  precision: number = 6
): number {
  if (!weiString || weiString === '0') return 0;

  try {
    const weiNum = BigInt(weiString);
    const divisor = BigInt(10 ** decimals);
    const wholePart = weiNum / divisor;
    const fractionalPart = weiNum % divisor;

    const whole = Number(wholePart);
    const fractional = Number(fractionalPart) / Number(divisor);

    const result = whole + fractional;
    const rounded = parseFloat(result.toFixed(precision));

    return rounded;
  } catch (error) {
    console.error('[v0] Error formatting wei value:', error);
    return 0;
  }
}

/**
 * Calculate metrics from vault state
 */
export function calculateVaultMetrics(vault: LagoonVault) {
  const decimals = vault.asset.decimals;

  // TVL in XAUT (actual asset)
  const tvl = formatWeiToDecimal(vault.state.totalAssets, decimals, 6);

  // Share price (how many XAUT per 1 share)
  const sharePrice = formatWeiToDecimal(vault.state.pricePerShare, decimals, 6);

  // Total supply of shares
  const totalSupply = formatWeiToDecimal(vault.state.totalSupply, decimals, 6);

  // Exchange rate: 1 XAUT = X XAU.s (inverse of share price)
  const exchangeRate = sharePrice > 0 ? 1 / sharePrice : 0;
  const exchangeRateRounded = parseFloat(exchangeRate.toFixed(6));

  // APY will be fetched from performance metrics or historical data
  // For now, we'll calculate it from state if available
  let apr = 0;
  if (vault.state.managementFee) {
    // Management fee is deducted from performance
    apr = 0; // Will be calculated from historical performance
  }

  return {
    tvl,
    sharePrice,
    totalSupply,
    exchangeRate: exchangeRateRounded,
    apr,
  };
}
