/**
 * Lagoon Finance GraphQL API Client
 * Real-time vault metrics and state queries
 */

const LAGOON_API = 'https://api.lagoon.finance/query';

export interface VaultMetrics {
  netApr: number;
  grossApr: number;
  monthlyApr: number;
  weeklyApr: number;
  pricePerShare: string;
  totalAssets: string;
  totalSupply: string;
  totalAssetsUsd: string;
}

export interface VaultInfo {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  metrics: VaultMetrics | null;
}

/**
 * Query Lagoon API for vault information
 */
async function queryLagoon(query: string): Promise<any> {
  try {
    const response = await fetch(LAGOON_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Lagoon API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('[v0] Lagoon GraphQL errors:', data.errors);
      return null;
    }

    return data.data;
  } catch (error) {
    console.error('[v0] Lagoon API fetch failed:', error);
    return null;
  }
}

/**
 * Get vault metrics from Lagoon
 * Query for real-time APR, TVL, share price
 */
export async function getVaultMetrics(vaultAddress: string): Promise<VaultMetrics | null> {
  const query = `query {
    vaults(where: { address: "${vaultAddress.toLowerCase()}" }, first: 1) {
      items {
        stateAt {
          liveAPR {
            netApr
            grossApr
            monthlyApr
            weeklyApr
          }
          pricePerShare
          totalAssets
          totalSupply
          totalAssetsUsd
        }
      }
    }
  }`;

  const data = await queryLagoon(query);
  
  if (!data?.vaults?.items?.[0]?.stateAt) {
    return null;
  }

  const state = data.vaults.items[0].stateAt;
  
  return {
    netApr: state.liveAPR?.netApr || 0,
    grossApr: state.liveAPR?.grossApr || 0,
    monthlyApr: state.liveAPR?.monthlyApr || 0,
    weeklyApr: state.liveAPR?.weeklyApr || 0,
    pricePerShare: state.pricePerShare || '0',
    totalAssets: state.totalAssets || '0',
    totalSupply: state.totalSupply || '0',
    totalAssetsUsd: state.totalAssetsUsd || '0',
  };
}

/**
 * Get vault info including metrics
 */
export async function getVaultInfo(vaultAddress: string): Promise<VaultInfo | null> {
  const query = `query {
    vaults(where: { address: "${vaultAddress.toLowerCase()}" }, first: 1) {
      items {
        name
        symbol
        address
        decimals
        stateAt {
          liveAPR {
            netApr
            grossApr
            monthlyApr
            weeklyApr
          }
          pricePerShare
          totalAssets
          totalSupply
          totalAssetsUsd
        }
      }
    }
  }`;

  const data = await queryLagoon(query);
  
  if (!data?.vaults?.items?.[0]) {
    return null;
  }

  const vault = data.vaults.items[0];
  const state = vault.stateAt;

  return {
    name: vault.name,
    symbol: vault.symbol,
    address: vault.address,
    decimals: vault.decimals || 18,
    metrics: state ? {
      netApr: state.liveAPR?.netApr || 0,
      grossApr: state.liveAPR?.grossApr || 0,
      monthlyApr: state.liveAPR?.monthlyApr || 0,
      weeklyApr: state.liveAPR?.weeklyApr || 0,
      pricePerShare: state.pricePerShare || '0',
      totalAssets: state.totalAssets || '0',
      totalSupply: state.totalSupply || '0',
      totalAssetsUsd: state.totalAssetsUsd || '0',
    } : null,
  };
}

/**
 * List all available vaults
 */
export async function listVaults(limit: number = 100): Promise<VaultInfo[] | null> {
  const query = `query {
    vaults(first: ${limit}) {
      items {
        name
        symbol
        address
        decimals
        stateAt {
          liveAPR {
            netApr
          }
          pricePerShare
          totalAssets
        }
      }
    }
  }`;

  const data = await queryLagoon(query);
  
  if (!data?.vaults?.items) {
    return null;
  }

  return data.vaults.items.map((vault: any) => ({
    name: vault.name,
    symbol: vault.symbol,
    address: vault.address,
    decimals: vault.decimals || 18,
    metrics: vault.stateAt ? {
      netApr: vault.stateAt.liveAPR?.netApr || 0,
      grossApr: 0,
      monthlyApr: 0,
      weeklyApr: 0,
      pricePerShare: vault.stateAt.pricePerShare || '0',
      totalAssets: vault.stateAt.totalAssets || '0',
      totalSupply: '0',
      totalAssetsUsd: '0',
    } : null,
  }));
}
