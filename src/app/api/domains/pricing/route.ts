import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { DOMAIN_FEE_PERCENT, SUPPORTED_TLDS } from "@/lib/constants";

const TLD_PRICING: Record<string, { register: number; renew: number }> = {
  com: { register: 11.07, renew: 12.99 },
  io: { register: 32.99, renew: 39.99 },
  ai: { register: 54.99, renew: 59.99 },
  dev: { register: 12.99, renew: 14.99 },
  xyz: { register: 1.99, renew: 2.99 },
  net: { register: 12.99, renew: 14.99 },
  org: { register: 10.99, renew: 12.99 },
};

export async function GET(req: NextRequest) {
  try {
    const tldsParam = req.nextUrl.searchParams.get("tlds");
    const tlds = tldsParam ? tldsParam.split(",") : [...SUPPORTED_TLDS];

    const pricing = tlds.map((tld: string) => {
      const prices = TLD_PRICING[tld] || { register: 9.99, renew: 12.99 };
      return {
        tld,
        register: {
          conwayPrice: prices.register,
          clawpumpFee: +(prices.register * DOMAIN_FEE_PERCENT / 100).toFixed(2),
          totalPrice: +(prices.register * (1 + DOMAIN_FEE_PERCENT / 100)).toFixed(2),
          feePercent: DOMAIN_FEE_PERCENT,
        },
        renew: {
          conwayPrice: prices.renew,
          clawpumpFee: +(prices.renew * DOMAIN_FEE_PERCENT / 100).toFixed(2),
          totalPrice: +(prices.renew * (1 + DOMAIN_FEE_PERCENT / 100)).toFixed(2),
          feePercent: DOMAIN_FEE_PERCENT,
        },
        currency: "USD",
      };
    });

    return NextResponse.json({
      pricing,
      feePercent: DOMAIN_FEE_PERCENT,
      note: "Prices include a 10% KaiNova service fee. Registration available in Phase 2.",
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Pricing error:", error);
    return NextResponse.json(
      { error: "Failed to get pricing" },
      { status: 500 }
    );
  }
}
