import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { SNIPER_NOTIFICATION_COST_SOL, SNIPER_MIN_DEPOSIT_SOL, ADMIN_WALLET } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const { webhookUrl, walletAddress } = await req.json();

    if (!webhookUrl || !walletAddress) {
      return NextResponse.json(
        { success: false, error: "webhookUrl and walletAddress are required" },
        { status: 400 }
      );
    }

    if (!webhookUrl.startsWith("https://")) {
      return NextResponse.json(
        { success: false, error: "webhookUrl must use HTTPS" },
        { status: 400 }
      );
    }

    const subscriberId = `sub_${uuidv4().slice(0, 8)}`;
    const apiKey = `sn_${uuidv4().replace(/-/g, "")}`;

    const subscription = await prisma.sniperSubscription.create({
      data: {
        subscriberId,
        apiKey,
        webhookUrl,
        walletAddress,
        isActive: false,
        balanceSol: 0,
      },
    });

    return NextResponse.json({
      success: true,
      subscriberId: subscription.subscriberId,
      apiKey: subscription.apiKey,
      message: "Save your API key — it will not be shown again.",
      webhookUrl: subscription.webhookUrl,
      depositWallet: ADMIN_WALLET,
      nextStep: `Deposit SOL to ${ADMIN_WALLET}, then POST the tx signature to /api/sniper/deposit`,
    });
  } catch (error) {
    console.error("Sniper subscribe error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
