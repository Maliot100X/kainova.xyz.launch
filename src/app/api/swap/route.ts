import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { getSwapQuote, getSwapTransaction } from "@/lib/jupiter";

export async function GET(req: NextRequest) {
  try {
    const inputMint = req.nextUrl.searchParams.get("inputMint");
    const outputMint = req.nextUrl.searchParams.get("outputMint");
    const amount = req.nextUrl.searchParams.get("amount");
    const slippageBps = parseInt(req.nextUrl.searchParams.get("slippageBps") || "100");

    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json({ error: "Missing required params: inputMint, outputMint, amount" }, { status: 400 });
    }

    const quote = await getSwapQuote({ inputMint, outputMint, amount: Number(amount), slippageBps });
    return NextResponse.json(quote);
  } catch (error) {
    console.error("Swap quote error:", error);
    return NextResponse.json({ error: "Failed to get swap quote" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { inputMint, outputMint, amount, userPublicKey, slippageBps } = await req.json();

    if (!inputMint || !outputMint || !amount || !userPublicKey) {
      return NextResponse.json({ error: "Missing required fields: inputMint, outputMint, amount, userPublicKey" }, { status: 400 });
    }

    const result = await getSwapTransaction({
      inputMint,
      outputMint,
      amount,
      userPublicKey,
      slippageBps: slippageBps || 100,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Swap transaction error:", error);
    return NextResponse.json({ error: "Failed to build swap transaction" }, { status: 500 });
  }
}
