import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { DOMAIN_FEE_PERCENT, SUPPORTED_TLDS } from "@/lib/constants";

const CONWAY_API_KEY = process.env.CONWAY_API_KEY || "";
const CONWAY_BASE_URL = "https://api.conway.domains/v1";

async function searchConwayDomains(query: string, tlds: string[]) {
  if (!CONWAY_API_KEY) {
    return [];
  }

  try {
    const response = await fetch(`${CONWAY_BASE_URL}/domains/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CONWAY_API_KEY}`,
      },
      body: JSON.stringify({
        keyword: query,
        tlds,
        limit: 20,
      }),
    });

    if (!response.ok) {
      console.error("Conway API error:", await response.text());
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Conway search error:", error);
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q") || req.nextUrl.searchParams.get("query");
    const tldsParam = req.nextUrl.searchParams.get("tlds");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' or 'query' is required" },
        { status: 400 }
      );
    }

    const tlds = tldsParam ? tldsParam.split(",") : [...SUPPORTED_TLDS];

    const results = await searchConwayDomains(query, tlds);

    const formatted = results.map((r: { domain: string; available: boolean; price: number }) => ({
      domain: r.domain,
      available: r.available,
      price: r.price,
      pricing: r.available ? {
        conwayPrice: r.price,
        clawpumpFee: +(r.price * DOMAIN_FEE_PERCENT / 100).toFixed(2),
        totalPrice: +(r.price * (1 + DOMAIN_FEE_PERCENT / 100)).toFixed(2),
        feePercent: DOMAIN_FEE_PERCENT,
      } : undefined,
    }));

    return NextResponse.json({
      query,
      results: formatted,
      source: "conway",
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Domain search error:", error);
    return NextResponse.json(
      { error: "Failed to search domains" },
      { status: 500 }
    );
  }
}
