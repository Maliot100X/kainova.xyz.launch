import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const agentId = req.nextUrl.searchParams.get("agentId");
    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
    }

    const agent = await prisma.agent.findUnique({ where: { agentId } });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const earnings = await prisma.earning.findMany({
      where: { agentId },
      include: { token: { select: { name: true, symbol: true } } },
      orderBy: { createdAt: "desc" },
    });

    const totalEarned = earnings.reduce((s: number, e: any) => s + e.amount, 0);
    const totalSent = earnings.filter((e: any) => e.status === "sent").reduce((s: number, e: any) => s + e.amount, 0);
    const totalPending = earnings.filter((e: any) => e.status === "pending").reduce((s: number, e: any) => s + e.amount, 0);
    const totalHeld = earnings.filter((e: any) => e.status === "held").reduce((s: number, e: any) => s + e.amount, 0);
    const totalFailed = earnings.filter((e: any) => e.status === "failed").reduce((s: number, e: any) => s + e.amount, 0);

    const breakdownMap = new Map<string, { mintAddress: string; name: string; symbol: string; total: number; lastDist?: string }>();
    for (const e of earnings) {
      const existing = breakdownMap.get(e.mintAddress);
      if (existing) {
        existing.total += e.amount;
        if (e.distributedAt && (!existing.lastDist || e.distributedAt.toISOString() > existing.lastDist)) {
          existing.lastDist = e.distributedAt.toISOString();
        }
      } else {
        breakdownMap.set(e.mintAddress, {
          mintAddress: e.mintAddress,
          name: e.token.name,
          symbol: e.token.symbol,
          total: e.amount,
          lastDist: e.distributedAt?.toISOString(),
        });
      }
    }

    const tokenBreakdown = Array.from(breakdownMap.values()).map((b) => ({
      mintAddress: b.mintAddress,
      name: b.name,
      symbol: b.symbol,
      totalCollected: +(b.total / 0.65).toFixed(9),
      totalAgentShare: +b.total.toFixed(9),
      lastDistribution: b.lastDist || null,
    }));

    const recentDistributions = earnings.slice(0, 50).map((e: any) => ({
      id: e.id,
      amountSol: e.amount,
      status: e.status,
      txHash: e.txHash,
      createdAt: e.createdAt.toISOString(),
    }));

    return NextResponse.json({
      agentId,
      totalEarned: +totalEarned.toFixed(9),
      totalSent: +totalSent.toFixed(9),
      totalPending: +totalPending.toFixed(9),
      totalHeld: +totalHeld.toFixed(9),
      totalFailed: +totalFailed.toFixed(9),
      tokenBreakdown,
      recentDistributions,
    });
  } catch (error) {
    console.error("Earnings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
