import { Address } from 'viem';
import { formatUnits } from 'ethers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const vaultAddress = `0x${address.replace(/^0x/, '')}` as Address;

    // GraphQL query to Lagoon API for vault data
    const graphqlQuery = {
      query: `{
        vaults(where: { address_eq: "${vaultAddress.toLowerCase()}" chainId_eq: 1 } first: 1) {
          items {
            id
            address
            name
            symbol
            decimals
          }
        }
      }`
    };

    // Fetch vault metadata from Lagoon GraphQL API
    const graphqlResponse = await fetch('https://api.lagoon.finance/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphqlQuery),
    });

    const graphqlData = await graphqlResponse.json();
    
    if (!graphqlData.data?.vaults?.items?.[0]) {
      throw new Error('Vault not found in Lagoon API');
    }

    const vaultMetadata = graphqlData.data.vaults.items[0];

    // Use ethers for direct contract calls - direct RPC without network detection
    const { ethers } = await import('ethers');
    
    // Multiple RPC endpoints to try
    const rpcEndpoints = [
      'https://rpc.ankr.com/eth',
      'https://eth-mainnet.public.blastapi.io',
      'https://1rpc.io/eth',
      'https://eth.drpc.org',
    ];

    const STABLE_VAULT_ABI = [
      {
        inputs: [],
        name: 'totalAssets',
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [{ name: 'shares', type: 'uint256' }],
        name: 'convertToAssets',
        outputs: [{ type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ];

    let provider: any = null;
    let lastError: any = null;

    for (const rpcUrl of rpcEndpoints) {
      try {
        provider = new ethers.JsonRpcProvider(rpcUrl);
        const contract = new ethers.Contract(vaultAddress, STABLE_VAULT_ABI, provider);
        
        // Try to fetch data
        const [totalAssetsValue, sharePrice] = await Promise.all([
          contract.totalAssets(),
          contract.convertToAssets(ethers.parseUnits('1', 18)),
        ]);

        const tvl = parseFloat(formatUnits(totalAssetsValue, 18));
        const sharePriceFormatted = parseFloat(formatUnits(sharePrice, 18));

        console.log('[v0] Lagoon vault data fetched:', { vaultAddress, tvl, sharePrice: sharePriceFormatted });

        return Response.json({
          success: true,
          vaultAddress,
          name: vaultMetadata.name,
          symbol: vaultMetadata.symbol,
          decimals: vaultMetadata.decimals,
          tvl,
          sharePrice: sharePriceFormatted,
        });
      } catch (e) {
        lastError = e;
        continue;
      }
    }

    // If all endpoints failed, return error
    throw new Error(`All RPC endpoints failed. Last error: ${lastError?.message}`);
  } catch (error) {
    console.error('[v0] Lagoon vault fetch error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch vault data' },
      { status: 500 }
    );
  }
}
