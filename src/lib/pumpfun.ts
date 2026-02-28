import { Keypair, VersionedTransaction } from "@solana/web3.js";
import { getConnection, getPlatformKeypair } from "@/lib/solana";
import { DEFAULT_DEV_BUY_SOL } from "@/lib/constants";

interface LaunchParams {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  creatorWallet: string;
  devBuySol?: number;
}

interface LaunchResult {
  mintAddress: string;
  txHash: string;
  pumpUrl: string;
}

export async function launchTokenOnPumpFun(
  params: LaunchParams
): Promise<LaunchResult> {
  const {
    name,
    symbol,
    description,
    imageUrl,
    creatorWallet,
    devBuySol = DEFAULT_DEV_BUY_SOL,
  } = params;

  const mintKeypair = Keypair.generate();
  const platformKeypair = getPlatformKeypair();

  const response = await fetch("https://pumpportal.fun/api/trade-local", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      publicKey: platformKeypair.publicKey.toBase58(),
      action: "create",
      tokenMetadata: {
        name,
        symbol,
        uri: imageUrl,
      },
      mint: mintKeypair.publicKey.toBase58(),
      denominatedInSol: "true",
      amount: devBuySol,
      slippage: 10,
      priorityFee: 0.0005,
      pool: "pump",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PumpPortal API error: ${response.status} - ${errorText}`);
  }

  const txData = await response.arrayBuffer();
  const tx = VersionedTransaction.deserialize(new Uint8Array(txData));

  tx.sign([mintKeypair, platformKeypair]);

  const conn = getConnection();
  const txHash = await conn.sendTransaction(tx, {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });

  await conn.confirmTransaction(txHash, "confirmed");

  const mintAddress = mintKeypair.publicKey.toBase58();

  return {
    mintAddress,
    txHash,
    pumpUrl: `https://pump.fun/coin/${mintAddress}`,
  };
}
