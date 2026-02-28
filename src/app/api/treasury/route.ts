import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_WALLET, LAUNCH_FEE_SOL } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const [totalTokens, totalLaunches, launchFees] = await Promise.all([
      prisma.token.count(),
      prisma.token.count(),
      prisma.launchFee.aggregate({
        _sum: { amount: true },
        where: { status: "confirmed" }
      })
    ]);

    const totalLaunchFees = launchFees._sum.amount || 0;
    const costPerLaunch = 0.02;
    const launchesAffordable = Math.floor(totalLaunchFees / costPerLaunch);

    return NextResponse.json({
      status: totalLaunchFees > 0 ? "healthy" : "initializing",
      wallet: {
        balance: totalLaunchFees,
        reserve: 0.1,
        availableForLaunches: Math.max(0, totalLaunchFees - 0.1),
        launchesAffordable,
        costPerLaunch,
        adminWallet: ADMIN_WALLET
      },
      platform: {
        launchFee: LAUNCH_FEE_SOL,
        feeShare: {
          agent: 0.65,
          platform: 0.35
        }
      },
      pnl: {
        net: totalLaunchFees - (totalTokens * costPerLaunch),
        isPositive: totalLaunchFees > totalTokens * costPerLaunch
      }
    });
  } catch (error) {
    console.error("Treasury error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
