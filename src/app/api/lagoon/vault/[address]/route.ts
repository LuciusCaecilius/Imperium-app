import { fetchLagoonVaultData } from '@/lib/lagoon';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const vaultAddress = `0x${address.replace(/^0x/, '')}`;

    console.log('[v0] API route fetching Lagoon data for:', vaultAddress);

    const vaultData = await fetchLagoonVaultData(vaultAddress);

    if (!vaultData) {
      return Response.json(
        { error: 'Failed to fetch vault data from Lagoon' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      ...vaultData,
    });
  } catch (error) {
    console.error('[v0] Lagoon API route error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch vault data' },
      { status: 500 }
    );
  }
}
