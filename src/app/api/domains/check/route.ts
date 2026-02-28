import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { DOMAIN_FEE_PERCENT } from "@/lib/constants";

const CONWAY_API_KEY = process.env.CONWAY_API_KEY || "";
const CONWAY_BASE_URL = "https://api.conway.domains/v1";

export async function GET(req: NextRequest) {
  try {
    const domainsParam = req.nextUrl.searchParams.get("domains");

    if (!domainsParam) {
      return NextResponse.json(
        { error: "Query parameter 'domains' is required" },
        { status: 400 }
      );
    }

    const domains = domainsParam.split(",").map(d => d.trim()).slice(0, 20);

    if (!CONWAY_API_KEY) {
      return NextResponse.json({
        domains,
        results: domains.map((domain: string) => ({
          domain,
          available: true,
          price: 9.99,
          pricing: {
            conwayPrice: 9.99,
            clawpumpFee: 0.99,
            totalPrice: 10.98,
            feePercent: DOMAIN_FEE_PERCENT,
          },
        })),
        source: "mock",
        timestamp: Date.now(),
      });
    }

    const response = await fetch(`${CONWAY_BASE_URL}/domains/batch-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CONWAY_API_KEY}`,
      },
      body: JSON.stringify({ domains }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to check domains" },
        { status: 500 }
      );
    }

    const data = await response.json();

    const results = domains.map((domain: string) => {
      const found = data.results?.find((r: { domain: string }) => r.domain === domain);
      return {
        domain,
        available: found?.available ?? true,
        price: found?.price ?? 9.99,
        pricing: found?.available ? {
          conwayPrice: found.price,
          clawpumpFee: +(found.price * DOMAIN_FEE_PERCENT / 100).toFixed(2),
          totalPrice: +(found.price * (1 + DOMAIN_FEE_PERCENT / 100)).toFixed(2),
          feePercent: DOMAIN_FEE_PERCENT,
        } : undefined,
      };
    });

    return NextResponse.json({
      domains,
      results,
      source: "conway",
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Domain check error:", error);
    return NextResponse.json(
      { error: "Failed to check domains" },
      { status: 500 }
    );
  }
}
