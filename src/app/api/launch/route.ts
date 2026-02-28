import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  BRAND,
  ADMIN_WALLET,
  LAUNCH_FEE_SOL,
  FEE_SPLIT,
  PUMP_FUN_CREATOR_FEE_PERCENT,
} from "@/lib/constants";
import { verifyLaunchFee } from "@/lib/solana";
import { launchTokenOnPumpFun } from "@/lib/pumpfun";

function buildSocialAmplification(
  symbol: string,
  mintAddress: string
): Record<string, unknown> {
  const tweetText = `🚀 Agentic token for [YOUR PURPOSE]!\n$${symbol} via ${BRAND.twitter}\nCA: ${mintAddress}\nTrade: https://pump.fun/coin/${mintAddress}\n#KaiNova #Solana`;

  return {
    message: `Get amplified by ${BRAND.twitter}!`,
    twitter: {
      template: tweetText,
      tweetIntentUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
      requirements: [
        `Tag ${BRAND.twitter}`,
        "Include your CA",
        "Describe your purpose",
      ],
    },
    moltbook: {
      template: {
        title: `🚀 $${symbol} - Agentic token for [YOUR PURPOSE]`,
        content: `Launched via ${BRAND.name} — the AI agent token launchpad on Solana.\n\nCA: ${mintAddress}\nTrade: https://pump.fun/coin/${mintAddress}\n\nPowered by ${BRAND.twitter}`,
      },
      postUrl: "https://www.moltbook.com/submit?submolt=crypto",
      registerFirst: {
        required: true,
        registerUrl: "https://www.moltbook.com/api/v1/agents/register",
      },
    },
    nextSteps: [
      `Tweet about your token and tag ${BRAND.twitter} for amplification`,
      "Post on Moltbook to reach the crypto community",
      "Share your pump.fun link in relevant communities",
      `Visit ${BRAND.url} to track your token earnings`,
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      symbol,
      description,
      imageUrl,
      agentId,
      agentName,
      walletAddress,
      launchFeeTxHash,
    } = body;

    // --- Validation ---
    const errors: string[] = [];
    if (!name || name.length < 1 || name.length > 32)
      errors.push("name must be 1-32 characters");
    if (!symbol || symbol.length < 1 || symbol.length > 10)
      errors.push("symbol must be 1-10 characters");
    if (!description || description.length < 20 || description.length > 500)
      errors.push("description must be 20-500 characters");
    if (!imageUrl) errors.push("imageUrl is required");
    if (!agentId) errors.push("agentId is required");
    if (!agentName) errors.push("agentName is required");
    if (!walletAddress) errors.push("walletAddress is required");
    if (!launchFeeTxHash) errors.push("launchFeeTxHash is required");

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const upperSymbol = symbol.toUpperCase();

    // --- Replay protection ---
    const existingFee = await prisma.launchFee.findUnique({
      where: { txHash: launchFeeTxHash },
    });

    if (existingFee) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction already used",
          code: "TX_REPLAY",
        },
        { status: 409 }
      );
    }

    // --- Rate limit: 1 launch per 24h per agent ---
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLaunch = await prisma.token.findFirst({
      where: {
        agentId,
        createdAt: { gte: twentyFourHoursAgo },
      },
    });

    if (recentLaunch) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit: 1 launch per 24 hours per agent",
          code: "RATE_LIMIT",
          nextAvailable: new Date(
            recentLaunch.createdAt.getTime() + 24 * 60 * 60 * 1000
          ),
        },
        { status: 429 }
      );
    }

    // --- Verify launch fee on-chain ---
    const feeVerification = await verifyLaunchFee(launchFeeTxHash);

    if (!feeVerification.verified) {
      return NextResponse.json(
        {
          success: false,
          error: `Launch fee not verified. Expected ${LAUNCH_FEE_SOL} SOL to ${ADMIN_WALLET}`,
          code: "PAYMENT_REQUIRED",
        },
        { status: 402 }
      );
    }

    // --- Save LaunchFee record ---
    await prisma.launchFee.create({
      data: {
        agentId,
        amount: feeVerification.amount,
        txHash: launchFeeTxHash,
        status: "confirmed",
        confirmedAt: new Date(),
      },
    });

    // --- Upsert Agent ---
    await prisma.agent.upsert({
      where: { agentId },
      update: { agentName, walletAddress, updatedAt: new Date() },
      create: { agentId, agentName, walletAddress },
    });

    // --- Launch token on PumpFun ---
    const launchResult = await launchTokenOnPumpFun({
      name,
      symbol: upperSymbol,
      description,
      imageUrl,
      creatorWallet: walletAddress,
    });

    // --- Save Token record ---
    await prisma.token.create({
      data: {
        mintAddress: launchResult.mintAddress,
        name,
        symbol: upperSymbol,
        description,
        imageUrl,
        agentId,
        walletAddress,
        launchFeePaid: true,
        launchFeeTxHash,
        pumpUrl: launchResult.pumpUrl,
        txHash: launchResult.txHash,
        fundingSource: "standard",
      },
    });

    const socialAmplification = buildSocialAmplification(
      upperSymbol,
      launchResult.mintAddress
    );

    return NextResponse.json({
      success: true,
      token: {
        name,
        symbol: upperSymbol,
        mintAddress: launchResult.mintAddress,
        txHash: launchResult.txHash,
        pumpUrl: launchResult.pumpUrl,
        explorerUrl: `https://solscan.io/tx/${launchResult.txHash}`,
      },
      earnings: {
        split: FEE_SPLIT,
        creatorFeePercent: PUMP_FUN_CREATOR_FEE_PERCENT,
        trackAt: `${BRAND.url}/earnings/${agentId}`,
      },
      socialAmplification,
    });
  } catch (error) {
    console.error("Launch error:", error);
    return NextResponse.json(
      { success: false, error: "Launch failed" },
      { status: 500 }
    );
  }
}
