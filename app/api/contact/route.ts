import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { clientIp, hashIp } from "@/lib/ip-hash";
import { sendEmail, leadNotificationRecipient } from "@/lib/email";

/**
 * POST /api/contact — public endpoint.
 *
 * - Validates with zod (name, workEmail, message required; rest optional).
 * - Honeypot: hidden `website` field. If filled, return a safe 200 success
 *   without storing anything — bots see the same response a human sees.
 * - Rate-limited (5/min/IP) via the existing `checkRateLimit` util.
 * - Persists to `ContactSubmission` (workEmail, company, role, etc.).
 * - **No raw IP is stored** — only a SHA-256(`IP + JWT_SECRET`) fingerprint.
 * - **No email is sent.** Submissions live in Postgres until an email
 *   provider is configured. Sales team must triage from there.
 */

const schema = z.object({
  name:        z.string().trim().min(1).max(200),
  workEmail:   z.string().trim().toLowerCase().email().max(254),
  company:     z.string().trim().max(200).optional().or(z.literal("")),
  role:        z.string().trim().max(200).optional().or(z.literal("")),
  companySize: z.string().trim().max(50).optional().or(z.literal("")),
  aiToolsUsed: z.string().trim().max(2000).optional().or(z.literal("")),
  message:     z.string().trim().min(1).max(10000),
  // Honeypot — must be empty. Bots auto-fill anything that looks like a URL field.
  website:     z.string().max(500).optional().or(z.literal("")),
});

const SAFE_SUCCESS = {
  success: true,
  message: "Message received. Our team will review it and respond soon.",
} as const;

const blank = (v: string | undefined | null): string | null =>
  v && v.length > 0 ? v : null;

export async function POST(req: NextRequest) {
  // 1 · Rate limit (5 submissions / minute / IP)
  const ip = clientIp(req) ?? "unknown";
  const rl = checkRateLimit(`contact:${ip}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many submissions. Please try again shortly." },
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

  // 3 · Honeypot — if filled, pretend everything is fine and silently drop.
  //     This is deliberate: returning 400 would teach bots to skip the field.
  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return NextResponse.json(SAFE_SUCCESS, { status: 200 });
  }

  const { name, workEmail, company, role, companySize, aiToolsUsed, message } = parsed.data;

  // 4 · Persist (must succeed before we attempt anything else)
  let row: { id: string; createdAt: Date };
  try {
    row = await prisma.contactSubmission.create({
      data: {
        name,
        workEmail,
        company:     blank(company),
        role:        blank(role),
        companySize: blank(companySize),
        aiToolsUsed: blank(aiToolsUsed),
        message,
        source:      req.headers.get("referer"),
        userAgent:   req.headers.get("user-agent"),
        ipHash:      hashIp(ip),
      },
      select: { id: true, createdAt: true },
    });
  } catch (err) {
    console.error("[POST /api/contact] persistence error", err);
    return NextResponse.json(
      { success: false, error: "Could not save submission. Please email us at sales@tokenlens.io." },
      { status: 500 }
    );
  }

  // 5 · Best-effort email notification — NEVER blocks lead capture.
  //     If RESEND_API_KEY / EMAIL_FROM / LEAD_NOTIFICATION_EMAIL are unset,
  //     sendEmail returns `{ sent:false, reason:"missing_config" }`. We
  //     record the outcome on the row for triage but always return success.
  void notifyContact(row.id, row.createdAt, {
    name, workEmail, company: blank(company), role: blank(role),
    companySize: blank(companySize), aiToolsUsed: blank(aiToolsUsed), message,
  });

  return NextResponse.json(SAFE_SUCCESS, { status: 200 });
}

/**
 * Fire-and-forget email notifier for new contact submissions.
 * Updates the row with notificationSentAt / notificationError outcome.
 * Errors are swallowed — the user has already seen a success response.
 */
async function notifyContact(
  id:        string,
  createdAt: Date,
  data: {
    name:        string;
    workEmail:   string;
    company:     string | null;
    role:        string | null;
    companySize: string | null;
    aiToolsUsed: string | null;
    message:     string;
  }
): Promise<void> {
  const recipient = leadNotificationRecipient();
  if (!recipient) {
    console.warn("[POST /api/contact] LEAD_NOTIFICATION_EMAIL not set — skipping email notification (row id:", id, ")");
    await prisma.contactSubmission.update({
      where: { id },
      data:  { notificationError: "missing_config:LEAD_NOTIFICATION_EMAIL" },
    }).catch(() => {});
    return;
  }

  const subjectLabel = data.company ?? data.name;
  const subject      = `New TokenLens contact submission — ${subjectLabel}`;
  const lines = [
    `Source:        /contact`,
    `Submission id: ${id}`,
    `Received:      ${createdAt.toISOString()}`,
    ``,
    `Name:          ${data.name}`,
    `Work email:    ${data.workEmail}`,
    `Company:       ${data.company ?? "—"}`,
    `Role:          ${data.role ?? "—"}`,
    `Company size:  ${data.companySize ?? "—"}`,
    `AI tools used: ${data.aiToolsUsed ?? "—"}`,
    ``,
    `Message:`,
    data.message,
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
    await prisma.contactSubmission.update({
      where: { id },
      data:  { notificationSentAt: new Date(), notificationError: null },
    }).catch(() => {});
  } else if (result.reason === "missing_config") {
    console.warn(`[POST /api/contact] email skipped — missing config: ${result.missing.join(", ")} (row id: ${id})`);
    await prisma.contactSubmission.update({
      where: { id },
      data:  { notificationError: `missing_config:${result.missing.join(",")}` },
    }).catch(() => {});
  } else {
    console.warn(`[POST /api/contact] email send_failed (row id: ${id}): ${result.error}`);
    await prisma.contactSubmission.update({
      where: { id },
      data:  { notificationError: `send_failed:${result.error}`.slice(0, 500) },
    }).catch(() => {});
  }
}

// Reject other methods explicitly — never imply a successful submission.
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
