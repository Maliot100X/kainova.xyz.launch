import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const sort = req.nextUrl.searchParams.get("sort") || "new";
    const limit = Math.min(Math.max(parseInt(req.nextUrl.searchParams.get("limit") || "50"), 1), 100);
    const offset = Math.max(parseInt(req.nextUrl.searchParams.get("offset") || "0"), 0);

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "mcap" || sort === "volume" || sort === "hot") {
      orderBy = { createdAt: "desc" };
    }

    const tokens = await prisma.token.findMany({
      take: limit,
      skip: offset,
      orderBy,
      include: {
        agent: { select: { agentName: true } },
        _count: { select: { earnings: true } },
      },
    });

    const result = tokens.map((t: any) => ({
      mintAddress: t.mintAddress,
      name: t.name,
      symbol: t.symbol,
      description: t.description,
      imageUrl: t.imageUrl,
      agentId: t.agentId,
      agentName: t.agent.agentName,
      pumpUrl: t.pumpUrl,
      verified: t.verified,
      fundingSource: t.fundingSource,
      createdAt: t.createdAt.toISOString(),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Tokens list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
