import rateLimit from "express-rate-limit";

export function endpointRateLimit({ windowMs = 60_000, max = 60 }: { windowMs?: number; max?: number } = {}) {
  return rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false });
}
