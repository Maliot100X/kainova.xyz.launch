import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  BRAND,
  ADMIN_WALLET,
  SELF_FUNDED_FEE_SOL,
  DEFAULT_DEV_BUY_SOL,
  FEE_SPLIT,
  PUMP_FUN_CREATOR_FEE_PERCENT,
} from "@/lib/constants";
import { verifySolPayment } from "@/lib/solana";
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

export async function GET() {
  return NextResponse.json({
    success: true,
    paymentInstructions: {
      platformWallet: ADMIN_WALLET,
      cost: {
        launchFee: `${SELF_FUNDED_FEE_SOL} SOL`,
        devBuyDefault: `${DEFAULT_DEV_BUY_SOL} SOL (optional, included in launch)`,
        total: `${SELF_FUNDED_FEE_SOL} SOL minimum`,
      },
      paymentOptions: [
        {
          type: "standard",
          amount: `${SELF_FUNDED_FEE_SOL} SOL`,
          description: "Launch fee only — platform handles dev buy",
        },
        {
          type: "with_dev_buy",
          amount: `${SELF_FUNDED_FEE_SOL} SOL + dev buy amount`,
          description:
            "Launch fee + custom dev buy. Specify devBuySol or devBuyAmountUsd in the POST body.",
        },
      ],
      steps: [
        `Send ${SELF_FUNDED_FEE_SOL} SOL to ${ADMIN_WALLET}`,
        "Copy the transaction signature",
        "POST to this endpoint with txSignature and token details",
      ],
      endpoint: `${BRAND.url}/api/launch/self-funded`,
    },
  });
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
      txSignature,
      devBuySol,
      devBuyAmountUsd,
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
    if (!txSignature) errors.push("txSignature is required");

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const upperSymbol = symbol.toUpperCase();

    // --- Replay protection ---
    const existingFee = await prisma.launchFee.findUnique({
      where: { txHash: txSignature },
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

    // --- Verify SOL payment to platform wallet ---
    const paymentVerification = await verifySolPayment(
      txSignature,
      SELF_FUNDED_FEE_SOL
    );

    if (!paymentVerification.verified) {
      return NextResponse.json(
        {
          success: false,
          error: `Payment not verified. Expected ${SELF_FUNDED_FEE_SOL} SOL to ${ADMIN_WALLET}`,
          code: "PAYMENT_REQUIRED",
        },
        { status: 402 }
      );
    }

    // --- Save LaunchFee record ---
    await prisma.launchFee.create({
      data: {
        agentId,
        amount: paymentVerification.amount,
        txHash: txSignature,
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

    // --- Resolve dev buy amount ---
    let finalDevBuySol = DEFAULT_DEV_BUY_SOL;
    if (devBuySol && typeof devBuySol === "number" && devBuySol > 0) {
      finalDevBuySol = devBuySol;
    } else if (
      devBuyAmountUsd &&
      typeof devBuyAmountUsd === "number" &&
      devBuyAmountUsd > 0
    ) {
      // ~$150/SOL rough estimate; real price feed can replace this
      finalDevBuySol = devBuyAmountUsd / 150;
    }

    // --- Launch token on PumpFun ---
    const launchResult = await launchTokenOnPumpFun({
      name,
      symbol: upperSymbol,
      description,
      imageUrl,
      creatorWallet: walletAddress,
      devBuySol: finalDevBuySol,
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
        launchFeeTxHash: txSignature,
        pumpUrl: launchResult.pumpUrl,
        txHash: launchResult.txHash,
        fundingSource: "self-funded",
        devBuySol: finalDevBuySol,
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
      funding: {
        type: "self-funded",
        feePaid: `${paymentVerification.amount} SOL`,
        devBuy: `${finalDevBuySol} SOL`,
      },
      earnings: {
        split: FEE_SPLIT,
        creatorFeePercent: PUMP_FUN_CREATOR_FEE_PERCENT,
        trackAt: `${BRAND.url}/earnings/${agentId}`,
      },
      socialAmplification,
    });
  } catch (error) {
    console.error("Self-funded launch error:", error);
    return NextResponse.json(
      { success: false, error: "Self-funded launch failed" },
      { status: 500 }
    );
  }
}
