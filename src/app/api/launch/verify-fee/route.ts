import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyLaunchFee } from "@/lib/solana";
import { ADMIN_WALLET, LAUNCH_FEE_SOL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { txHash, agentId } = body;

    if (!txHash || !agentId) {
      return NextResponse.json(
        { success: false, error: "txHash and agentId are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.launchFee.findUnique({
      where: { txHash },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        verified: true,
        amount: existing.amount,
        recipient: ADMIN_WALLET,
        status: existing.status,
        timestamp: existing.confirmedAt?.toISOString() || existing.createdAt.toISOString(),
        alreadyRecorded: true,
      });
    }

    const verification = await verifyLaunchFee(txHash);

    if (!verification.verified) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: `Fee not verified. Expected ${LAUNCH_FEE_SOL} SOL to ${ADMIN_WALLET}`,
          amount: verification.amount,
          recipient: ADMIN_WALLET,
          status: "failed",
          timestamp: verification.timestamp
            ? new Date(verification.timestamp * 1000).toISOString()
            : null,
        },
        { status: 402 }
      );
    }

    const fee = await prisma.launchFee.create({
      data: {
        agentId,
        amount: verification.amount,
        txHash,
        status: "confirmed",
        confirmedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      verified: true,
      amount: verification.amount,
      recipient: ADMIN_WALLET,
      status: fee.status,
      timestamp: fee.confirmedAt?.toISOString() || fee.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Fee verification error:", error);
    return NextResponse.json(
      { success: false, error: "Fee verification failed" },
      { status: 500 }
    );
  }
}
