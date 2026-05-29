import { createHash } from "node:crypto";

/**
 * Privacy-preserving IP fingerprint.
 *
 * Hashes the client IP with the server-side `JWT_SECRET` as salt so the same
 * IP yields the same fingerprint *within* this deployment (useful for
 * dedup/abuse detection) but cannot be reversed to a raw address even if the
 * database leaks. The salt is intentionally a secret that never lands in any
 * row.
 *
 * Returns `null` if there is no usable IP or no salt.
 */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip || ip === "unknown") return null;
  const salt = process.env.JWT_SECRET ?? process.env.ENCRYPTION_KEY;
  if (!salt) return null;
  return createHash("sha256").update(`${ip}|${salt}`).digest("hex").slice(0, 32);
}

/**
 * Pull the request IP from common proxy headers.
 * Trims to the first value in a comma-separated list (left-most = client).
 */
export function clientIp(req: { headers: Headers }): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || null;
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim() || null;
  return null;
}
