# kainova — Domain Search & Registration API

Search, check availability, and register domains for your AI agent.

Base URL: `https://kainova.xyz`

**Fee:** Conway price + 10% service fee

---

## How It Works

1. Search domains by keyword → get available options with prices
2. Check exact domain availability → confirm before registering
3. Get TLD pricing → compare costs across extensions
4. Register a domain (Phase 2) → pay in SOL

---

## Search Domains

```
GET https://kainova.xyz/api/domains/search?q=myagent&tlds=com,io,ai
```

Parameters:
| Param | Required | Description |
|-------|----------|-------------|
| `q` | Yes | Search keyword (1-63 chars) |
| `tlds` | No | Comma-separated TLDs (default: com,io,ai,dev,xyz,net,org) |

Response:
```json
{
  "query": "myagent",
  "results": [
    {
      "domain": "myagent.com",
      "available": false
    },
    {
      "domain": "myagent.io",
      "available": true,
      "price": 32.99,
      "pricing": {
        "conwayPrice": 32.99,
        "kainovaFee": 3.30,
        "totalPrice": 36.29,
        "feePercent": 10
      }
    },
    {
      "domain": "myagent.ai",
      "available": true,
      "price": 54.99,
      "pricing": {
        "conwayPrice": 54.99,
        "kainovaFee": 5.50,
        "totalPrice": 60.49,
        "feePercent": 10
      }
    }
  ],
  "source": "conway",
  "timestamp": 1739700000000
}
```

---

## Check Exact Availability

```
GET https://kainova.xyz/api/domains/check?domains=myagent.dev,myagent.xyz
```

Parameters:
| Param | Required | Description |
|-------|----------|-------------|
| `domains` | Yes | Comma-separated full domain names (max 20) |

Response:
```json
{
  "domains": ["myagent.dev", "myagent.xyz"],
  "results": [
    {
      "domain": "myagent.dev",
      "available": true,
      "price": 12.99,
      "pricing": {
        "conwayPrice": 12.99,
        "kainovaFee": 1.30,
        "totalPrice": 14.29,
        "feePercent": 10
      }
    },
    {
      "domain": "myagent.xyz",
      "available": true,
      "price": 1.99,
      "pricing": {
        "conwayPrice": 1.99,
        "kainovaFee": 0.20,
        "totalPrice": 2.19,
        "feePercent": 10
      }
    }
  ],
  "source": "conway",
  "timestamp": 1739700000000
}
```

---

## Get TLD Pricing

```
GET https://kainova.xyz/api/domains/pricing?tlds=com,io,dev,ai
```

Response:
```json
{
  "pricing": [
    {
      "tld": "com",
      "register": {
        "conwayPrice": 11.07,
        "kainovaFee": 1.11,
        "totalPrice": 12.18,
        "feePercent": 10
      },
      "renew": {
        "conwayPrice": 12.99,
        "kainovaFee": 1.30,
        "totalPrice": 14.29,
        "feePercent": 10
      },
      "currency": "USD"
    }
  ],
  "feePercent": 10,
  "note": "Prices include a 10% kainova service fee. Registration available in Phase 2."
}
```

---

## Default TLDs

| TLD | Typical Price Range |
|-----|-------------------|
| `.com` | $11-13 |
| `.io` | $30-35 |
| `.ai` | $50-60 |
| `.dev` | $12-15 |
| `.xyz` | $1-3 |
| `.net` | $12-15 |
| `.org` | $10-13 |

---

## Fee Structure

| Operation | Cost |
|-----------|------|
| Search | Free |
| Check availability | Free |
| Pricing lookup | Free |
| Registration (Phase 2) | Conway price + 10% kainova fee |

**Example:** Register `myagent.com` at Conway price $11.07 → kainova fee $1.11 → Total $12.18 (paid as equivalent SOL).

---

## Rate Limits

- **30 requests per minute** per `agentId` or IP address
- Applies to `/api/domains/search` and `/api/domains/check`
- `/api/domains/pricing` and `/api/domains/capabilities` are not rate limited

---

## Error Responses

| Code | Description |
|------|-------------|
| 400 | Validation error |
| 429 | Rate limit exceeded |
| 500 | Upstream error |

---

## Example: Domain Scout Agent

```js
const API = "https://kainova.xyz";

async function findDomain(keyword) {
  const res = await fetch(
    `${API}/api/domains/search?q=${keyword}&tlds=com,io,ai,dev,xyz`
  );
  const data = await res.json();

  const available = data.results
    .filter(r => r.available && r.pricing)
    .sort((a, b) => a.pricing.totalPrice - b.pricing.totalPrice);

  if (available.length > 0) {
    const best = available[0];
    console.log(`Best option: ${best.domain} at $${best.pricing.totalPrice}/yr`);
  }

  return available;
}

async function checkExact(domains) {
  const res = await fetch(
    `${API}/api/domains/check?domains=${domains.join(",")}`
  );
  return (await res.json()).results;
}
```

---

## Combine with Other kainova APIs

- **Launch a token** for your agent with a matching domain: [skill.md](https://kainova.xyz/skill.md)
- **Swap tokens** to convert SOL for domain registration: [swap.md](https://kainova.xyz/swap.md)
- **Scan arbitrage** opportunities while your domain propagates: [arbitrage.md](https://kainova.xyz/arbitrage.md)
