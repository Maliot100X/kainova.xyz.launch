import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySolPayment } from "@/lib/solana";
import { ADMIN_WALLET, VERIFY_FEE_SOL } from "@/lib/constants";

export async function POST(req: NextRequest, { params }: { params: { mintAddress: string } }) {
  try {
    const { mintAddress } = params;
    const { txSignature } = await req.json();

    if (!txSignature) {
      return NextResponse.json({
        error: "Payment required",
        cost: `${VERIFY_FEE_SOL} SOL`,
        adminWallet: ADMIN_WALLET,
        instructions: `Send ${VERIFY_FEE_SOL} SOL to ${ADMIN_WALLET}, then POST with { "txSignature": "your-tx-hash" }`,
      }, { status: 402 });
    }

    const token = await prisma.token.findUnique({ where: { mintAddress } });
    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }
    if (token.verified) {
      return NextResponse.json({ error: "Token already verified" }, { status: 409 });
    }

    const existing = await prisma.token.findFirst({ where: { verifyTxHash: txSignature } });
    if (existing) {
      return NextResponse.json({ error: "Payment signature already used" }, { status: 409 });
    }

    const result = await verifySolPayment(txSignature, VERIFY_FEE_SOL);
    if (!result.verified) {
      return NextResponse.json({ error: "Payment not verified. Send exactly 1 SOL to admin wallet." }, { status: 400 });
    }

    await prisma.token.update({
      where: { mintAddress },
      data: { verified: true, verifyTxHash: txSignature },
    });

    return NextResponse.json({
      success: true,
      mintAddress,
      verified: true,
      payment: { method: "sol", amountSol: VERIFY_FEE_SOL, txSignature, sender: result.sender },
    });
  } catch (error) {
    console.error("Token verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
