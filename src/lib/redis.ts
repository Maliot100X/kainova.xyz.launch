import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export const redis = createRedis();

type WindowString = `${number} ms` | `${number} s` | `${number} m` | `${number} h` | `${number} d`;

function parseWindow(window: string): WindowString {
  const match = window.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) return "60 s";
  return `${match[1]} ${match[2]}` as WindowString;
}

export async function rateLimit(
  identifier: string,
  limit: number,
  window: string
): Promise<{ success: boolean; remaining: number }> {
  if (!redis) {
    return { success: true, remaining: limit };
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, parseWindow(window)),
    prefix: "kainova:rl",
  });

  const result = await limiter.limit(identifier);
  return { success: result.success, remaining: result.remaining };
}
