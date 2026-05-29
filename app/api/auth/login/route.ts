import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateCredentials, getUserMembership, signToken, setSessionCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

export async function POST(req: NextRequest) {
  // Rate limit: 10 attempts per minute per IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit(`login:${ip}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await validateCredentials(email, password);
  if (!user) {
    // Constant-time response to prevent timing attacks
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const membership = await getUserMembership(user.id);
  if (!membership) {
    return NextResponse.json({ error: "No organization found" }, { status: 403 });
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    organizationId: membership.organizationId,
    role: membership.role,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(setSessionCookie(token));
  return response;
}
