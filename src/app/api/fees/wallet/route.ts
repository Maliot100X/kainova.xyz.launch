import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nacl from "tweetnacl";
import bs58 from "bs58";

export async function PUT(req: NextRequest) {
  try {
    const { agentId, walletAddress, signature, timestamp } = await req.json();

    if (!agentId || !walletAddress || !signature || !timestamp) {
      return NextResponse.json({ error: "Missing required fields: agentId, walletAddress, signature, timestamp" }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      return NextResponse.json({ error: "Timestamp expired. Must be within 5 minutes of server time." }, { status: 400 });
    }

    const message = `kainova:update-wallet:${agentId}:${walletAddress}:${timestamp}`;
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = bs58.decode(walletAddress);

    const valid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    await prisma.agent.upsert({
      where: { agentId },
      create: { agentId, agentName: agentId, walletAddress },
      update: { walletAddress },
    });

    return NextResponse.json({ success: true, agentId, walletAddress, message: "Wallet updated" });
  } catch (error) {
    console.error("Wallet update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
