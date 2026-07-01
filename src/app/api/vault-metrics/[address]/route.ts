import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const RPC_ENDPOINTS = [
  'https://eth.drpc.org',
  'https://eth-mainnet.public.blastapi.io',
  'https://rpc.ankr.com/eth',
  'https://1rpc.io/eth',
];

// Standard ERC4626 vault ABI
const VAULT_ABI = [
  {
    inputs: [],
    name: 'totalAssets',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
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
  {
    inputs: [],
    name: 'asset',
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
];

async function getProvider() {
  for (const rpcUrl of RPC_ENDPOINTS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      await provider.getBlockNumber();
      return provider;
    } catch (e) {
      continue;
    }
  }
  throw new Error('No working RPC endpoints');
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const vaultAddress = ethers.getAddress(address);

    console.log('[v0 API] Fetching metrics for vault:', vaultAddress);

    const provider = await getProvider();
    const contract = new ethers.Contract(vaultAddress, VAULT_ABI, provider);

    // Fetch on-chain data in parallel
    const [totalAssets, totalSupply, pricePerShareBN] = await Promise.all([
      contract.totalAssets(),
      contract.totalSupply(),
      contract.convertToAssets(ethers.parseUnits('1', 18)),
    ]);

    const tvl = parseFloat(ethers.formatUnits(totalAssets, 18));
    const supply = parseFloat(ethers.formatUnits(totalSupply, 18));
    const pricePerShare = parseFloat(ethers.formatUnits(pricePerShareBN, 18));

    console.log('[v0 API] Vault metrics fetched:', { tvl, supply, pricePerShare });

    return NextResponse.json({
      success: true,
      vaultAddress,
      tvl,
      totalSupply: supply,
      pricePerShare,
      // APR will be fetched from Lagoon GraphQL separately or hardcoded for XAU.s
      apr: null,
    });
  } catch (error) {
    console.error('[v0 API] Error fetching vault metrics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
