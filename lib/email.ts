/**
 * Minimal email helper around Resend.
 *
 * Design principles:
 *   • Email is **never** required for lead capture to succeed.
 *   • Missing config (no `RESEND_API_KEY`, no `EMAIL_FROM`, no recipient)
 *     returns `{ sent: false, reason: "missing_config" }` — caller logs and
 *     moves on. No throw.
 *   • A transport error returns `{ sent: false, reason: "send_failed", error }`
 *     so the caller can persist the error message to the DB row (e.g.
 *     `notificationError`) for triage without exposing it to the client.
 *   • Secrets are never logged. Only the `reason` field is printed.
 */

import { Resend } from "resend";

export type SendResult =
  | { sent: true;  id: string }
  | { sent: false; reason: "missing_config"; missing: string[] }
  | { sent: false; reason: "send_failed";    error: string };

/** Lazy-init: only instantiate Resend when an API key is actually present. */
function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.trim().length === 0) return null;
  return new Resend(key);
}

/** Canonical "from" address — `EMAIL_FROM`, e.g. `TokenLens <noreply@tokenlens.io>`. */
function fromAddress(): string | null {
  const v = process.env.EMAIL_FROM;
  return v && v.trim().length > 0 ? v.trim() : null;
}

/**
 * Send a plain-text + simple-HTML email.
 * Returns a structured result — never throws.
 */
export async function sendEmail(opts: {
  to:       string;
  subject:  string;
  text:     string;
  html?:    string;
  replyTo?: string;
}): Promise<SendResult> {
  const missing: string[] = [];
  const client = getClient();
  if (!client) missing.push("RESEND_API_KEY");
  const from = fromAddress();
  if (!from) missing.push("EMAIL_FROM");
  if (!opts.to || opts.to.trim().length === 0) missing.push("to");

  if (missing.length > 0 || !client || !from) {
    return { sent: false, reason: "missing_config", missing };
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to:      opts.to,
      subject: opts.subject,
      text:    opts.text,
      html:    opts.html,
      replyTo: opts.replyTo,
    });

    if (error) {
      return { sent: false, reason: "send_failed", error: error.message ?? "unknown" };
    }
    return { sent: true, id: data?.id ?? "unknown" };
  } catch (err) {
    // Defensive: SDK should not throw on send, but treat any unexpected
    // exception as a send failure rather than a hard fault.
    const msg = err instanceof Error ? err.message : String(err);
    return { sent: false, reason: "send_failed", error: msg };
  }
}

/** Recipient for lead-capture notifications. Single source of truth. */
export function leadNotificationRecipient(): string | null {
  const v = process.env.LEAD_NOTIFICATION_EMAIL;
  return v && v.trim().length > 0 ? v.trim() : null;
}
