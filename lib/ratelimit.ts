import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

type Action = "register" | "review";

const LIMITS: Record<Action, { requests: number; window: `${number} ${"s" | "m" | "h" | "d"}` }> = {
  register: { requests: 5, window: "1 h" },
  review: { requests: 10, window: "1 h" },
};

function makeLimiter(action: Action): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const { requests, window } = LIMITS[action];
  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `kbite:rl:${action}`,
  });
}

export async function checkRateLimit(
  action: Action,
): Promise<{ ok: boolean }> {
  const limiter = makeLimiter(action);
  if (!limiter) return { ok: true }; // graceful skip in dev / unconfigured

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";

  const { success } = await limiter.limit(ip);
  return { ok: success };
}
