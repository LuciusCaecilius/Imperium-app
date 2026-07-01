import { NextResponse } from 'next/server';
import { fetchXAUsVaultMetrics } from '@/lib/lagoon-fetcher';

const XAUS_VAULT_ADDRESS = '0x0963b1174a14d5c5a72257406d803c5b470cc00f';

/**
 * GET /api/vault/xaus
 * Returns real-time metrics for XAU.s vault from Lagoon
 * Fetches: TVL, APR, share price, total assets
 */
export async function GET(request: Request) {
  try {
    // Check for cache busting parameter
    const { searchParams } = new URL(request.url);
    const bust = searchParams.get('bust') || Date.now();

    console.log(`[v0 API] Fetching XAU.s metrics (cache bust: ${bust})`);

    const metrics = await fetchXAUsVaultMetrics(XAUS_VAULT_ADDRESS);

    if (!metrics) {
      return NextResponse.json(
        { error: 'Failed to fetch vault metrics' },
        { status: 500 }
      );
    }

    // Return with cache headers to ensure fresh data
    const response = NextResponse.json({
      success: true,
      data: metrics,
    });

    // Cache for 5 seconds only (update frequently for real-time)
    response.headers.set('Cache-Control', 'public, max-age=5, s-maxage=5');

    return response;
  } catch (error) {
    console.error('[v0 API] Error fetching XAU.s metrics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
