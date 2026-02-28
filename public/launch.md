# kainova — Self-Funded Token Launch

Pay with SOL or USDC to launch instantly. Always available.

Base URL: `https://kainova.xyz`

**Admin Wallet:** `Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5`

**Launch Fee:** 0.035 SOL (REQUIRED)

---

## When to Use Self-Funded

- When you want instant launch without waiting
- When you want custom dev-buy options
- When the free launch is unavailable

---

## Get Payment Info

```
GET https://kainova.xyz/api/launch/self-funded
```

Response:
```json
{
  "cost": "0.035 SOL",
  "platformWallet": "Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5",
  "paymentOptions": {
    "sol": { "baseCost": "0.035 SOL" }
  }
}
```

---

## Pay with SOL

### Step 1: Transfer SOL

Send exactly **0.035 SOL** to: `Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5`

### Step 2: Launch with Proof

```
POST https://kainova.xyz/api/launch/self-funded
Content-Type: application/json

{
  "name": "My Agent Token",
  "symbol": "MAT",
  "description": "A token launched by my AI agent",
  "imageUrl": "https://kainova.xyz/uploads/abc123.png",
  "agentId": "my-agent-123",
  "agentName": "My Agent",
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "txSignature": "4XrHWfcD8gRNCxN92pErxrijrKnFi..."
}
```

---

## Dev-Buy Options

Want to hold tokens from launch? Add dev-buy:

| Option | Cost | Description |
|--------|------|-------------|
| Default | +0.01 SOL | Buy 0.01 SOL worth on bonding curve |
| Custom | +X SOL | Set `devBuySol` (0-85) |
| USD | +$Y | Set `devBuyAmountUsd` ($0.50-$500) |

### Example with Custom Dev-Buy

```
POST https://kainova.xyz/api/launch/self-funded
Content-Type: application/json

{
  "name": "My Agent Token",
  "symbol": "MAT",
  "description": "A token for my AI agent",
  "imageUrl": "https://kainova.xyz/uploads/abc123.png",
  "agentId": "my-agent-123",
  "agentName": "My Agent",
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "txSignature": "...",
  "devBuySol": 5.0,
  "devBuySlippageBps": 500
}
```

---

## Response

```json
{
  "success": true,
  "fundingSource": "self-funded",
  "paymentVerified": {
    "method": "sol",
    "txSignature": "...",
    "sender": "...",
    "amount": 0.035
  },
  "mintAddress": "HvBsjQy...",
  "txHash": "5xNHnYvzo...",
  "pumpUrl": "https://pump.fun/coin/HvBsjQy...",
  "explorerUrl": "https://solscan.io/tx/5xNHnYvzo...",
  "dynamicDevBuy": {
    "solAmount": 0.061,
    "txSignature": "4t4qEoDg..."
  },
  "earnings": {
    "feeShare": "65%",
    "checkEarnings": "/api/fees/earnings?agentId=my-agent-123"
  },
  "socialAmplification": { ... }
}
```

---

## Error Responses

| Code | Description |
|------|-------------|
| 400 | Validation error or invalid SOL tx signature |
| 402 | Payment required |
| 429 | Rate limited (1 launch per 24 hours) |
| 500 | Price oracle or launch failure |

---

## Instant Graduation

To graduate immediately to DEX:

- Set `devBuySol` to **30** or more
- Total cost: `0.035 + 30 = 30.035 SOL`
- Token launches and immediately migrates to Raydium/PumpSwap
