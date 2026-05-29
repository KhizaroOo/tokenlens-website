import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import {
  EditorialPageHero, ExhibitLabel, IntegrationArtifactCard, CreativeCTA,
} from "@/components/marketing/gallery";
import { ProviderConstellation } from "@/components/marketing/ProviderConstellation";

export const metadata: Metadata = {
  title: "Integrations — TokenLens Provider Constellation",
  description:
    "Provider coverage across LLM APIs, developer AI tools, and business productivity AI. Coverage may vary by plan, API access, and customer environment.",
};

const LLM = [
  { providerKey: "anthropic", name: "Anthropic / Claude", category: "LLM API",
    status: "available" as const,
    examples: ["Token usage per user", "Cost per model", "Org-level aggregates", "Workspace members"] },
  { providerKey: "openai", name: "OpenAI", category: "LLM API",
    status: "in-progress" as const,
    examples: ["Token usage per user/model/project", "Project-level cost", "Daily buckets", "API keys list"] },
  { providerKey: "gemini", name: "Gemini", category: "LLM API",
    status: "limited" as const,
    examples: ["Per-call token counts (in response)", "Requires GCP Billing Export"] },
  { providerKey: "perplexity", name: "Perplexity", category: "LLM API",
    status: "limited" as const,
    examples: ["No admin usage API", "Enterprise webhook audit logs only"] },
];
const DEV = [
  { providerKey: "claude_code", name: "Claude Code", category: "Developer AI",
    status: "available" as const,
    examples: ["Sessions, commits, PRs", "Lines added/removed", "Tool acceptance rates"] },
  { providerKey: "github_copilot", name: "GitHub Copilot", category: "Developer AI",
    status: "in-progress" as const,
    examples: ["Total/active/inactive seats", "Acceptance rate per user", "28-day metrics"] },
  { providerKey: "cursor", name: "Cursor", category: "Developer AI",
    status: "in-progress" as const,
    examples: ["Member list with emails", "Daily lines + suggestions", "Per-user premium spend"] },
];
const BIZ = [
  { providerKey: "microsoft_copilot", name: "Microsoft 365 Copilot", category: "Business AI",
    status: "in-progress" as const,
    examples: ["Licensed seat count", "Active users per app", "Last activity per Office app"] },
];

export default function IntegrationsPage() {
  return (
    <>
      <EditorialPageHero
        exhibit="EXHIBIT 05"
        label="PROVIDER CONSTELLATION"
        title={
          <>
            Bring your AI stack
            <br />
            <span className="italic font-light">into one view.</span>
          </>
        }
        lead="TokenLens connects to the admin APIs of your AI providers — pulling usage, cost, and seat data into a normalized dashboard."
        kicker={"INTEGRATIONS\n8 PROVIDERS\n" + new Date().getFullYear()}
      />

      {/* Constellation */}
      <section className="pt-6 pb-16 lg:pb-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <ProviderConstellation />
        </div>
      </section>

      {/* LLM artifacts */}
      <section className="py-12 lg:py-20 border-t-2 border-[var(--sg-ink)]">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <ExhibitLabel label="LLM / API SPEND PROVIDERS" tone="signal" />
          <h2 className="mt-4 sg-display text-3xl lg:text-5xl text-[var(--sg-text)]">
            Token cost across every model you call.
          </h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LLM.map((p, i) => <IntegrationArtifactCard key={p.providerKey} index={i + 1} {...p} />)}
          </div>
        </div>
      </section>

      {/* Developer artifacts */}
      <section className="py-12 lg:py-20 bg-[var(--sg-panel)] border-y sg-line">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <ExhibitLabel label="DEVELOPER AI TOOLS" tone="anomaly" />
          <h2 className="mt-4 sg-display text-3xl lg:text-5xl text-[var(--sg-text)]">
            Engineering AI assistants in one view.
          </h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEV.map((p, i) => <IntegrationArtifactCard key={p.providerKey} index={i + 5} {...p} />)}
          </div>
        </div>
      </section>

      {/* Business artifacts */}
      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <ExhibitLabel label="BUSINESS PRODUCTIVITY AI" tone="lens" />
          <h2 className="mt-4 sg-display text-3xl lg:text-5xl text-[var(--sg-text)]">
            Business AI adoption + license utilization.
          </h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BIZ.map((p, i) => <IntegrationArtifactCard key={p.providerKey} index={i + 8} {...p} />)}
            <article className="border border-dashed sg-line p-6 flex flex-col justify-center items-center text-center min-h-[200px]">
              <span className="sg-caption text-[var(--sg-text-mute)]">№ 009</span>
              <p className="sg-display text-xl text-[var(--sg-text)] mt-3">More exhibits coming</p>
              <p className="text-xs text-[var(--sg-text-mute)] mt-1.5">Connector framework absorbs new providers as their APIs ship.</p>
            </article>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <div className="border-2 border-[var(--sg-budget)] p-6 bg-[var(--sg-panel)] flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[var(--sg-budget)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="sg-caption text-[var(--sg-budget)]">CURATOR&apos;S NOTE</p>
              <p className="mt-1 text-sm text-[var(--sg-text)] leading-relaxed">
                Provider coverage may vary by plan, API access, and customer environment. Gemini and Perplexity are marked Limited because neither exposes an aggregate admin usage API. We&apos;ll add real integrations as those APIs become available.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CreativeCTA
        title="Don't see your provider? Tell us."
        subtitle="The connector framework absorbs new providers as their admin APIs ship."
        primary={{ label: "Request integration", href: "/contact" }}
        secondary={{ label: "Book Demo", href: "/demo" }}
      />
    </>
  );
}
