import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import bs58 from "bs58";
import { ADMIN_WALLET, LAUNCH_FEE_SOL } from "@/lib/constants";

let connection: Connection | null = null;

export function getConnection(): Connection {
  if (!connection) {
    const rpcUrl =
      process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
    connection = new Connection(rpcUrl, "confirmed");
  }
  return connection;
}

export async function verifyLaunchFee(txHash: string): Promise<{
  verified: boolean;
  amount: number;
  sender: string;
  timestamp: number;
}> {
  return verifySolPayment(txHash, LAUNCH_FEE_SOL);
}

export async function verifySolPayment(
  txHash: string,
  expectedAmount: number
): Promise<{
  verified: boolean;
  amount: number;
  sender: string;
  timestamp: number;
}> {
  const conn = getConnection();

  const tx = await conn.getTransaction(txHash, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });

  if (!tx || !tx.meta) {
    return { verified: false, amount: 0, sender: "", timestamp: 0 };
  }

  const adminPubkey = new PublicKey(ADMIN_WALLET);
  const accountKeys = tx.transaction.message.getAccountKeys();

  let adminIndex = -1;
  for (let i = 0; i < accountKeys.length; i++) {
    if (accountKeys.get(i)?.equals(adminPubkey)) {
      adminIndex = i;
      break;
    }
  }

  if (adminIndex === -1) {
    return { verified: false, amount: 0, sender: "", timestamp: 0 };
  }

  const preBal = tx.meta.preBalances[adminIndex];
  const postBal = tx.meta.postBalances[adminIndex];
  const receivedLamports = postBal - preBal;
  const receivedSol = receivedLamports / LAMPORTS_PER_SOL;

  const tolerance = 0.0001;
  const verified = Math.abs(receivedSol - expectedAmount) < tolerance;

  const senderIndex = 0;
  const sender = accountKeys.get(senderIndex)?.toBase58() || "";

  return {
    verified,
    amount: receivedSol,
    sender,
    timestamp: tx.blockTime || 0,
  };
}

export function getPlatformKeypair(): Keypair {
  const secretKey = process.env.PLATFORM_WALLET_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PLATFORM_WALLET_SECRET_KEY not set");
  }
  return Keypair.fromSecretKey(bs58.decode(secretKey));
}
