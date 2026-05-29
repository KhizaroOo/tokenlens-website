import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { clientIp, hashIp } from "@/lib/ip-hash";
import { sendEmail, leadNotificationRecipient } from "@/lib/email";

/**
 * POST /api/demo-request — public endpoint.
 *
 * - Validates with zod (name, workEmail, company required; rest optional).
 * - Honeypot: hidden `website` field. If filled, return a safe 200 success
 *   without storing — bots see the same response a human sees.
 * - Rate-limited (5/min/IP) via the existing `checkRateLimit` util.
 * - Persists to `DemoRequest`. **No calendar booking is wired** — sales
 *   contacts the submitter manually based on `preferredTime` text.
 * - **No raw IP is stored** — only a SHA-256(`IP + JWT_SECRET`) fingerprint.
 * - **No email is sent.** Submissions live in Postgres until an email
 *   provider is configured.
 */

const schema = z.object({
  name:          z.string().trim().min(1).max(200),
  workEmail:     z.string().trim().toLowerCase().email().max(254),
  company:       z.string().trim().min(1).max(200),
  role:          z.string().trim().max(200).optional().or(z.literal("")),
  companySize:   z.string().trim().max(50).optional().or(z.literal("")),
  aiToolsUsed:   z.string().trim().max(2000).optional().or(z.literal("")),
  preferredTime: z.string().trim().max(500).optional().or(z.literal("")),
  message:       z.string().trim().max(10000).optional().or(z.literal("")),
  // Honeypot
  website:       z.string().max(500).optional().or(z.literal("")),
});

const SAFE_SUCCESS = {
  success: true,
  message: "Demo request received. Our team will contact you to schedule a time.",
} as const;

const blank = (v: string | undefined | null): string | null =>
  v && v.length > 0 ? v : null;

export async function POST(req: NextRequest) {
  // 1 · Rate limit
  const ip = clientIp(req) ?? "unknown";
  const rl = checkRateLimit(`demo-request:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  // 2 · Parse + validate
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // 3 · Honeypot
  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return NextResponse.json(SAFE_SUCCESS, { status: 200 });
  }

  const { name, workEmail, company, role, companySize, aiToolsUsed, preferredTime, message } = parsed.data;

  // 4 · Persist (must succeed before anything else)
  let row: { id: string; createdAt: Date };
  try {
    row = await prisma.demoRequest.create({
      data: {
        name,
        workEmail,
        company,
        role:          blank(role),
        companySize:   blank(companySize),
        aiToolsUsed:   blank(aiToolsUsed),
        preferredTime: blank(preferredTime),
        message:       blank(message),
        source:        req.headers.get("referer"),
        userAgent:     req.headers.get("user-agent"),
        ipHash:        hashIp(ip),
      },
      select: { id: true, createdAt: true },
    });
  } catch (err) {
    console.error("[POST /api/demo-request] persistence error", err);
    return NextResponse.json(
      { success: false, error: "Could not save request. Please email us at sales@tokenlens.io." },
      { status: 500 }
    );
  }

  // 5 · Best-effort email notification — NEVER blocks lead capture.
  void notifyDemo(row.id, row.createdAt, {
    name, workEmail, company,
    role: blank(role), companySize: blank(companySize),
    aiToolsUsed: blank(aiToolsUsed), preferredTime: blank(preferredTime),
    message: blank(message),
  });

  return NextResponse.json(SAFE_SUCCESS, { status: 200 });
}

/**
 * Fire-and-forget email notifier for new demo requests.
 * Updates the row with notificationSentAt / notificationError outcome.
 */
async function notifyDemo(
  id:        string,
  createdAt: Date,
  data: {
    name:          string;
    workEmail:     string;
    company:       string;
    role:          string | null;
    companySize:   string | null;
    aiToolsUsed:   string | null;
    preferredTime: string | null;
    message:       string | null;
  }
): Promise<void> {
  const recipient = leadNotificationRecipient();
  if (!recipient) {
    console.warn("[POST /api/demo-request] LEAD_NOTIFICATION_EMAIL not set — skipping email notification (row id:", id, ")");
    await prisma.demoRequest.update({
      where: { id },
      data:  { notificationError: "missing_config:LEAD_NOTIFICATION_EMAIL" },
    }).catch(() => {});
    return;
  }

  const subject = `New TokenLens demo request — ${data.company}`;
  const lines = [
    `Source:         /demo`,
    `Request id:     ${id}`,
    `Received:       ${createdAt.toISOString()}`,
    ``,
    `Name:           ${data.name}`,
    `Work email:     ${data.workEmail}`,
    `Company:        ${data.company}`,
    `Role:           ${data.role ?? "—"}`,
    `Company size:   ${data.companySize ?? "—"}`,
    `AI tools used:  ${data.aiToolsUsed ?? "—"}`,
    `Preferred time: ${data.preferredTime ?? "—"}`,
    ``,
    `Message:`,
    data.message ?? "(none)",
  ];
  const text = lines.join("\n");
  const html = `<pre style="font-family:JetBrains Mono,Menlo,Consolas,monospace;font-size:13px;white-space:pre-wrap;">${
    text.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!))
  }</pre>`;

  const result = await sendEmail({
    to:      recipient,
    subject,
    text,
    html,
    replyTo: data.workEmail,
  });

  if (result.sent) {
    await prisma.demoRequest.update({
      where: { id },
      data:  { notificationSentAt: new Date(), notificationError: null },
    }).catch(() => {});
  } else if (result.reason === "missing_config") {
    console.warn(`[POST /api/demo-request] email skipped — missing config: ${result.missing.join(", ")} (row id: ${id})`);
    await prisma.demoRequest.update({
      where: { id },
      data:  { notificationError: `missing_config:${result.missing.join(",")}` },
    }).catch(() => {});
  } else {
    console.warn(`[POST /api/demo-request] email send_failed (row id: ${id}): ${result.error}`);
    await prisma.demoRequest.update({
      where: { id },
      data:  { notificationError: `send_failed:${result.error}`.slice(0, 500) },
    }).catch(() => {});
  }
}

function methodNotAllowed() {
  return NextResponse.json(
    { success: false, error: "Method Not Allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
export const GET    = methodNotAllowed;
export const PUT    = methodNotAllowed;
export const PATCH  = methodNotAllowed;
export const DELETE = methodNotAllowed;
