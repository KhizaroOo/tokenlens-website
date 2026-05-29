import type { Metadata } from "next";
import { EditorialPageHero, PlinthCard, CreativeCTA, ExhibitLabel } from "@/components/marketing/gallery";
import { FAQAccordion } from "@/components/marketing/FAQAccordion";

export const metadata: Metadata = {
  title: "Pricing — Choose your operating lens",
  description:
    "Three lenses for three stages of AI maturity. Talk to sales for custom pricing on your provider mix and seat count.",
};

const FAQ = [
  {
    q: "Which providers does TokenLens support?",
    a: "Anthropic Claude, Claude Code, OpenAI, GitHub Copilot, Cursor, and Microsoft 365 Copilot all have implemented connectors. Gemini and Perplexity are marked Limited because neither exposes an aggregate admin usage API. Coverage may vary by your subscription tier and tenant configuration.",
  },
  {
    q: "Is TokenLens only for LLM API spend?",
    a: "No. TokenLens covers three categories: LLM / API spend (Claude, OpenAI, Gemini, Perplexity), developer AI tools (Claude Code, GitHub Copilot, Cursor), and business productivity AI (Microsoft 365 Copilot). The dashboard normalizes all three into a single operating view.",
  },
  {
    q: "Can TokenLens track developer AI tools?",
    a: "Yes — Claude Code, GitHub Copilot, and Cursor each have implemented connectors. You get seat utilization, acceptance rates, per-team adoption, and per-user activity from real admin API data, not estimates.",
  },
  {
    q: "Can finance teams use TokenLens?",
    a: "TokenLens is explicitly built for finance and FinOps as well as engineering. Per-team cost allocation, scheduled CSV/PDF reports, and budget burn-down views are core features — not afterthoughts.",
  },
  {
    q: "Is the application secure?",
    a: "Provider credentials are encrypted at rest using AES-256-GCM. The application portal is login protected with JWT-based session cookies. All database queries are scoped by organization ID, and every credential storage path goes through encrypted handlers.",
  },
  {
    q: "Do you support custom integrations?",
    a: "Enterprise plans include custom provider connectors. If a provider ships an admin API, our connector framework can typically support it within weeks. Contact sales to discuss your stack.",
  },
];

export default function PricingPage() {
  return (
    <>
      <EditorialPageHero
        exhibit="EXHIBIT 06"
        label="CHOOSE YOUR LENS"
        title={
          <>
            Predictable pricing for
            <br />
            <span className="italic font-light">predictable AI spend.</span>
          </>
        }
        lead="Three lenses, scaled to your AI maturity. Talk to sales for custom pricing on your provider mix and seat count."
        kicker={"PRICING\n3 EDITIONS\n" + new Date().getFullYear()}
      />

      {/* Plinths */}
      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-end">
            <PlinthCard
              tag="EDITION 01 / STARTER"
              name="Starter"
              blurb="Visibility for teams beginning AI spend control."
              cta={{ label: "Book Demo", href: "/demo" }}
              secondaryCta={{ label: "Talk to Sales", href: "/contact" }}
              features={[
                "Core dashboard",
                "Up to 3 providers connected",
                "User & team usage breakdown",
                "Monthly executive reports",
                "Basic budget tracking",
                "Email support",
              ]}
            />
            <PlinthCard
              tag="EDITION 02 / GROWTH"
              name="Growth"
              featured
              blurb="The operating layer for scaling multi-provider AI adoption."
              cta={{ label: "Book Demo", href: "/demo" }}
              secondaryCta={{ label: "Talk to Sales", href: "/contact" }}
              features={[
                "Everything in Starter",
                "Multi-provider analytics (all 8 providers)",
                "Team-level cost allocation",
                "Developer AI tool analytics",
                "LLM/API spend breakdown by model",
                "Budget alerts + anomaly detection",
                "Provider comparison reports",
                "Priority support",
              ]}
            />
            <PlinthCard
              tag="EDITION 03 / ENTERPRISE"
              name="Enterprise"
              blurb="Governance, control, and reporting for company-wide AI operations."
              cta={{ label: "Talk to Sales", href: "/contact" }}
              secondaryCta={{ label: "Book Demo", href: "/demo" }}
              features={[
                "Everything in Growth",
                "SSO / SAML-ready positioning",
                "Advanced governance + RBAC",
                "Tamper-evident audit logs",
                "Custom provider connectors",
                "Department-level access control",
                "Custom-branded reports",
                "Dedicated CSM",
                "SLA-backed support",
              ]}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 lg:py-20 bg-[var(--sg-panel)] border-y sg-line">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <ExhibitLabel label="CURATOR Q&A" tone="lens" />
          <h2 className="mt-4 sg-display text-3xl lg:text-5xl text-[var(--sg-text)] max-w-3xl">
            Common questions <span className="italic font-light">before talking to sales.</span>
          </h2>
          <div className="mt-10 max-w-3xl">
            <FAQAccordion items={FAQ} />
          </div>
        </div>
      </section>

      <CreativeCTA
        title="Ready to talk pricing?"
        subtitle="Twenty-minute demo. Then a custom quote based on your provider count and seat numbers."
        primary={{ label: "Talk to Sales", href: "/contact" }}
        secondary={{ label: "Book Demo", href: "/demo" }}
      />
    </>
  );
}
