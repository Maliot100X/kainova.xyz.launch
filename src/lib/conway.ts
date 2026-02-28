import { DOMAIN_FEE_PERCENT, SUPPORTED_TLDS } from "@/lib/constants";

const CONWAY_API_URL =
  process.env.CONWAY_API_URL || "https://api.conway.domains/v1";
const CONWAY_API_KEY = process.env.CONWAY_API_KEY;

interface DomainResult {
  domain: string;
  tld: string;
  available: boolean;
  price?: number;
  priceWithFee?: number;
}

interface TldPricing {
  tld: string;
  basePrice: number;
  kainovaPrice: number;
}

function applyFee(price: number): number {
  return Math.round(price * (1 + DOMAIN_FEE_PERCENT / 100) * 100) / 100;
}

async function conwayFetch(endpoint: string, body?: object) {
  const response = await fetch(`${CONWAY_API_URL}${endpoint}`, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CONWAY_API_KEY}`,
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    throw new Error(`Conway API error: ${response.status}`);
  }

  return response.json();
}

export async function searchDomains(
  query: string,
  tlds: string[] = [...SUPPORTED_TLDS]
): Promise<DomainResult[]> {
  if (!CONWAY_API_KEY) {
    return tlds.map((tld) => ({
      domain: `${query}.${tld}`,
      tld,
      available: true,
      price: 9.99,
      priceWithFee: applyFee(9.99),
    }));
  }

  const data = await conwayFetch("/domains/search", { query, tlds });

  return data.results.map((r: { domain: string; tld: string; available: boolean; price?: number }) => ({
    ...r,
    priceWithFee: r.price ? applyFee(r.price) : undefined,
  }));
}

export async function checkDomainAvailability(
  domains: string[]
): Promise<DomainResult[]> {
  if (!CONWAY_API_KEY) {
    return domains.map((domain) => {
      const parts = domain.split(".");
      const tld = parts.pop() || "";
      return {
        domain,
        tld,
        available: true,
        price: 9.99,
        priceWithFee: applyFee(9.99),
      };
    });
  }

  const data = await conwayFetch("/domains/check", { domains });

  return data.results.map((r: { domain: string; tld: string; available: boolean; price?: number }) => ({
    ...r,
    priceWithFee: r.price ? applyFee(r.price) : undefined,
  }));
}

export async function getTldPricing(
  tlds: string[] = [...SUPPORTED_TLDS]
): Promise<TldPricing[]> {
  if (!CONWAY_API_KEY) {
    return tlds.map((tld) => ({
      tld,
      basePrice: 9.99,
      kainovaPrice: applyFee(9.99),
    }));
  }

  const data = await conwayFetch("/tlds/pricing", { tlds });

  return data.results.map((r: { tld: string; price: number }) => ({
    tld: r.tld,
    basePrice: r.price,
    kainovaPrice: applyFee(r.price),
  }));
}
