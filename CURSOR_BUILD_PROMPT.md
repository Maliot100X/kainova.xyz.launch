# KAINOVA - COMPLETE BUILD PROMPT FOR CURSOR/WINDSURF

**Copy this entire block and paste into Cursor/Windsurf/Cline**

---

```
You are building KaiNova - an AI Agent token launch platform on Solana.

## MISSION
Build an EXACT clone of clawpump.tech with ONE critical difference: users MUST pay 0.035 SOL launch fee to admin wallet `Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5`.

## BRAND IDENTITY
- Name: KaiNova
- Domain: kainova.xyz  
- Twitter: @KaiNovaAI
- Admin Wallet: Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5
- Launch Fee: 0.035 SOL (MANDATORY - this is the ONLY difference from ClawPump)

## TECH STACK
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Prisma ORM
- PostgreSQL (Supabase)
- @solana/web3.js
- Jupiter Aggregator API

## DATABASE SCHEMA (Prisma)
```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

model Agent {
  id String @id @default(uuid())
  agentId String @unique
  agentName String
  walletAddress String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tokens Token[]
  earnings Earning[]
  launchFees LaunchFee[]
}

model Token {
  id String @id @default(uuid())
  mintAddress String @unique
  name String
  symbol String
  description String
  imageUrl String
  agentId String
  walletAddress String
  launchFeePaid Boolean @default(false)
  launchFeeTxHash String?
  pumpUrl String?
  txHash String
  isVerified Boolean @default(false)
  createdAt DateTime @default(now())
  agent Agent @relation(fields: [agentId], references: [agentId])
  earnings Earning[]
}

model Earning {
  id String @id @default(uuid())
  agentId String
  mintAddress String
  amount Float
  status String
  txHash String?
  createdAt DateTime @default(now())
  distributedAt DateTime?
  agent Agent @relation(fields: [agentId], references: [agentId])
  token Token @relation(fields: [mintAddress], references: [mintAddress])
}

model LaunchFee {
  id String @id @default(uuid())
  agentId String
  amount Float @default(0.035)
  txHash String @unique
  senderWallet String
  status String
  createdAt DateTime @default(now())
  confirmedAt DateTime?
  agent Agent @relation(fields: [agentId], references: [agentId])
}

model SniperSubscription {
  id String @id @default(uuid())
  subscriberId String @unique
  apiKey String @unique
  webhookUrl String
  walletAddress String
  balanceSol Float @default(0)
  isActive Boolean @default(true)
  notificationsSent Int @default(0)
  totalDeposited Float @default(0)
  totalCharged Float @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Upload {
  id String @id @default(uuid())
  filename String
  url String
  size Int
  mimeType String
  createdAt DateTime @default(now())
}
```

## CRITICAL: FEE VERIFICATION SYSTEM

This is the ONLY difference from ClawPump. Implement this flow:

1. User uploads image → POST /api/upload
2. User pays 0.035 SOL to Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5
3. User calls POST /api/launch/verify-fee with txHash
4. Backend verifies on-chain that 0.035 SOL was sent to admin wallet
5. ONLY then can user launch → POST /api/launch (MUST include launchFeeTxHash)

```typescript
// Fee verification logic
const ADMIN_WALLET = 'Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5';
const REQUIRED_FEE_SOL = 0.035;

async function verifyLaunchFee(txHash: string, connection: Connection) {
  const tx = await connection.getTransaction(txHash, { commitment: 'confirmed' });
  if (!tx || !tx.meta) return { verified: false };
  
  const accountKeys = tx.transaction.message.staticAccountKeys;
  const adminIndex = accountKeys.findIndex(k => k.toBase58() === ADMIN_WALLET);
  if (adminIndex === -1) return { verified: false };
  
  const amountReceived = (tx.meta.postBalances[adminIndex] - tx.meta.preBalances[adminIndex]) / 1e9;
  const verified = Math.abs(amountReceived - REQUIRED_FEE_SOL) < 0.0001;
  
  return { verified, amount: amountReceived };
}
```

## ALL API ENDPOINTS TO IMPLEMENT

POST /api/upload - Upload image (multipart)
POST /api/launch/verify-fee - Verify 0.035 SOL payment
POST /api/launch - Launch token (requires launchFeeTxHash)
POST /api/launch/self-funded - Self-funded with dev-buy
GET /api/launch/self-funded - Payment info
GET /api/fees/earnings?agentId=X
PUT /api/fees/wallet
GET /api/tokens?sort=new&limit=50
GET /api/tokens/{mintAddress}
POST /api/tokens/{mintAddress}/verify
POST /api/swap
POST /api/agents/arbitrage
GET /api/domains/search?q=X&tlds=com,io
GET /api/domains/check?domains=X
POST /api/sniper/subscribe
POST /api/sniper/deposit
GET /api/sniper/status
GET /api/launches?agentId=X
GET /api/stats
GET /api/leaderboard
GET /api/health

## FRONTEND PAGES

/ - Homepage with hero, hot tokens, leaderboard
/create - Token launch wizard
/leaderboard - Top agents
/docs - API docs
/agent/[agentId] - Agent dashboard
/token/[mintAddress] - Token detail
/swap - Jupiter swap
/domains - Domain search

## SKILL FILES

Create these files (all reference @KaiNovaAI NOT @clawpumptech):

skill.md, launch.md, swap.md, arbitrage.md, sniper.md, domains.md, social.md

## ENVIRONMENT VARIABLES
```
DATABASE_URL="postgresql://..."
SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=..."
ADMIN_WALLET_ADDRESS="Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5"
NEXT_PUBLIC_APP_URL="https://kainova.xyz"
NEXT_PUBLIC_LAUNCH_FEE_SOL="0.035"
```

## START

1. Initialize Next.js project with TypeScript
2. Set up Prisma with PostgreSQL
3. Implement fee verification system (CRITICAL)
4. Build all API endpoints
5. Create frontend pages
6. Deploy to Vercel

The 0.035 SOL mandatory fee is the ONLY difference from ClawPump. Everything else should work exactly the same.
```
