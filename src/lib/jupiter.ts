const JUPITER_API_URL =
  process.env.JUPITER_API_URL || "https://quote-api.jup.ag/v6";

const PLATFORM_FEE_BPS = 50;

interface QuoteParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps?: number;
}

interface SwapParams extends QuoteParams {
  userPublicKey: string;
}

export async function getSwapQuote({
  inputMint,
  outputMint,
  amount,
  slippageBps = 50,
}: QuoteParams) {
  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: amount.toString(),
    slippageBps: slippageBps.toString(),
    platformFeeBps: PLATFORM_FEE_BPS.toString(),
  });

  const response = await fetch(`${JUPITER_API_URL}/quote?${params}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Jupiter quote error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function getSwapTransaction({
  inputMint,
  outputMint,
  amount,
  userPublicKey,
  slippageBps = 50,
}: SwapParams): Promise<string> {
  const quote = await getSwapQuote({
    inputMint,
    outputMint,
    amount,
    slippageBps,
  });

  const response = await fetch(`${JUPITER_API_URL}/swap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Jupiter swap error: ${response.status} - ${errorText}`);
  }

  const { swapTransaction } = await response.json();
  return swapTransaction;
}
