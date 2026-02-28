import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const [totalTokens, totalLaunches, agents] = await Promise.all([
      prisma.token.count(),
      prisma.token.count(),
      prisma.agent.findMany({
        include: {
          earnings: true,
          tokens: true,
        },
      }),
    ]);

    let totalEarnings = 0;
    for (const agent of agents) {
      for (const earning of agent.earnings) {
        totalEarnings += earning.amount;
      }
    }

    return NextResponse.json({
      totalTokens,
      totalMarketCap: 0,
      totalVolume24h: 0,
      totalLaunches,
      totalEarnings,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
