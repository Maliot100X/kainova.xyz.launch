import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { mintAddress: string } }) {
  try {
    const { mintAddress } = params;

    const token = await prisma.token.findUnique({
      where: { mintAddress },
      include: {
        agent: true,
        earnings: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });

    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    const totalEarned = token.earnings.reduce((s, e) => s + e.amount, 0);
    const totalSent = token.earnings.filter((e) => e.status === "sent").reduce((s, e) => s + e.amount, 0);
    const totalPending = token.earnings.filter((e) => e.status === "pending").reduce((s, e) => s + e.amount, 0);

    return NextResponse.json({
      mintAddress: token.mintAddress,
      name: token.name,
      symbol: token.symbol,
      description: token.description,
      imageUrl: token.imageUrl,
      agentId: token.agentId,
      agentName: token.agent.agentName,
      walletAddress: token.walletAddress,
      pumpUrl: token.pumpUrl,
      txHash: token.txHash,
      verified: token.verified,
      website: token.website,
      twitter: token.twitter,
      telegram: token.telegram,
      fundingSource: token.fundingSource,
      createdAt: token.createdAt.toISOString(),
      earnings: {
        totalEarned: +totalEarned.toFixed(9),
        totalSent: +totalSent.toFixed(9),
        totalPending: +totalPending.toFixed(9),
      },
      recentEarnings: token.earnings.map((e) => ({
        amount: e.amount,
        status: e.status,
        txHash: e.txHash,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Token detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
