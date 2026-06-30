import { formatUnits, Contract, JsonRpcProvider } from 'ethers';

export interface LagoonVaultData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  tvl: number;
  sharePrice: number;
  totalAssets: string;
  apr: number | null;
}

// Simple ABI for vault contract functions
const VAULT_ABI = [
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

/**
 * Fetch real-time vault data by directly calling the contract
 */
export async function fetchLagoonVaultData(vaultAddress: string): Promise<LagoonVaultData | null> {
  try {
    const normalizedAddress = vaultAddress.toLowerCase();
    console.log('[v0] Fetching vault data for:', normalizedAddress);

    // RPC endpoints to try
    const rpcEndpoints = [
      'https://eth-mainnet.public.blastapi.io',
      'https://eth.drpc.org',
      'https://rpc.ankr.com/eth',
    ];

    let provider: JsonRpcProvider | null = null;

    // Find a working RPC endpoint
    for (const rpcUrl of rpcEndpoints) {
      try {
        const testProvider = new JsonRpcProvider(rpcUrl);
        // Quick test by calling a view function
        const contract = new Contract(normalizedAddress, VAULT_ABI, testProvider);
        await contract.totalAssets();
        provider = testProvider;
        console.log('[v0] Connected to RPC:', rpcUrl);
        break;
      } catch (e) {
        continue;
      }
    }

    if (!provider) {
      throw new Error('No working RPC endpoint available');
    }

    const contract = new Contract(normalizedAddress, VAULT_ABI, provider);

    // Fetch live data from contract
    const [totalAssets, convertToAssets] = await Promise.all([
      contract.totalAssets(),
      contract.convertToAssets(BigInt('1000000000000000000')), // 1 share = 10^18
    ]);

    const tvl = parseFloat(formatUnits(totalAssets, 18));
    const sharePrice = parseFloat(formatUnits(convertToAssets, 18));

    console.log('[v0] Vault data fetched:', { tvl, sharePrice });

    return {
      address: normalizedAddress,
      name: 'Vault',
      symbol: 'VAULT',
      decimals: 18,
      tvl,
      sharePrice,
      totalAssets: totalAssets.toString(),
      apr: null,
    };
  } catch (error) {
    console.error('[v0] Lagoon fetch failed:', error);
    return null;
  }
}
