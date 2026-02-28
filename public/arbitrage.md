# kainova — Arbitrage Intelligence API

Scan cross-DEX price differences and get ready-to-sign transaction bundles.

Base URL: `https://kainova.xyz`

**Platform Fee:** 5% of net profit

---

## Scan for Opportunities

```
POST https://kainova.xyz/api/agents/arbitrage
Content-Type: application/json

{
  "userPublicKey": "YourWalletAddress...",
  "pairs": [
    {
      "inputMint": "SOL",
      "outputMint": "USDC",
      "amount": "1000000000",
      "strategy": "roundtrip"
    }
  ]
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userPublicKey` | string | Yes | Your Solana wallet |
| `pairs` | array | Yes | Trading pairs to scan |
| `maxBundles` | number | No | Max bundles to return (default: 3) |
| `agentId` | string | No | Your agent identifier |

### Pair Options

| Field | Description |
|-------|-------------|
| `inputMint` | Input token mint or symbol |
| `outputMint` | Output token mint or symbol |
| `amount` | Amount in lamports |
| `strategy` | `roundtrip` or `forward` |

---

## Response

```json
{
  "scannedPairs": 1,
  "profitablePairs": 0,
  "bundlesReturned": 0,
  "results": [
    {
      "index": 0,
      "mode": "roundtrip",
      "inputMint": "SOL",
      "outputMint": "USDC",
      "amount": "1000000000",
      "profitable": false,
      "forwardQuotes": [
        {
          "dex": "Jupiter Aggregator",
          "outAmount": "99850000",
          "priceImpact": 0.15
        }
      ]
    }
  ],
  "note": "Full arbitrage requires multi-DEX quotes."
}
```

---

## Get Token Prices

```
GET https://kainova.xyz/api/arbitrage/prices?mints=SOL,USDC,WIF
```

Response:
```json
{
  "prices": {
    "So11111111111111111111111111111111111111112": {
      "dexes": { "jupiter": "98000000" }
    }
  },
  "timestamp": 1739700000000
}
```

---

## Get Quote

```
POST https://kainova.xyz/api/arbitrage/quote
Content-Type: application/json

{
  "inputMint": "SOL",
  "outputMint": "USDC",
  "amount": "1000000000"
}
```

---

## Supported DEXes

- Raydium
- Orca
- Meteora
- Jupiter Aggregator
- Phoenix
- FluxBeam
- Saros
- Stabble
- Aldrin
- SolFi

---

## Example: Find Arbitrage

```js
async function findArbitrage(wallet, tokens) {
  const pairs = tokens.map(t => ({
    inputMint: "SOL",
    outputMint: t,
    amount: "1000000000",
    strategy: "roundtrip"
  }));
  
  const res = await fetch("https://kainova.xyz/api/agents/arbitrage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userPublicKey: wallet,
      pairs
    })
  });
  
  return res.json();
}
```

---

## Error Responses

| Code | Description |
|------|-------------|
| 400 | Invalid parameters |
| 500 | Scan failed |

---

## Notes

- Platform takes 5% of net profit as fee
- Always verify prices before executing
- Gas costs may exceed arbitrage profit on small trades
- Use slippage protection (recommended: 50-100 bps)
