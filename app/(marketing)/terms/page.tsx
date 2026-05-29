import type { Metadata } from "next";
import { ExhibitLabel } from "@/components/marketing/gallery";

export const metadata: Metadata = {
  title: "Terms of Service — TokenLens",
  description: "Terms governing use of TokenLens.",
};

const LAST_UPDATED = "May 2026";

const SECTIONS = [
  { h: "Use of service",            p: ["By creating a TokenLens account, you agree to use the service in compliance with applicable law and these terms. The service is provided to organizations for monitoring AI spend, adoption, and governance.", "TokenLens reserves the right to update these terms. Material changes will be communicated to customers via email or in-product notification."] },
  { h: "Customer responsibilities", p: ["Customers are responsible for managing user access to their organization workspace, the security of credentials they provide to TokenLens, and ensuring their use of TokenLens complies with their internal policies and applicable regulations.", "Customers are responsible for compliance with each upstream provider's terms of service when using TokenLens to access provider APIs."] },
  { h: "Account access",            p: ["TokenLens accounts use role-based access (viewer, admin, owner). Account owners are responsible for keeping their credentials secure and notifying TokenLens promptly of any suspected unauthorized access."] },
  { h: "Provider integrations",     p: ["TokenLens connects to third-party provider admin APIs using credentials supplied by the customer. The customer represents that they have the authority to grant TokenLens access to those providers.", "Provider integration coverage may vary based on each vendor's API capabilities, the customer's subscription tier with that provider, and the customer's tenant configuration."] },
  { h: "Acceptable use",            p: ["Customers may not use TokenLens to (a) circumvent provider terms of service, (b) attempt to access data belonging to other customers, (c) reverse-engineer the service, or (d) use the service for any unlawful purpose."] },
  { h: "Limitations and disclaimers",p:["TokenLens is provided on an as-available basis. Provider data accuracy depends on upstream provider APIs; TokenLens displays the data those APIs return.", "To the maximum extent permitted by law, TokenLens disclaims warranties not expressly granted in a signed agreement, and liability is limited to amounts paid in the twelve months preceding any claim.", "These terms are a clear summary. A complete enterprise master services agreement is available for review during sales discussions."] },
  { h: "Contact",                   p: ["Questions about these terms: legal@tokenlens.io. For all other inquiries see the Contact page."] },
];

export default function TermsPage() {
  return (
    <>
      <section className="pt-20 lg:pt-28 pb-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-9">
              <div className="flex items-baseline gap-4">
                <span className="sg-number text-5xl lg:text-7xl font-black text-[var(--sg-text)]">LEGAL 02</span>
                <ExhibitLabel label="POLICY" tone="lens" />
              </div>
              <h1 className="sg-display text-5xl lg:text-7xl text-[var(--sg-text)] mt-8">
                Terms of <span className="italic font-light">Service.</span>
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
            These Terms of Service govern access to and use of TokenLens. By using the service, you agree to these terms. For specific contractual questions, contact <span className="text-[var(--sg-signal)]">legal@tokenlens.io</span>.
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
