import type { Metadata } from "next";
import { ExhibitLabel } from "@/components/marketing/gallery";

export const metadata: Metadata = {
  title: "Privacy Policy — TokenLens",
  description: "How TokenLens collects, uses, and protects information.",
};

const LAST_UPDATED = "May 2026";

const SECTIONS = [
  { h: "Information we collect",  p: ["TokenLens collects information that customers provide directly when they create an account and use the product. This includes account information (name, email, organization), provider credentials, and configuration data such as budgets, alert rules, and team mappings.", "We also collect operational telemetry — sync run logs, error messages, and performance metrics — that help us operate the service reliably."] },
  { h: "How we use information",  p: ["We use customer information to authenticate users, deliver the product, sync usage data from connected providers, and provide support. Operational telemetry helps us debug issues and improve reliability.", "We do not sell customer information or share it with third parties for marketing purposes."] },
  { h: "Provider data",           p: ["Provider API credentials are encrypted at rest using AES-256-GCM. They are decrypted only inside server-side sync workers when calling provider APIs, and they never reach the browser.", "Provider usage data — token counts, costs, model names, dates, user emails, seat status — is stored as metadata only. We do not store prompt text, AI responses, code content, or any payload data."] },
  { h: "Security",                p: ["Provider credentials encrypted with AES-256-GCM. Sessions issued as httpOnly JWT cookies. Database queries scoped by organization ID at the API layer. Role-based access controls enforce least-privilege.", "We follow enterprise security principles. Formal certifications are an ongoing process — contact us for our current status and any required vendor assessments."] },
  { h: "Data retention",          p: ["Customer account data and provider configuration are retained for the duration of the customer relationship. Usage metadata is retained per the customer's data retention policy (configurable in Settings, default 365 days). Audit logs are retained for at least 365 days.", "Customers may request export or deletion of their data at any time by contacting support."] },
  { h: "Customer rights",         p: ["Customers have the right to access, correct, export, or delete the information we hold about them. Account owners and admins can manage user access from the Settings page. To exercise data subject rights more broadly, contact privacy@tokenlens.io."] },
  { h: "Contact",                 p: ["For privacy-related questions, contact privacy@tokenlens.io. For general inquiries, see the Contact page."] },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="pt-20 lg:pt-28 pb-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-9">
              <div className="flex items-baseline gap-4">
                <span className="sg-number text-5xl lg:text-7xl font-black text-[var(--sg-text)]">LEGAL 01</span>
                <ExhibitLabel label="POLICY" tone="lens" />
              </div>
              <h1 className="sg-display text-5xl lg:text-7xl text-[var(--sg-text)] mt-8">
                Privacy <span className="italic font-light">Policy.</span>
              </h1>
            </div>
            <div className="lg:col-span-3 lg:text-right">
              <p className="sg-caption text-[var(--sg-text-mute)]">LAST UPDATED · {LAST_UPDATED}</p>
            </div>
          </div>
          <div className="mt-10 h-px bg-[var(--sg-line)]" />
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-3xl px-5 lg:px-10">
          <p className="text-base text-[var(--sg-text-soft)] leading-relaxed">
            This Privacy Policy explains how TokenLens collects, uses, and protects information. It is provided as a clear, practical summary of our practices. For specific legal questions, contact <span className="text-[var(--sg-signal)]">privacy@tokenlens.io</span>.
          </p>
          {SECTIONS.map((s, i) => (
            <section key={s.h} className="mt-12">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="sg-number text-xs text-[var(--sg-text-mute)]">§ {String(i + 1).padStart(2, "0")}</span>
                <h2 className="text-xl font-bold text-[var(--sg-text)]">{s.h}</h2>
              </div>
              {s.p.map((para, j) => (
                <p key={j} className="mt-3 text-sm text-[var(--sg-text-soft)] leading-relaxed">{para}</p>
              ))}
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
