import { NextResponse } from 'next/server';
import { fetchXAUsVaultMetrics, fetchVaultHistoricalPrices } from '@/lib/lagoon-fetcher';

const XAUS_ADDRESS = '0x0963b1174A14D5C5A72257406D803C5B470CC00F';

/**
 * GET /api/vault/xaus
 * Returns 100% real-time metrics for XAU.s vault directly from Lagoon API
 * Fetches: TVL, APR, share price, and all state data - ZERO hardcoded values
 * Query params: ?history=true to include historical price data for chart
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('history') === 'true';

    console.log('[v0 API] Fetching XAU.s real-time metrics from Lagoon API...');

    // Fetch current metrics from Lagoon - ALL data is real-time
    const metrics = await fetchXAUsVaultMetrics(XAUS_ADDRESS);

    if (!metrics) {
      return NextResponse.json(
        { error: 'Failed to fetch vault metrics from Lagoon' },
        { status: 500 }
      );
    }

    // Serialize metrics with proper precision to avoid scientific notation
    const serializedData = {
      tvl: parseFloat(metrics.tvl.toFixed(8)),
      sharePrice: parseFloat(metrics.sharePrice.toFixed(8)),
      totalSupply: parseFloat(metrics.totalSupply.toFixed(8)),
      apr: parseFloat(metrics.apr.toFixed(6)),
      totalAssetsUsd: parseFloat(metrics.totalAssetsUsd.toFixed(2)),
      timestamp: metrics.timestamp,
    };

    const responseData: any = {
      success: true,
      data: serializedData,
    };

    // Optionally include historical data for real-time optimized chart
    if (includeHistory) {
      const historical = await fetchVaultHistoricalPrices(XAUS_ADDRESS);
      responseData.historical = historical.map((h: any) => ({
        date: h.date,
        price: parseFloat(h.price.toFixed(8)),
        timestamp: h.timestamp,
        tvl: h.tvl ? parseFloat(h.tvl.toFixed(8)) : undefined,
      }));
    }

    // Return with cache headers - 5 second cache for real-time updates
    const response = NextResponse.json(responseData);
    response.headers.set('Cache-Control', 'public, max-age=5, s-maxage=5');

    return response;
  } catch (error) {
    console.error('[v0 API] Error fetching XAU.s metrics from Lagoon:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch XAU.s metrics' },
      { status: 500 }
    );
  }
}
