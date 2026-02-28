import { NextRequest, NextResponse } from "next/server";

const JUPITER_API = "https://quote-api.jup.ag/v6";

export async function POST(req: NextRequest) {
  try {
    const { inputMint, outputMint, amount, agentId } = await req.json();

    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json(
        { error: "inputMint, outputMint, and amount are required" },
        { status: 400 }
      );
    }

    const url = new URL(`${JUPITER_API}/quote`);
    url.searchParams.set("inputMint", inputMint);
    url.searchParams.set("outputMint", outputMint);
    url.searchParams.set("amount", amount.toString());
    url.searchParams.set("slippageBps", "50");

    const response = await fetch(url.toString());

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to get quote" },
        { status: 500 }
      );
    }

    const quote = await response.json();

    return NextResponse.json({
      inputMint,
      outputMint,
      amount,
      quote,
      dexes: ["Raydium", "Orca", "Meteora", "Jupiter"],
      note: "Full multi-DEX quote requires direct DEX API calls",
    });
  } catch (error) {
    console.error("Arbitrage quote error:", error);
    return NextResponse.json(
      { error: "Quote failed" },
      { status: 500 }
    );
  }
}
