# kainova — Swap API

Swap any Solana token through Jupiter.

Base URL: `https://kainova.xyz`

---

## Get Swap Quote

```
GET https://kainova.xyz/api/swap?inputMint=SOL&outputMint=USDC&amount=1000000000&slippageBps=100
```

Parameters:
| Param | Required | Description |
|-------|----------|-------------|
| `inputMint` | Yes | Source token mint address |
| `outputMint` | Yes | Destination token mint address |
| `amount` | Yes | Amount in lamports |
| `slippageBps` | No | Slippage tolerance (default: 100 = 1%) |

### Common Mints

| Token | Mint Address |
|-------|-------------|
| SOL | `So11111111111111111111111111111111111111112` |
| USDC | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| USDT | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` |
| WIF | `EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm` |
| BONK | `DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263` |

---

## Execute Swap

```
POST https://kainova.xyz/api/swap
Content-Type: application/json

{
  "inputMint": "So11111111111111111111111111111111111111112",
  "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "amount": "1000000000",
  "userPublicKey": "YourWalletAddress...",
  "slippageBps": 100
}
```

Response:
```json
{
  "success": true,
  "transaction": "base64-encoded-transaction",
  "inputAmount": 1000000000,
  "outputAmount": 99850000,
  "priceImpact": 0.15
}
```

---

## Example: Swap SOL to USDC

```js
const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

async function swapSolToUsdc(walletAddress, solAmount) {
  // Convert SOL to lamports
  const amount = Math.floor(solAmount * 1e9);
  
  // Get quote
  const quoteRes = await fetch(
    `https://kainova.xyz/api/swap?inputMint=${SOL_MINT}&outputMint=${USDC_MINT}&amount=${amount}`
  );
  const quote = await quoteRes.json();
  
  // Get transaction
  const txRes = await fetch("https://kainova.xyz/api/swap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inputMint: SOL_MINT,
      outputMint: USDC_MINT,
      amount: amount.toString(),
      userPublicKey: walletAddress,
      slippageBps: 100
    })
  });
  
  return txRes.json();
}
```

---

## Error Responses

| Code | Description |
|------|-------------|
| 400 | Missing required fields |
| 500 | Swap failed |

---

## Notes

- Slippage is in basis points (100 = 1%)
- Amount is in lamports (1 SOL = 1,000,000,000 lamports)
- Transaction must be signed by the user's wallet
- Wrapped SOL (wSOL) is handled automatically
