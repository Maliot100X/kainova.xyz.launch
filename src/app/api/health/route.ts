import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getConnection } from "@/lib/solana";

export async function GET(req: NextRequest) {
  const checks: Record<string, { status: string; message?: string }> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "ok" };
  } catch (error) {
    checks.database = { status: "error", message: String(error) };
  }

  try {
    const conn = await getConnection();
    await conn.getVersion();
    checks.solanaRpc = { status: "ok" };
  } catch (error) {
    checks.solanaRpc = { status: "error", message: String(error) };
  }

  const allHealthy = Object.values(checks).every((c) => c.status === "ok");

  return NextResponse.json({
    status: allHealthy ? "healthy" : "degraded",
    checks,
  });
}
