import { NextRequest, NextResponse } from "next/server";

const JUPITER_API = "https://quote-api.jup.ag/v6";

export async function GET(req: NextRequest) {
  try {
    const mints = req.nextUrl.searchParams.get("mints");

    if (!mints) {
      return NextResponse.json(
        { error: "mints parameter is required (comma-separated, max 5)" },
        { status: 400 }
      );
    }

    const mintList = mints.split(",").slice(0, 5);

    const prices: Record<string, { usd?: number; dexes?: Record<string, string> }> = {};

    const SOL_MINT = "So11111111111111111111111111111111111111112";
    const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

    for (const mint of mintList) {
      try {
        const url = new URL(`${JUPITER_API}/quote`);
        url.searchParams.set("inputMint", mint);
        url.searchParams.set("outputMint", USDC_MINT);
        url.searchParams.set("amount", "1000000000");
        url.searchParams.set("slippageBps", "100");

        const response = await fetch(url.toString());
        if (response.ok) {
          const quote = await response.json();
          prices[mint] = {
            dexes: { jupiter: quote.outAmount },
          };
        }
      } catch {
        prices[mint] = {};
      }
    }

    return NextResponse.json({
      prices,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Prices error:", error);
    return NextResponse.json(
      { error: "Failed to get prices" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
