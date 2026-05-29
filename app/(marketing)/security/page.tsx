import type { Metadata } from "next";
import { Lock, Building2, UserCheck, FileSearch, Eye, KeyRound, ServerCog, ShieldCheck } from "lucide-react";
import {
  EditorialPageHero, SecurityTrustPanel, CreativeCTA, ExhibitLabel,
} from "@/components/marketing/gallery";
import { FAQAccordion } from "@/components/marketing/FAQAccordion";

export const metadata: Metadata = {
  title: "Security — The vault behind the gallery",
  description:
    "Built with enterprise security principles. Encrypted credentials, organization-level scoping, role-based access, audit-ready architecture.",
};

const FAQ = [
  { q: "How are provider credentials stored?",       a: "Provider API keys and OAuth secrets are encrypted at rest using AES-256-GCM. The encryption key is stored in the application's environment, never alongside the encrypted data. Credentials are decrypted in memory only when a sync worker needs to call a provider API." },
  { q: "How is data isolated between organizations?",a: "Every database query in TokenLens is scoped by organization ID, enforced at the API layer via session middleware. Cross-organization data access is impossible by design." },
  { q: "What roles can users have?",                 a: "TokenLens supports three roles at the organization level: viewer (read-only), admin (manage connections + budgets + alert rules), and owner (full access including billing). Role-based access controls are enforced at every API route." },
  { q: "Is the application portal login-protected?", a: "Yes. The application portal requires authentication. Sessions are issued as httpOnly, secure, 7-day JWT cookies. The public marketing website is the only part of TokenLens that is unauthenticated." },
  { q: "Do you have SOC 2 or ISO 27001?",            a: "TokenLens is built on enterprise security principles. Formal certifications are a process that takes time; we'll update this page when certifications are issued. Talk to us about your specific compliance requirements." },
  { q: "Does TokenLens proxy provider traffic?",     a: "No. Sync workers run on TokenLens servers and call provider admin APIs directly using your encrypted credentials. We pull aggregate usage and cost metadata — never prompt text, code content, or AI responses." },
];

export default function SecurityPage() {
  return (
    <>
      <EditorialPageHero
        exhibit="EXHIBIT 07"
        label="THE VAULT BEHIND THE GALLERY"
        title={
          <>
            Built with <span className="italic font-light">enterprise security</span> principles.
          </>
        }
        lead="Encrypted credentials. Organization-level scoping. Role-based access. Audit-ready architecture. The application portal is login-protected — only the public marketing site is unauthenticated."
        kicker={"SECURITY\n8 PILLARS\n" + new Date().getFullYear()}
      />

      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <ExhibitLabel label="SECURITY PILLARS" tone="signal" />
          <h2 className="mt-4 sg-display text-3xl lg:text-5xl text-[var(--sg-text)] max-w-3xl">
            What you get <span className="italic font-light">out of the box.</span>
          </h2>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SecurityTrustPanel icon={Lock}        tone="signal"  title="Encrypted credentials"        body="Provider API keys encrypted at rest with AES-256-GCM. Key lives in env, not in the DB." />
            <SecurityTrustPanel icon={Building2}   tone="lens"    title="Organization isolation"       body="Every Prisma query is scoped by organization ID. Cross-tenant access is impossible by design." />
            <SecurityTrustPanel icon={UserCheck}   tone="anomaly" title="Role-based access"            body="Viewer / admin / owner roles enforced at every API route. Add/remove users with one click." />
            <SecurityTrustPanel icon={FileSearch}  tone="ink"     title="Audit-ready"                  body="Every admin action — credential rotation, budget change, sync — logged with actor + timestamp." />
            <SecurityTrustPanel icon={KeyRound}    tone="budget"  title="Least-privilege secrets"      body="Provider credentials require only read-level admin scopes. No write permissions ever requested." />
            <SecurityTrustPanel icon={ServerCog}   tone="signal"  title="Secure server-side sync"      body="Provider credentials are decrypted only inside sync workers. They never reach the browser." />
            <SecurityTrustPanel icon={Eye}         tone="lens"    title="Privacy-first analytics"      body="Metadata only — token counts, costs, model names, dates. Never prompt or response content." />
            <SecurityTrustPanel icon={ShieldCheck} tone="anomaly" title="Admin controls"               body="Per-provider sync controls, force-disconnect, credential rotation — all from Settings." />
          </div>
        </div>
      </section>

      {/* Never stored */}
      <section className="py-12 lg:py-20 bg-[var(--sg-panel)] border-y sg-line">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <ExhibitLabel label="PRIVACY BY DESIGN" tone="risk" />
          <h2 className="mt-4 sg-display text-3xl lg:text-5xl text-[var(--sg-text)] max-w-3xl">
            What TokenLens <span className="italic font-light line-through decoration-[1px] decoration-[var(--sg-risk)]/50">never</span> stores.
          </h2>
          <ul className="mt-10 grid md:grid-cols-2 gap-3 max-w-4xl">
            {[
              "Prompt text",
              "AI responses or completions",
              "Code content from coding assistants",
              "Document, email, or chat content (M365 Copilot)",
              "Raw provider API payloads",
              "Plaintext API keys or credentials",
              "Personal access tokens in plaintext",
              "OAuth refresh tokens",
            ].map(t => (
              <li key={t} className="flex items-start gap-3 border sg-line p-4 bg-[var(--sg-bg)]">
                <span aria-hidden className="mt-2 h-px w-4 bg-[var(--sg-risk)] flex-shrink-0" />
                <span className="text-sm text-[var(--sg-text-soft)] line-through decoration-[var(--sg-risk)]/40">{t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-[var(--sg-text-mute)] max-w-2xl leading-relaxed">
            <span className="text-[var(--sg-signal)]">Metadata only:</span> token counts, costs, model names, dates, user emails, team names, seat status. That&apos;s it.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <ExhibitLabel label="SECURITY Q&A" tone="signal" />
          <h2 className="mt-4 sg-display text-3xl lg:text-5xl text-[var(--sg-text)] max-w-3xl">
            Security questions, <span className="italic font-light">answered.</span>
          </h2>
          <div className="mt-10 max-w-3xl">
            <FAQAccordion items={FAQ} />
          </div>
        </div>
      </section>

      <CreativeCTA
        title="Bring your security review."
        subtitle="We'll walk through credential handling, data isolation, and audit logging on a live demo call."
        primary={{ label: "Talk to Sales", href: "/contact" }}
        secondary={{ label: "Book Demo", href: "/demo" }}
      />
    </>
  );
}
