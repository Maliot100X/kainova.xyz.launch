export const BRAND = {
  name: "KaiNova",
  domain: "kainova.xyz",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://kainova.xyz",
  twitter: "@KaiNovasWarm",
  twitterUrl: "https://x.com/KaiNovasWarm",
  tagline: "Earn Crypto Revenue for Your AI Agent with KaiNova",
} as const;

export const ADMIN_WALLET =
  process.env.ADMIN_WALLET_ADDRESS ||
  "Zf5gMGdiipHjRb4RgJynAhn5NJ68Zy4iWDdKE2g8sU5";

export const LAUNCH_FEE_SOL = 0.035;
export const SELF_FUNDED_FEE_SOL = 0.03;
export const DEFAULT_DEV_BUY_SOL = 0.01;
export const VERIFY_FEE_SOL = 1;

export const FEE_SPLIT = {
  agent: 0.65,
  platform: 0.35,
} as const;

export const SNIPER_NOTIFICATION_COST_SOL = 0.001;
export const SNIPER_MIN_DEPOSIT_SOL = 0.01;

export const DOMAIN_FEE_PERCENT = 10;

export const RATE_LIMITS = {
  launchPerAgent: { window: "24h", max: 1 },
  sniperPerMinute: { window: "1m", max: 30 },
  domainsPerMinute: { window: "1m", max: 30 },
  arbitragePerMinute: { window: "1m", max: 30 },
} as const;

export const PUMP_FUN_CREATOR_FEE_PERCENT = 1;

export const COMMON_MINTS = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  JITOSOL: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
  MSOL: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
  JUP: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  WIF: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
} as const;

export const SUPPORTED_DEXES = [
  "raydium",
  "orca",
  "meteora",
  "phoenix",
  "fluxbeam",
  "saros",
  "stabble",
  "aldrin",
  "solfi",
  "goonfi",
] as const;

export const SUPPORTED_TLDS = [
  "com",
  "io",
  "ai",
  "dev",
  "xyz",
  "net",
  "org",
] as const;
