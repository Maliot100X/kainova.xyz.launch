import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySolPayment } from "@/lib/solana";
import { SNIPER_MIN_DEPOSIT_SOL, ADMIN_WALLET } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const apiKey = authHeader?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key required" },
        { status: 401 }
      );
    }

    const subscription = await prisma.sniperSubscription.findUnique({
      where: { apiKey },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 }
      );
    }

    const { txSignature } = await req.json();

    if (!txSignature) {
      return NextResponse.json(
        { success: false, error: "txSignature is required" },
        { status: 400 }
      );
    }

    const verification = await verifySolPayment(txSignature, SNIPER_MIN_DEPOSIT_SOL);

    if (!verification.verified) {
      return NextResponse.json(
        {
          success: false,
          error: `Deposit verification failed. Expected at least ${SNIPER_MIN_DEPOSIT_SOL} SOL to ${ADMIN_WALLET}`,
        },
        { status: 400 }
      );
    }

    const existingDeposit = await prisma.sniperSubscription.findFirst({
      where: {
        apiKey,
        totalDeposited: { gte: verification.amount },
      },
    });

    if (verification.amount < SNIPER_MIN_DEPOSIT_SOL) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum deposit is ${SNIPER_MIN_DEPOSIT_SOL} SOL`,
        },
        { status: 400 }
      );
    }

    await prisma.sniperSubscription.update({
      where: { apiKey },
      data: {
        balanceSol: { increment: verification.amount },
        totalDeposited: { increment: verification.amount },
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      deposited: verification.amount,
      newBalance: subscription.balanceSol + verification.amount,
    });
  } catch (error) {
    console.error("Sniper deposit error:", error);
    return NextResponse.json(
      { success: false, error: "Deposit failed" },
      { status: 500 }
    );
  }
}
