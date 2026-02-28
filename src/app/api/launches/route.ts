import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const agentId = req.nextUrl.searchParams.get("agentId");
    const limit = Math.min(Math.max(parseInt(req.nextUrl.searchParams.get("limit") || "20"), 1), 100);
    const offset = Math.max(parseInt(req.nextUrl.searchParams.get("offset") || "0"), 0);

    const where = agentId ? { agentId } : {};

    const tokens = await prisma.token.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
      include: { agent: { select: { agentName: true, walletAddress: true } } },
    });

    return NextResponse.json(
      tokens.map((t: any) => ({
        mintAddress: t.mintAddress,
        name: t.name,
        symbol: t.symbol,
        imageUrl: t.imageUrl,
        agentId: t.agentId,
        agentName: t.agent.agentName,
        pumpUrl: t.pumpUrl,
        txHash: t.txHash,
        fundingSource: t.fundingSource,
        verified: t.verified,
        createdAt: t.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Launches error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
