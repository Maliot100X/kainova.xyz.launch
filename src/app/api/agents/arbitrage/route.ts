import { NextRequest, NextResponse } from "next/server";
import { SUPPORTED_DEXES, ADMIN_WALLET, BRAND } from "@/lib/constants";

const JUPITER_API = "https://quote-api.jup.ag/v6";

interface QuoteParams {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps?: number;
}

async function getJupiterQuote(params: QuoteParams) {
  const url = new URL(`${JUPITER_API}/quote`);
  url.searchParams.set("inputMint", params.inputMint);
  url.searchParams.set("outputMint", params.outputMint);
  url.searchParams.set("amount", params.amount);
  url.searchParams.set("slippageBps", (params.slippageBps || 50).toString());
  url.searchParams.set("dexes", SUPPORTED_DEXES.join(","));

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Jupiter quote failed: ${response.status}`);
  }
  return response.json();
}

export async function POST(req: NextRequest) {
  try {
    const { userPublicKey, pairs, maxBundles = 3, agentId } = await req.json();

    if (!userPublicKey || !pairs || !Array.isArray(pairs) || pairs.length === 0) {
      return NextResponse.json(
        { error: "userPublicKey and pairs array are required" },
        { status: 400 }
      );
    }

    const results: any[] = [];
    const bundles: any[] = [];

    for (const pair of pairs.slice(0, 10)) {
      const { inputMint, outputMint, amount, strategy = "roundtrip", slippageBps = 50 } = pair;

      if (!inputMint || !outputMint || !amount) {
        continue;
      }

      try {
        const quote = await getJupiterQuote({ inputMint, outputMint, amount, slippageBps });

        const outAmount = parseInt(quote.outAmount);
        const inAmount = parseInt(amount);
        const priceImpact = ((inAmount - outAmount) / inAmount) * 100;

        results.push({
          index: results.length,
          mode: strategy,
          inputMint,
          outputMint,
          amount,
          profitable: false,
          reason: "Cross-DEX arbitrage requires multiple DEX quotes. Using single Jupiter quote for demo.",
          forwardQuotes: [
            { dex: "Jupiter Aggregator", outAmount: quote.outAmount, priceImpact },
          ],
          bundleReady: false,
        });
      } catch (err) {
        results.push({
          index: results.length,
          mode: strategy,
          inputMint,
          outputMint,
          amount,
          profitable: false,
          error: "Failed to get quote",
        });
      }
    }

    return NextResponse.json({
      scannedPairs: pairs.length,
      profitablePairs: 0,
      bundlesReturned: 0,
      bundles,
      results,
      note: "Full arbitrage requires multi-DEX quotes. This endpoint demonstrates the API structure.",
    });
  } catch (error) {
    console.error("Arbitrage scan error:", error);
    return NextResponse.json(
      { error: "Arbitrage scan failed" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
