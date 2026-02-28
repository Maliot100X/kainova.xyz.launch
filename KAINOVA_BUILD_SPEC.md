# KAINOVA - Complete Build Specification

## EXECUTIVE SUMMARY

Create a 1:1 clone of clawpump.tech with KaiNova branding. **CRITICAL DIFFERENCE**: Users MUST pay 0.035 SOL launch fee to admin wallet `Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5` before any token launch. All other features identical.

---

## BRAND IDENTITY

| Element | Value |
|---------|-------|
| Brand Name | **KaiNova** |
| Domain | **kainova.xyz** |
| Tagline | "Earn Crypto Revenue for Your AI Agent with KaiNova" |
| Twitter Handle | @KaiNovaAI |
| Admin Wallet | `Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5` |

---

## TECH STACK

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.4.x
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Wallet**: @solana/wallet-adapter-react-ui

### Backend
- **Runtime**: Node.js 20.x LTS
- **Framework**: Next.js API Routes (Route Handlers)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 5.x
- **File Storage**: Cloudflare R2 or AWS S3

### Blockchain
- **Network**: Solana Mainnet-Beta
- **SDK**: @solana/web3.js 1.95.x
- **RPC**: Helius or QuickNode
- **DEX**: Jupiter Aggregator v6
- **Launch**: pump.fun integration

---

## CRITICAL FEE STRUCTURE

### KaiNova Model (DIFFERENT FROM CLAWPUMP)

| Fee Type | Amount | Recipient |
|----------|--------|-----------|
| **Launch Fee (MANDATORY)** | 0.035 SOL | `Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5` |
| Creator Fee (pump.fun) | 1% per trade | Token creator vault |
| Agent Share | 65% of creator fees | Agent wallet |
| Platform Share | 35% of creator fees | KaiNova (not implemented - optional) |

### ClawPump Model (FOR REFERENCE)
- Free launch (treasury pays gas)
- 65% to agent, 35% platform

---

## DATABASE SCHEMA (SUPABASE POSTGRESQL)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id VARCHAR(255) UNIQUE NOT NULL,
  agent_name VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(44) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tokens table
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mint_address VARCHAR(44) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  symbol VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  agent_id VARCHAR(255) REFERENCES agents(agent_id),
  wallet_address VARCHAR(44) NOT NULL,
  launch_fee_paid BOOLEAN DEFAULT FALSE,
  launch_fee_tx_hash VARCHAR(88),
  pump_url TEXT,
  tx_hash VARCHAR(88) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_agent_id (agent_id),
  INDEX idx_mint_address (mint_address)
);

-- Earnings table
CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id VARCHAR(255) REFERENCES agents(agent_id),
  mint_address VARCHAR(44) REFERENCES tokens(mint_address),
  amount DECIMAL(18, 9) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'sent', 'held', 'failed')),
  tx_hash VARCHAR(88),
  created_at TIMESTAMP DEFAULT NOW(),
  distributed_at TIMESTAMP,
  
  INDEX idx_agent_id (agent_id),
  INDEX idx_mint_address (mint_address),
  INDEX idx_status (status)
);

-- Launch fees table (CRITICAL - tracks 0.035 SOL payments)
CREATE TABLE launch_fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id VARCHAR(255) NOT NULL,
  amount DECIMAL(18, 9) DEFAULT 0.035,
  tx_hash VARCHAR(88) UNIQUE NOT NULL,
  sender_wallet VARCHAR(44) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  
  INDEX idx_agent_id (agent_id),
  INDEX idx_tx_hash (tx_hash)
);

-- Sniper subscriptions
CREATE TABLE sniper_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscriber_id VARCHAR(255) UNIQUE NOT NULL,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  webhook_url TEXT NOT NULL,
  wallet_address VARCHAR(44) NOT NULL,
  balance_sol DECIMAL(18, 9) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  notifications_sent INTEGER DEFAULT 0,
  total_deposited DECIMAL(18, 9) DEFAULT 0,
  total_charged DECIMAL(18, 9) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Uploads table
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agents_updated_at
BEFORE UPDATE ON agents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sniper_updated_at
BEFORE UPDATE ON sniper_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## PRISMA SCHEMA (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Agent {
  id            String   @id @default(uuid())
  agentId       String   @unique @map("agent_id")
  agentName     String   @map("agent_name")
  walletAddress String   @map("wallet_address")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  
  tokens        Token[]
  earnings      Earning[]
  launchFees    LaunchFee[]
  
  @@map("agents")
}

model Token {
  id              String    @id @default(uuid())
  mintAddress     String    @unique @map("mint_address")
  name            String
  symbol          String
  description     String
  imageUrl        String   @map("image_url")
  agentId         String   @map("agent_id")
  walletAddress   String   @map("wallet_address")
  launchFeePaid   Boolean  @default(false) @map("launch_fee_paid")
  launchFeeTxHash String?  @map("launch_fee_tx_hash")
  pumpUrl         String?  @map("pump_url")
  txHash          String   @map("tx_hash")
  isVerified      Boolean  @default(false) @map("is_verified")
  createdAt       DateTime @default(now()) @map("created_at")
  
  agent           Agent    @relation(fields: [agentId], references: [agentId])
  earnings        Earning[]
  
  @@index([agentId])
  @@index([mintAddress])
  @@map("tokens")
}

model Earning {
  id              String    @id @default(uuid())
  agentId         String    @map("agent_id")
  mintAddress     String    @map("mint_address")
  amount          Float
  status          String
  txHash          String?   @map("tx_hash")
  createdAt       DateTime  @default(now()) @map("created_at")
  distributedAt   DateTime? @map("distributed_at")
  
  agent           Agent     @relation(fields: [agentId], references: [agentId])
  token           Token     @relation(fields: [mintAddress], references: [mintAddress])
  
  @@index([agentId])
  @@index([mintAddress])
  @@index([status])
  @@map("earnings")
}

model LaunchFee {
  id            String    @id @default(uuid())
  agentId       String    @map("agent_id")
  amount        Float     @default(0.035)
  txHash        String    @unique @map("tx_hash")
  senderWallet  String    @map("sender_wallet")
  status        String
  createdAt     DateTime  @default(now()) @map("created_at")
  confirmedAt   DateTime? @map("confirmed_at")
  
  agent         Agent     @relation(fields: [agentId], references: [agentId])
  
  @@index([agentId])
  @@index([txHash])
  @@map("launch_fees")
}

model SniperSubscription {
  id                String   @id @default(uuid())
  subscriberId      String   @unique @map("subscriber_id")
  apiKey            String   @unique @map("api_key")
  webhookUrl        String   @map("webhook_url")
  walletAddress     String   @map("wallet_address")
  balanceSol        Float    @default(0) @map("balance_sol")
  isActive          Boolean  @default(true) @map("is_active")
  notificationsSent Int      @default(0) @map("notifications_sent")
  totalDeposited    Float    @default(0) @map("total_deposited")
  totalCharged      Float    @default(0) @map("total_charged")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  
  @@map("sniper_subscriptions")
}

model Upload {
  id        String   @id @default(uuid())
  filename  String
  url       String
  size      Int
  mimeType  String   @map("mime_type")
  createdAt DateTime @default(now()) @map("created_at")
  
  @@index([createdAt])
  @@map("uploads")
}
```

---

## API ENDPOINTS (ALL ROUTES)

### Base URL: `https://kainova.xyz/api`

#### 1. Upload Image
```
POST /api/upload
Content-Type: multipart/form-data
Body: image=<file>
```
Response: `{ "success": true, "imageUrl": "https://kainova.xyz/uploads/abc123.png" }`

#### 2. Verify Launch Fee Payment (CRITICAL)
```
POST /api/launch/verify-fee
Content-Type: application/json
{
  "txHash": "...",
  "agentId": "my-agent-123"
}
```
Response: `{ "success": true, "verified": true, "amount": 0.035, "recipient": "Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5", "status": "confirmed" }`

#### 3. Launch Token (MANDATORY FEE)
```
POST /api/launch
Content-Type: application/json
{
  "name": "My Agent Token",
  "symbol": "MAT",
  "description": "A token launched by my AI agent",
  "imageUrl": "https://kainova.xyz/uploads/abc123.png",
  "agentId": "my-agent-123",
  "agentName": "My Agent",
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "launchFeeTxHash": "5VERv8NMvzbJMEkV..."  // REQUIRED - proof of 0.035 SOL
}
```
Response: `{ "success": true, "mintAddress": "...", "txHash": "...", "pumpUrl": "...", "socialAmplification": {...} }`

#### 4. Self-Funded Launch
```
POST /api/launch/self-funded
Content-Type: application/json
{
  "name": "My Token",
  "symbol": "MTK",
  "description": "...",
  "imageUrl": "...",
  "agentId": "...",
  "agentName": "...",
  "walletAddress": "...",
  "txSignature": "...",  // SOL payment proof (0.035+ SOL)
  "devBuySol": 0.5,      // Optional: buy tokens on bonding curve
  "devBuyAmountUsd": 5   // Optional: dynamic dev-buy in USD
}
```

#### 5. Get Payment Info
```
GET /api/launch/self-funded
```
Response: `{ "cost": "0.035 SOL", "platformWallet": "Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5" }`

#### 6. Get Earnings
```
GET /api/fees/earnings?agentId=my-agent-123
```
Response: `{ "agentId": "...", "totalEarned": 1.52, "totalSent": 1.20, "totalPending": 0.32, "tokenBreakdown": [...] }`

#### 7. Update Wallet
```
PUT /api/fees/wallet
{
  "agentId": "...",
  "walletAddress": "...",
  "signature": "...",  // ed25519 signature
  "timestamp": 1234567890
}
```

#### 8. List Tokens
```
GET /api/tokens?sort=new&limit=50&offset=0
```

#### 9. Get Token
```
GET /api/tokens/{mintAddress}
```

#### 10. Verify Token (1 SOL)
```
POST /api/tokens/{mintAddress}/verify
{ "txSignature": "..." }
```

#### 11. Swap Token
```
POST /api/swap
{
  "inputMint": "So11111111111111111111111111111111111111112",
  "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "amount": "1000000000",
  "userPublicKey": "..."
}
```

#### 12. Arbitrage Scan
```
POST /api/agents/arbitrage
{
  "userPublicKey": "...",
  "pairs": [{
    "inputMint": "...",
    "outputMint": "...",
    "amount": "1000000000",
    "strategy": "roundtrip"
  }]
}
```

#### 13. Domain Search
```
GET /api/domains/search?q=myagent&tlds=com,io,ai
```

#### 14. Domain Check
```
GET /api/domains/check?domains=myagent.dev,myagent.xyz
```

#### 15. Sniper Subscribe
```
POST /api/sniper/subscribe
{
  "webhookUrl": "https://...",
  "walletAddress": "..."
}
```

#### 16. Sniper Deposit
```
POST /api/sniper/deposit
Authorization: Bearer <apiKey>
{ "txSignature": "..." }
```

#### 17. Sniper Status
```
GET /api/sniper/status
Authorization: Bearer <apiKey>
```

#### 18. Launch History
```
GET /api/launches?agentId=my-agent&limit=20&offset=0
```

#### 19. Stats
```
GET /api/stats
```
Response: `{ "totalTokens": 142, "totalMarketCap": 2500000, "totalVolume24h": 85000, "totalLaunches": 156 }`

#### 20. Leaderboard
```
GET /api/leaderboard?limit=10
```

#### 21. Treasury
```
GET /api/treasury
```

#### 22. Health
```
GET /api/health
```

---

## FRONTEND PAGES

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, features, hot tokens, leaderboard |
| `/create` | Token launch wizard with fee payment |
| `/leaderboard` | Top agents by earnings |
| `/docs` | Complete API documentation |
| `/tokenomics` | Platform tokenomics (optional) |
| `/agent/[agentId]` | Agent dashboard with tokens & earnings |
| `/token/[mintAddress]` | Token detail with DexScreener chart |
| `/swap` | Jupiter swap interface |
| `/domains` | Domain search interface |
| `/profile` | User profile (optional) |

---

## SKILL FILES (FOR AI AGENTS)

### 1. skill.md - Token Launch
```markdown
# kainova — Earn Crypto Revenue for Your AI Agent

Launch a token on Solana in 3 API calls. Earn 65% of every trading fee.

**CRITICAL:** Users MUST pay 0.035 SOL launch fee to: `Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5`

Base URL: `https://kainova.xyz`

Quick Start:
1. POST /api/upload (image)
2. POST /api/launch/verify-fee (verify 0.035 SOL paid)
3. POST /api/launch (with launchFeeTxHash)

Social tags: @KaiNovaAI
```

### 2. launch.md - Self-Funded Launch
```markdown
# kainova — Self-Funded Token Launch

Pay 0.035+ SOL to launch instantly. Supports dev-buy.

Base URL: `https://kainova.xyz`
Admin Wallet: `Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5`
```

### 3. swap.md - Jupiter Swap
```markdown
# kainova — Swap API

Swap any Solana token through Jupiter.

Base URL: `https://kainova.xyz/api/swap`
```

### 4. arbitrage.md - Arbitrage Intelligence
```markdown
# kainova — Arbitrage Intelligence API

Scan cross-DEX price differences. Get ready-to-sign tx bundles.

Base URL: `https://kainova.xyz/api/agents/arbitrage`
Platform Fee: 5% of net profit
```

### 5. sniper.md - Sniper Alerts
```markdown
# kainova — Sniper Notifications

Webhook alerts for new token launches.

Cost: 0.001 SOL per notification
Base URL: `https://kainova.xyz/api/sniper`
```

### 6. domains.md - Domain Search
```markdown
# kainova — Domain Search API

Search & check domain availability.

Base URL: `https://kainova.xyz/api/domains`
Fee: Conway price + 10%
```

### 7. social.md - Social Amplification
```markdown
# kainova — Social Amplification

Get discovered by @KaiNovaAI on Twitter and Moltbook.

Template tags: @KaiNovaAI (not @clawpumptech)
```

---

## ENVIRONMENT VARIABLES (.env.local)

```bash
# ========================
# DATABASE (SUPABASE)
# ========================
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"

# ========================
# REDIS (UPSTASH) - Optional
# ========================
REDIS_URL="redis://default:[PASSWORD]@[HOST].upstash.io:6379"

# ========================
# SOLANA
# ========================
SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=[YOUR-KEY]"
SOLANA_NETWORK="mainnet-beta"

# CRITICAL: Your admin wallet for launch fees
ADMIN_WALLET_ADDRESS="Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5"

# Hot wallet for fee distributions (KEEP SECRET!)
SOLANA_PAYER_SECRET_KEY="[1,2,3,4,5,...]"

# ========================
# FILE STORAGE (R2 or S3)
# ========================
# Option 1: Cloudflare R2
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="kainova-uploads"
R2_PUBLIC_URL="https://uploads.kainova.xyz"

# Option 2: AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="kainova-uploads"
AWS_REGION="us-east-1"

# ========================
# APIS
# ========================
JUPITER_API_URL="https://quote-api.jup.ag/v6"
PUMPFUN_API_URL="https://pump.fun/api"

# ========================
# APP CONFIG
# ========================
NEXT_PUBLIC_APP_URL="https://kainova.xyz"
NEXT_PUBLIC_LAUNCH_FEE_SOL="0.035"
```

---

## CRITICAL IMPLEMENTATION: FEE VERIFICATION

```typescript
// lib/solana/verifyLaunchFee.ts

import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const ADMIN_WALLET = 'Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5';
const REQUIRED_FEE_SOL = 0.035;
const FEE_TOLERANCE = 0.0001;

export async function verifyLaunchFee(
  txHash: string,
  connection: Connection
): Promise<{
  verified: boolean;
  amount: number;
  sender: string;
  timestamp: number;
}> {
  try {
    const tx = await connection.getTransaction(txHash, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!tx || !tx.meta) {
      return { verified: false, amount: 0, sender: '', timestamp: 0 };
    }

    const accountKeys = tx.transaction.message.staticAccountKeys || [];
    const adminIndex = accountKeys.findIndex(
      (key) => key.toBase58() === ADMIN_WALLET
    );

    if (adminIndex === -1) {
      return { verified: false, amount: 0, sender: '', timestamp: 0 };
    }

    const preBalance = tx.meta.preBalances[adminIndex];
    const postBalance = tx.meta.postBalances[adminIndex];
    const amountReceived = (postBalance - preBalance) / LAMPORTS_PER_SOL;

    const verified = Math.abs(amountReceived - REQUIRED_FEE_SOL) < FEE_TOLERANCE;

    const senderIndex = accountKeys.findIndex(
      (key, idx) => idx !== adminIndex && tx.meta!.preBalances[idx] > tx.meta!.postBalances[idx]
    );
    const sender = senderIndex !== -1 ? accountKeys[senderIndex].toBase58() : '';

    return {
      verified,
      amount: amountReceived,
      sender,
      timestamp: tx.blockTime || 0,
    };
  } catch (error) {
    console.error('Fee verification error:', error);
    return { verified: false, amount: 0, sender: '', timestamp: 0 };
  }
}
```

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Register domain kainova.xyz
- [ ] Set up Supabase project
- [ ] Run database migrations
- [ ] Configure Cloudflare R2 bucket
- [ ] Get Solana RPC API key (Helius/QuickNode)
- [ ] Create admin wallet (or use provided)
- [ ] Set up hot wallet for distributions

### Vercel Deployment
- [ ] Connect GitHub repo to Vercel
- [ ] Add all environment variables
- [ ] Deploy production build
- [ ] Verify domain SSL

### Post-Deployment
- [ ] Test token launch flow end-to-end
- [ ] Verify 0.035 SOL fee collection
- [ ] Test earnings API
- [ ] Test swap API
- [ ] Monitor error logs

---

## VERIFICATION CHECKLIST FOR BUILDER

Before declaring completion, verify:

- [ ] Token launch requires 0.035 SOL fee payment
- [ ] Fee goes to Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5
- [ ] On-chain verification before launch
- [ ] All 7 API skills functional
- [ ] Frontend pages match clawpump.tech layout
- [ ] Social templates use @KaiNovaAI (not @clawpumptech)
- [ ] Supabase database working
- [ ] No TypeScript errors
- [ ] No Prisma errors
- [ ] Vercel deployment successful

---

## MODEL RECOMMENDATION

**Use: Claude 3.5 Sonnet** in Cursor/Windsurf for best results with this complex full-stack blockchain project.

---

## TIME ESTIMATE

- Solo developer: 6-8 weeks
- Small team (2-3): 4-5 weeks
- Experienced team: 3-4 weeks

---

## REVENUE PROJECTIONS

| Launches/Day | Daily Revenue (SOL) | Monthly Revenue (SOL) |
|--------------|--------------------|----------------------|
| 10 | 0.35 | 10.5 |
| 50 | 1.75 | 52.5 |
| 100 | 3.5 | 105 |
| 500 | 17.5 | 525 |

At $100/SOL: 100 launches/day = $10,500/month

---

## WHAT TO PROVIDE TO YOUR BUILDER

1. This specification document
2. Supabase project credentials
3. Admin wallet private key (for fee collection)
4. Hot wallet private key (for distributions)
5. Solana RPC API key
6. Cloudflare R2 credentials (or AWS S3)
7. GitHub repository access

---

## LEGAL DISCLAIMER TO ADD

> IMPORTANT: KaiNova is a software tool for launching tokens on Solana. We do not provide financial advice. Token launches carry risk. Users are responsible for compliance with local regulations. The 0.035 SOL launch fee is non-refundable. Earnings depend on trading activity and are not guaranteed.
