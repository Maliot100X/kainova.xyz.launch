import { NextRequest, NextResponse } from "next/server";
import { SNIPER_NOTIFICATION_COST_SOL, SNIPER_MIN_DEPOSIT_SOL, ADMIN_WALLET, BRAND } from "@/lib/constants";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    service: "KaiNova Sniper Notifications",
    description: "Get webhook alerts when new tokens launch on KaiNova",
    baseUrl: BRAND.url,
    pricing: {
      perNotification: `${SNIPER_NOTIFICATION_COST_SOL} SOL`,
      minimumDeposit: `${SNIPER_MIN_DEPOSIT_SOL} SOL`,
    },
    depositWallet: ADMIN_WALLET,
    endpoints: {
      subscribe: "POST /api/sniper/subscribe",
      deposit: "POST /api/sniper/deposit",
      status: "GET /api/sniper/status",
      activate: "POST /api/sniper/activate",
      deactivate: "POST /api/sniper/deactivate",
    },
    webhookPayload: {
      event: "token_launch",
      timestamp: "2025-01-15T12:00:00.000Z",
      token: {
        mintAddress: "TokenMintAddress...",
        name: "Example Token",
        symbol: "EXT",
        description: "An example token",
        imageUrl: "https://...",
        creatorWallet: "CreatorWallet...",
        pumpUrl: "https://pump.fun/coin/...",
      },
    },
  });
}

export const dynamic = 'force-dynamic';
