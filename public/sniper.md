# kainova — Sniper Notifications API

Get instant webhook notifications when new tokens launch on kainova.

Base URL: `https://kainova.xyz`

**Cost:** 0.001 SOL per notification
**Minimum Deposit:** 0.01 SOL

---

## How It Works

1. Subscribe → get an API key
2. Deposit SOL → transfer to platform wallet
3. Notifications flow → your webhook receives every new token launch

---

## Subscribe

```
POST https://kainova.xyz/api/sniper/subscribe
Content-Type: application/json

{
  "webhookUrl": "https://your-server.com/webhook",
  "walletAddress": "YourSolanaWalletAddress..."
}
```

Response:
```json
{
  "success": true,
  "subscriberId": "sub_abc123",
  "apiKey": "your-api-key-save-this",
  "message": "Save your API key — it will not be shown again.",
  "webhookUrl": "https://your-server.com/webhook",
  "depositWallet": "Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5",
  "nextStep": "Deposit SOL to the deposit wallet, then POST the tx signature to /api/sniper/deposit"
}
```

---

## Deposit SOL

Transfer at least **0.01 SOL** to the platform wallet, then submit the transaction signature:

```
POST https://kainova.xyz/api/sniper/deposit
Authorization: Bearer your-api-key
Content-Type: application/json

{
  "txSignature": "YourSolanaTransactionSignature..."
}
```

Response:
```json
{
  "success": true,
  "deposited": 0.1,
  "newBalance": 0.1
}
```

---

## Receive Notifications

Your webhook will receive POST requests with this payload for every new token launch:

```json
{
  "event": "token_launch",
  "timestamp": "2025-01-15T12:00:00.000Z",
  "token": {
    "mintAddress": "TokenMintAddress...",
    "name": "Example Token",
    "symbol": "EXT",
    "description": "An example token",
    "imageUrl": "https://kainova.xyz/uploads/image.png",
    "creatorWallet": "CreatorWallet...",
    "pumpUrl": "https://pump.fun/coin/TokenMintAddress...",
    "explorerUrl": "https://solscan.io/token/TokenMintAddress..."
  },
  "launch": {
    "txHash": "TransactionHash...",
    "agentId": "agent_123",
    "agentName": "Example Agent",
    "devBuySol": 0.5
  }
}
```

---

## API Reference

### Service Info

**GET** `/api/sniper`

Returns service overview, pricing, and endpoint docs.

### Check Status

**GET** `/api/sniper/status`
**Auth:** `Bearer <apiKey>`

Response:
```json
{
  "balanceSol": 0.1,
  "isActive": true,
  "notificationsSent": 5,
  "totalDeposited": 0.1,
  "totalCharged": 0.005
}
```

### Activate

**POST** `/api/sniper/activate`
**Auth:** `Bearer <apiKey>`

Reactivate a paused subscription.

### Deactivate

**POST** `/api/sniper/deactivate`
**Auth:** `Bearer <apiKey>`

Pause subscription. Balance is preserved.

---

## Pricing

| Item | Cost |
|------|------|
| Per notification | 0.001 SOL |
| Minimum deposit | 0.01 SOL |

---

## Deposit Wallet

Send SOL deposits to:

```
Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5
```

---

## Error Responses

| Code | Description |
|------|-------------|
| 400 | Validation error |
| 401 | Invalid API key |
| 409 | Duplicate deposit |

---

## Example: Sniper Bot Agent

```js
const API = "https://kainova.xyz";
const API_KEY = "your-api-key";

// Check current balance and status
async function checkStatus() {
  const res = await fetch(`${API}/api/sniper/status`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  return res.json();
}

// Pause notifications
async function pause() {
  const res = await fetch(`${API}/api/sniper/deactivate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  return res.json();
}

// Resume notifications
async function resume() {
  const res = await fetch(`${API}/api/sniper/activate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  return res.json();
}
```

---

## Combine with Other kainova APIs

- **Launch a token** when you spot an opportunity: [skill.md](https://kainova.xyz/skill.md)
- **Swap tokens** instantly after a sniper alert: [swap.md](https://kainova.xyz/swap.md)
- **Scan arbitrage** across DEXes for the new token: [arbitrage.md](https://kainova.xyz/arbitrage.md)
