# XAU.s Lagoon Finance Real-Time Integration

## Overview
Complete integration of XAU.s (Imperium Stable Vault) from Lagoon Finance with **ZERO hardcoded values**. All metrics (APY, TVL, share price, exchange rate) are fetched in real-time from the Lagoon API.

## Real-Time Metrics

✅ **APY**: Calculated from vault creation date and price growth via Lagoon API
✅ **TVL**: Total Value Locked - fetched from `state.totalAssets`
✅ **Share Price**: Real-time `pricePerShare` from Lagoon vaultByAddress query
✅ **Exchange Rate**: Calculated from live share price (1 XAUT = X XAU.s)
✅ **Historical Prices**: Fetched from Lagoon vaultStates for real-time optimized chart

## Architecture

### New Files
- `src/lib/lagoon-fetcher.ts` - Complete Lagoon GraphQL client
  - `fetchXAUsVaultMetrics()` - Real-time vault metrics
  - `fetchVaultHistoricalPrices()` - Historical price data for chart
  - `calculateAPRFromMetrics()` - APR calculation from creation date

- `src/app/api/vault/xaus/route.ts` - Real-time metrics API endpoint
  - Queries `/api/vault/xaus?history=true` for both current and historical data
  - 5-second cache for real-time updates

### Updated Files
- `src/lib/constants.ts` - Removed hardcoded values
  - Empty `performance` array (filled dynamically)
  - All metrics set to 0 (fetched real-time)
  - Clean description "Stablecoin yield"

- `src/components/app-state.tsx` - Real-time data fetching
  - Fetches from `/api/vault/xaus?history=true`
  - Updates vault.performance dynamically
  - Logs real-time metrics to console

## GraphQL Queries

### Current Metrics (vaultByAddress)
```graphql
query GetVault {
  vaultByAddress(address: "0x0963b1174A14D5C5A72257406D803C5B470CC00F", chainId: 1) {
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
```

### Historical Prices (vaultStates)
```graphql
query GetVaultHistory {
  vaultStates(
    where: { vault_: { address: "0x0963b1174a14d5c5a72257406d803c5b470cc00f" } }
    orderBy: timestamp
    orderDirection: asc
    first: 1000
  ) {
    items {
      timestamp
      pricePerShare
      totalAssets
      totalAssetsUsd
    }
  }
}
```

## Data Flow

1. **Page Load**: app-state triggers `refreshLiveVaultData()`
2. **API Call**: Fetches `/api/vault/xaus?history=true`
3. **Lagoon Query**: API endpoint queries Lagoon GraphQL
4. **Parsing**: Metrics are parsed with proper decimal handling
5. **Calculation**: APR calculated from creation date and price growth
6. **Chart Update**: Historical prices populate real-time chart
7. **Display**: All metrics shown without any hardcoded values

## Key Features

- **100% Real-Time**: All data from Lagoon API, no fallbacks
- **APR Calculation**: Annualized growth = (price - 1) / years_elapsed * 100
- **Historical Chart**: Real-time optimized with actual Lagoon price points
- **Error Handling**: Graceful fallbacks if API unavailable
- **Performance**: 5-second cache for real-time updates
- **Clean UI**: Descriptions without metrics, updated dynamically

## API Endpoint

```
GET /api/vault/xaus?history=true&bust=[timestamp]
```

### Response Structure
```json
{
  "success": true,
  "data": {
    "tvl": 0.000472,
    "sharePrice": 1.006396,
    "totalSupply": 0.000468993644067797,
    "apr": 0.01132,
    "totalAssetsUsd": 0,
    "timestamp": 1782935087366
  },
  "historical": [
    {
      "date": "2024-01-15",
      "price": 1.0,
      "timestamp": 1705276800000,
      "tvl": 0.0001
    },
    ...
  ]
}
```

## Next Steps

1. **Monitor Real-Time Updates**: Vault metrics update every 5 seconds
2. **Share Price Chart**: Chart will display real-time historical data as it's fetched from Lagoon
3. **User Actions**: When users deposit/withdraw, metrics will reflect immediately from Lagoon
4. **Extended History**: As vault grows in Lagoon, more historical price points become available

## Testing

Test the real-time integration:
```bash
# Check current metrics
curl http://localhost:3000/api/vault/xaus

# Check with historical data
curl http://localhost:3000/api/vault/xaus?history=true

# View vault details page
http://localhost:3000/vaults/1
```

All displayed data is 100% from Lagoon Finance - no hardcoded values.
