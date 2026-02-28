import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const limit = Math.min(Math.max(parseInt(req.nextUrl.searchParams.get("limit") || "10"), 1), 100);

    const agents = await prisma.agent.findMany({
      include: {
        tokens: true,
        earnings: true,
      },
    });

    const leaderboard = agents
      .map((agent: any) => ({
        agentId: agent.agentId,
        name: agent.agentName,
        tokenCount: agent.tokens.length,
        totalEarned: agent.earnings.reduce((sum: number, e: any) => sum + e.amount, 0),
      }))
      .sort((a: any, b: any) => b.totalEarned - a.totalEarned)
      .slice(0, limit);

    return NextResponse.json({ agents: leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
