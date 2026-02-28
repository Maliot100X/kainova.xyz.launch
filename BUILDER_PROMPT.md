# KAINOVA - READY-TO-BUILD PROMPT

## FOR CURSOR/WINDSURF/OPENCODE - COPY THIS ENTIRE BLOCK

---

```
# Build KaiNova - AI Agent Token Launch Platform

## PROJECT OVERVIEW

Build an EXACT clone of clawpump.tech with these changes:
- Brand Name: KaiNova (NOT ClawPump)
- Domain: kainova.xyz
- MANDATORY 0.035 SOL launch fee to: Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5
- All other features identical to clawpump.tech
- Social tags: @KaiNovaAI (NOT @clawpumptech)

## TECH STACK

- Frontend: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Next.js API Routes + Prisma ORM
- Database: PostgreSQL (Supabase)
- Blockchain: Solana (@solana/web3.js) + Jupiter Aggregator
- Storage: Cloudflare R2 or AWS S3

## CRITICAL REQUIREMENTS

### 1. MANDATORY LAUNCH FEE (DIFFERENT FROM CLAWPUMP)

Users MUST pay 0.035 SOL before token launch. This is the ONLY difference from ClawPump.

Flow:
1. User uploads image → POST /api/upload
2. User pays 0.035 SOL to Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5
3. User verifies payment → POST /api/launch/verify-fee (sends txHash)
4. Backend verifies on-chain that 0.035 SOL was sent to admin wallet
5. Only then can user launch token → POST /api/launch (must include launchFeeTxHash)

### 2. DATABASE SCHEMA

Create Prisma schema with these tables:
- agents (agent_id, agent_name, wallet_address)
- tokens (mint_address, name, symbol, description, image_url, agent_id, launch_fee_paid, launch_fee_tx_hash)
- earnings (agent_id, mint_address, amount, status)
- launch_fees (agent_id, amount, tx_hash, sender_wallet, status) - CRITICAL for tracking 0.035 SOL
- sniper_subscriptions (subscriber_id, api_key, webhook_url, balance_sol)
- uploads (filename, url, size, mime_type)

### 3. ALL API ENDPOINTS

Implement these endpoints exactly:

POST /api/upload - Upload token image
POST /api/launch/verify-fee - Verify 0.035 SOL payment (CRITICAL)
POST /api/launch - Launch token (requires launchFeeTxHash proving 0.035 SOL paid)
POST /api/launch/self-funded - Self-funded with dev-buy
GET /api/launch/self-funded - Get payment info
GET /api/fees/earnings?agentId=X - Get earnings
PUT /api/fees/wallet - Update wallet address
GET /api/tokens - List tokens
GET /api/tokens/{mint} - Get token
POST /api/tokens/{mint}/verify - Verify token (1 SOL)
POST /api/swap - Jupiter swap
POST /api/agents/arbitrage - Arbitrage scanning
GET /api/domains/search - Domain search
GET /api/domains/check - Domain check
POST /api/sniper/subscribe - Sniper webhook
POST /api/sniper/deposit - Deposit SOL
GET /api/sniper/status - Status
GET /api/launches - Launch history
GET /api/stats - Platform stats
GET /api/leaderboard - Leaderboard
GET /api/health - Health check

### 4. FRONTEND PAGES

Create these pages matching clawpump.tech:
- / (homepage with hero, hot tokens, leaderboard)
- /create (token launch wizard)
- /leaderboard
- /docs
- /agent/[agentId] (dashboard)
- /token/[mintAddress] (token detail)
- /swap
- /domains

### 5. SKILL FILES

Create skill files for AI agents:
- skill.md (main launch skill)
- launch.md (self-funded)
- swap.md
- arbitrage.md
- sniper.md
- domains.md
- social.md

All must reference kainova.xyz and @KaiNovaAI

### 6. SOCIAL AMPLIFICATION

After token launch, return socialAmplification object with:
- twitter.template (with @KaiNovaAI)
- twitter.tweetIntentUrl
- moltbook.template
- nextSteps

## ENVIRONMENT VARIABLES

Create .env.local:
```
DATABASE_URL="postgresql://..."
SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=..."
ADMIN_WALLET_ADDRESS="Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5"
SOLANA_PAYER_SECRET_KEY="[your hot wallet]"
NEXT_PUBLIC_APP_URL="https://kainova.xyz"
NEXT_PUBLIC_LAUNCH_FEE_SOL="0.035"
```

## VERIFICATION STEPS

Before finishing, verify:
1. Token launch REQUIRES 0.035 SOL payment verified on-chain
2. Fee goes to Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5
3. No launch without verified fee
4. All 7 skills work
5. Frontend looks like clawpump.tech
6. Social uses @KaiNovaAI not @clawpumptech

## START BUILDING

Follow the database schema, implement all API endpoints, build frontend pages, create skill files. Test the 0.035 SOL fee flow carefully - it's the critical difference from ClawPump.
```

---

## WHAT YOUR BUILDER NEEDS FROM YOU

1. **Supabase credentials** - Database URL and password
2. **Admin wallet** - The private key for Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5 (or create new)
3. **Hot wallet** - For distributing earnings (different from admin)
4. **Solana RPC** - Helius or QuickNode API key
5. **Cloudflare R2** - Or AWS S3 for image uploads

---

## KEY DIFFERENCES FROM CLAWPUMP (YOUR BUILDER MUST KNOW)

| Feature | ClawPump | KaiNova |
|---------|----------|---------|
| Launch Cost | Free (treasury pays) | **0.035 SOL** (user pays) |
| Fee Recipient | Platform treasury | `Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5` |
| Social Tag | @clawpumptech | @KaiNovaAI |
| Fee Verification | Not needed | **MUST verify on-chain** |

---

## SUCCESS CRITERIA

Your builder should deliver:
- [ ] Working token launch with 0.035 SOL fee
- [ ] On-chain verification of fee payment
- [ ] All API endpoints functional
- [ ] Frontend pages matching clawpump.tech
- [ ] All 7 skill files working
- [ ] Deployed on Vercel
- [ ] No TypeScript/Prisma errors

---

## READY TO GIVE TO BUILDER

Copy the prompt block above and give it to your Cursor/Windsurf/Cline. They have everything they need to build KaiNova.
