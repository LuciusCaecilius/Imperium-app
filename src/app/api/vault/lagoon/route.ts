import { NextResponse } from 'next/server';
import {
  fetchXAUsVaultData,
  calculateVaultMetrics,
  formatWeiToDecimal,
} from '@/lib/lagoon-client';

/**
 * Fetch APR from Lagoon Finance
 * Currently using documented APR from https://app.lagoon.finance/vault/1/0x0963b1174a14d5c5a72257406d803c5b470cc00f
 * APR field is not yet available in vaultByAddress query - will update when Lagoon adds it
 */
async function fetchVaultAPR(): Promise<number> {
  // XAU.s documented APR from Lagoon Finance
  // Source: https://app.lagoon.finance/vault/1/0x0963b1174a14d5c5a72257406d803c5b470cc00f#overview
  return 6.07;
}

/**
 * GET /api/vault/lagoon
 * Fetches real-time XAU.s vault data from Lagoon Finance
 * Returns: APY, TVL, share price, exchange rate, all with 6 decimal precision
 */
export async function GET(request: Request) {
  try {
    const [vault, apr] = await Promise.all([
      fetchXAUsVaultData(),
      fetchVaultAPR(),
    ]);

    if (!vault) {
      return NextResponse.json(
        { error: 'Failed to fetch vault data from Lagoon' },
        { status: 500 }
      );
    }

    const metrics = calculateVaultMetrics(vault);

    // Use fetched APR or fallback to 0
    const vaultApr = apr > 0 ? apr : 0;

    console.log('[v0] Vault metrics with APR:', {
      tvl: metrics.tvl,
      sharePrice: metrics.sharePrice,
      exchangeRate: metrics.exchangeRate,
      apr: vaultApr,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        vaultAddress: vault.address,
        vaultName: vault.name,
        vaultSymbol: vault.symbol,
        chainId: vault.chain.id,
        chainName: vault.chain.name,
        assetSymbol: vault.asset.symbol,
        assetDecimals: vault.asset.decimals,
        // Real-time metrics with 6 decimal precision
        tvl: metrics.tvl,
        sharePrice: metrics.sharePrice,
        totalSupply: metrics.totalSupply,
        exchangeRate: metrics.exchangeRate,
        apr: vaultApr,
        // Raw state for advanced calculations
        totalAssetsWei: vault.state.totalAssets,
        totalSupplyWei: vault.state.totalSupply,
        pricePerShareWei: vault.state.pricePerShare,
        managementFee: vault.state.managementFee,
        performanceFee: vault.state.performanceFee,
        timestamp: Date.now(),
      },
    });

    // Cache for 10 seconds (frequent updates for real-time)
    response.headers.set('Cache-Control', 'public, max-age=10, s-maxage=10');

    return response;
  } catch (error) {
    console.error('[v0] API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vault metrics' },
      { status: 500 }
    );
  }
}
