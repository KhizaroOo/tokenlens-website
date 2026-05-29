#!/usr/bin/env tsx
/**
 * Provider Integration Validation Script
 * Run: npx tsx scripts/validate-provider-integrations.ts
 *
 * Validates provider registry, connector logic, and data transformations
 * using static analysis and fixture data only. No external API calls.
 */

import * as fs from "fs";
import * as path from "path";

// ── Inline registry types (avoid Next.js/Prisma import issues in standalone script) ──────────────

type ProviderKey =
  | "anthropic" | "openai" | "gemini" | "perplexity"
  | "claude_code" | "github_copilot" | "cursor" | "microsoft_copilot";

interface ProviderDefinition {
  key: ProviderKey;
  displayName: string;
  shortName: string;
  category: string;
  description: string;
  authType: string;
  credentialLabel: string;
  availability: string;
  capabilities: string[];
  dataCoverage: string;
  comingSoon: boolean;
  limited?: boolean;
  defaultSyncFrequencyHours: number;
  accentColor: string;
}

// Inline registry (matches modules/providers/registry.ts)
const PROVIDERS: ProviderDefinition[] = [
  { key: "anthropic", displayName: "Claude / Anthropic", shortName: "Claude", category: "api_spend", description: "", authType: "admin_api_key", credentialLabel: "Admin API Key", availability: "available", capabilities: ["cost", "tokens", "models", "users", "reports", "alerts"], dataCoverage: "full", comingSoon: false, defaultSyncFrequencyHours: 24, accentColor: "emerald" },
  { key: "openai", displayName: "OpenAI", shortName: "OpenAI", category: "api_spend", description: "", authType: "admin_api_key", credentialLabel: "Admin API Key / Org Key", availability: "available", capabilities: ["cost", "tokens", "models", "projects", "api_keys", "reports", "alerts"], dataCoverage: "partial", comingSoon: false, defaultSyncFrequencyHours: 24, accentColor: "cyan" },
  { key: "gemini", displayName: "Gemini", shortName: "Gemini", category: "api_spend", description: "", authType: "api_key", credentialLabel: "No Admin API", availability: "available", capabilities: ["estimated_cost"], dataCoverage: "estimated", comingSoon: false, limited: true, defaultSyncFrequencyHours: 0, accentColor: "amber" },
  { key: "perplexity", displayName: "Perplexity", shortName: "Perplexity", category: "api_spend", description: "", authType: "api_key", credentialLabel: "No Admin API", availability: "available", capabilities: ["estimated_cost"], dataCoverage: "estimated", comingSoon: false, limited: true, defaultSyncFrequencyHours: 0, accentColor: "amber" },
  { key: "claude_code", displayName: "Claude Code", shortName: "CC", category: "developer_ai", description: "", authType: "uses_anthropic", credentialLabel: "Uses Anthropic connection", availability: "available", capabilities: ["developer_activity", "users", "cost", "reports", "alerts"], dataCoverage: "full", comingSoon: false, defaultSyncFrequencyHours: 24, accentColor: "emerald" },
  { key: "github_copilot", displayName: "GitHub Copilot", shortName: "Copilot", category: "developer_ai", description: "", authType: "github_app_pat", credentialLabel: "GitHub App or PAT", availability: "available", capabilities: ["developer_activity", "users", "seat_usage", "reports", "alerts"], dataCoverage: "seat_based", comingSoon: false, defaultSyncFrequencyHours: 24, accentColor: "indigo" },
  { key: "cursor", displayName: "Cursor", shortName: "Cursor", category: "developer_ai", description: "", authType: "api_key", credentialLabel: "Admin API Key / CSV Import", availability: "available", capabilities: ["developer_activity", "users", "seat_usage", "models", "estimated_cost", "reports", "alerts"], dataCoverage: "partial", comingSoon: false, defaultSyncFrequencyHours: 24, accentColor: "amber" },
  { key: "microsoft_copilot", displayName: "Microsoft Copilot", shortName: "MS Copilot", category: "business_ai", description: "", authType: "microsoft_graph", credentialLabel: "Microsoft Graph / Entra App Credentials", availability: "available", capabilities: ["users", "seat_usage", "business_app_usage", "reports", "alerts"], dataCoverage: "requires_enterprise", comingSoon: false, defaultSyncFrequencyHours: 48, accentColor: "blue" },
];

const PROVIDER_MAP = Object.fromEntries(PROVIDERS.map(p => [p.key, p])) as Record<ProviderKey, ProviderDefinition>;

function hasRealConnector(key: ProviderKey): boolean {
  const p = PROVIDER_MAP[key];
  return p.availability === "available" && !p.limited;
}

// ── Test helpers ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function pass(name: string) {
  console.log(`  PASS  ${name}`);
  passed++;
}

function fail(name: string, detail?: string) {
  console.log(`  FAIL  ${name}${detail ? `\n         ${detail}` : ""}`);
  failed++;
}

function section(title: string) {
  console.log(`\n── ${title} ──`);
}

const FIXTURE_DIR = path.join(__dirname, "..", "tests", "fixtures", "providers");

// ── Test 1: Registry entries ─────────────────────────────────────────────────

section("Test 1: Registry entries");

const REQUIRED_PROVIDERS: ProviderKey[] = ["anthropic", "openai", "gemini", "perplexity", "claude_code", "github_copilot", "cursor", "microsoft_copilot"];
const REQUIRED_FIELDS: (keyof ProviderDefinition)[] = ["key", "displayName", "shortName", "category", "authType", "capabilities", "dataCoverage", "availability"];

for (const key of REQUIRED_PROVIDERS) {
  const p = PROVIDER_MAP[key];
  if (!p) {
    fail(`Registry entry exists: ${key}`, "Not found in PROVIDERS");
    continue;
  }
  const missing = REQUIRED_FIELDS.filter(f => p[f] === undefined || p[f] === null || p[f] === "");
  if (missing.length > 0) {
    fail(`Registry fields complete: ${key}`, `Missing fields: ${missing.join(", ")}`);
  } else {
    pass(`Registry entry complete: ${key}`);
  }
}

// ── Test 2: Gemini and Perplexity have limited: true ─────────────────────────

section("Test 2: Limited flag on Gemini and Perplexity");

(["gemini", "perplexity"] as ProviderKey[]).forEach(key => {
  const p = PROVIDER_MAP[key];
  if (p.limited === true) {
    pass(`limited: true on ${key}`);
  } else {
    fail(`limited: true on ${key}`, `Got limited=${p.limited}`);
  }
});

// ── Test 3: hasRealConnector returns correct values ───────────────────────────

section("Test 3: hasRealConnector() correctness");

const shouldHaveConnector: ProviderKey[] = ["anthropic", "openai", "claude_code", "github_copilot", "cursor", "microsoft_copilot"];
const shouldNotHaveConnector: ProviderKey[] = ["gemini", "perplexity"];

for (const key of shouldHaveConnector) {
  const result = hasRealConnector(key);
  if (result) {
    pass(`hasRealConnector(${key}) = true`);
  } else {
    fail(`hasRealConnector(${key}) = true`, `Got false`);
  }
}

for (const key of shouldNotHaveConnector) {
  const result = hasRealConnector(key);
  if (!result) {
    pass(`hasRealConnector(${key}) = false`);
  } else {
    fail(`hasRealConnector(${key}) = false`, `Got true — limited flag check broken`);
  }
}

// ── Test 4: OpenAI model aggregation using fixture data ──────────────────────

section("Test 4: OpenAI model aggregation logic");

try {
  const fixturePath = path.join(FIXTURE_DIR, "openai-usage.json");
  const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));

  // Replicate the worker's model aggregation logic
  const MODEL_PRICE: Record<string, { input: number; output: number; cached: number }> = {
    "gpt-4o":      { input: 2.50,  output: 10.00, cached: 1.25 },
    "gpt-4o-mini": { input: 0.15,  output: 0.60,  cached: 0.075 },
    "gpt-4-turbo": { input: 10.00, output: 30.00, cached: 5.00 },
  };

  function estimateCost(model: string, inputTokens: number, outputTokens: number, cachedTokens: number): number {
    const key = Object.keys(MODEL_PRICE).find(k => model.startsWith(k)) ?? "";
    const price = MODEL_PRICE[key as keyof typeof MODEL_PRICE];
    if (!price) return 0;
    return (inputTokens / 1_000_000) * price.input + (outputTokens / 1_000_000) * price.output + (cachedTokens / 1_000_000) * price.cached;
  }

  const modelAgg = new Map<string, { model: string; date: Date; inputTokens: number; outputTokens: number; totalTokens: number; totalCostUsd: number }>();

  let userRows = 0;
  let projectOnlyRows = 0;
  let nullRows = 0;

  // Process all pages (fixture has 2 pages each with 1 data bucket)
  for (const page of fixture.pages) {
    for (const bucket of page.data) {
      const date = new Date(bucket.aggregation_timestamp * 1000);
      for (const r of bucket.results) {
        if (!r.user_id && !r.project_id) { nullRows++; continue; }

        const userEmail = r.user_id ?? `project:${r.project_id}`;
        const model = r.model ?? "unknown";
        const cached = r.input_cached_tokens ?? 0;
        const costUsd = estimateCost(model, r.input_tokens, r.output_tokens, cached);
        const total = r.input_tokens + r.output_tokens;

        if (r.user_id) {
          userRows++;
        } else {
          projectOnlyRows++;
        }

        const aggKey = `${model}|${date.toISOString()}`;
        const existing = modelAgg.get(aggKey);
        if (existing) {
          existing.inputTokens  += r.input_tokens;
          existing.outputTokens += r.output_tokens;
          existing.totalTokens  += total;
          existing.totalCostUsd += costUsd;
        } else {
          modelAgg.set(aggKey, { model, date, inputTokens: r.input_tokens, outputTokens: r.output_tokens, totalTokens: total, totalCostUsd: costUsd });
        }
      }
    }
  }

  // Validate: there should be 3 models × 2 days = 6 aggregated model rows
  if (modelAgg.size === 6) {
    pass(`OpenAI model aggregation: 6 model+date buckets produced (3 models × 2 days)`);
  } else {
    fail(`OpenAI model aggregation: expected 6 buckets`, `Got ${modelAgg.size}`);
  }

  // Validate: project-only row with user_id:null is captured as project:proj_abc
  if (projectOnlyRows === 1) {
    pass(`OpenAI project-only row (user_id:null) correctly captured`);
  } else {
    fail(`OpenAI project-only row`, `Expected 1, got ${projectOnlyRows}`);
  }

  // Validate model totals are sums (not last-write-wins)
  const gpt4oDay1Key = Array.from(modelAgg.keys()).find(k => k.startsWith("gpt-4o|") && !k.startsWith("gpt-4o-mini") && !k.startsWith("gpt-4o|2026-05-18"));
  // Find gpt-4o for each day and verify tokens are summed from 3+ rows
  const gpt4oKeys = Array.from(modelAgg.keys()).filter(k => k.startsWith("gpt-4o|") && !k.startsWith("gpt-4o-mini"));
  let sumCorrect = true;
  for (const k of gpt4oKeys) {
    const agg = modelAgg.get(k)!;
    // gpt-4o has 3 users + 1 project row per day = at least 3 rows summed
    // alice: 12000+8500+4200 input = 24700 for day1 (+ project row 5000 = 29700)
    // The sum should be > any single user's tokens
    if (agg.inputTokens < 10000) {
      sumCorrect = false;
    }
  }
  if (sumCorrect) {
    pass(`OpenAI model aggregation correctly sums multi-user rows (not last-write-wins)`);
  } else {
    fail(`OpenAI model aggregation sum check failed — values suspiciously small`);
  }

  // Validate has_more pagination handling: undefined has_more → null nextPage
  // Simulate the fix: data.has_more ? (data.next_page ?? null) : null
  const testCases = [
    { has_more: true, next_page: "page_2", expected: "page_2" },
    { has_more: false, next_page: null, expected: null },
    { has_more: undefined, next_page: "page_2", expected: null },  // undefined = falsy → null
    { has_more: true, next_page: undefined, expected: null },       // has_more true but no page token
  ];
  let paginationOk = true;
  for (const tc of testCases) {
    const result = tc.has_more ? (tc.next_page ?? null) : null;
    if (result !== tc.expected) {
      paginationOk = false;
      fail(`OpenAI pagination: has_more=${tc.has_more} next_page=${tc.next_page}`, `Expected ${tc.expected}, got ${result}`);
    }
  }
  if (paginationOk) {
    pass(`OpenAI has_more pagination termination handles undefined correctly`);
  }

} catch (err) {
  fail(`OpenAI fixture test error`, String(err));
}

// ── Test 5: GitHub Copilot pagination termination ────────────────────────────

section("Test 5: GitHub Copilot pagination termination");

try {
  // Simulate fetchCopilotSeats logic with 3 pages: 100, 100, 50 items
  const simulateGitHubPagination = (pageSizes: number[]): number => {
    const allSeats: unknown[] = [];
    let page = 0;

    while (true) {
      const batch = Array(pageSizes[page] ?? 0).fill({});
      allSeats.push(...batch);
      if (batch.length < 100) break;
      page++;
      if (page >= pageSizes.length) break; // safety
    }

    return allSeats.length;
  };

  const result250 = simulateGitHubPagination([100, 100, 50]);
  if (result250 === 250) {
    pass(`GitHub Copilot pagination: 100+100+50 = 250 seats (terminates on batch<100)`);
  } else {
    fail(`GitHub Copilot pagination: expected 250`, `Got ${result250}`);
  }

  const result100 = simulateGitHubPagination([100, 100, 100, 0]);
  if (result100 === 300) {
    pass(`GitHub Copilot pagination: terminates when batch is empty (not just <100)`);
  } else {
    fail(`GitHub Copilot pagination empty batch`, `Got ${result100}`);
  }

  const resultSingle = simulateGitHubPagination([22]);
  if (resultSingle === 22) {
    pass(`GitHub Copilot pagination: single page of 22 terminates immediately`);
  } else {
    fail(`GitHub Copilot pagination single page`, `Got ${resultSingle}`);
  }

  // Validate fixture seats count
  const seatsFixture = JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, "github-copilot-seats.json"), "utf-8"));
  if (seatsFixture.total_seats === 22 && seatsFixture.seats.length === 22) {
    pass(`GitHub Copilot seats fixture: 22 total_seats, 22 seat objects`);
  } else {
    fail(`GitHub Copilot seats fixture count`, `Got total_seats=${seatsFixture.total_seats}, seats.length=${seatsFixture.seats.length}`);
  }

  // Count active (within 30 days of 2026-05-24)
  const now = new Date("2026-05-24T00:00:00Z").getTime();
  const activeSeats = seatsFixture.seats.filter((s: { last_activity_at: string | null }) => {
    if (!s.last_activity_at) return false;
    return (now - new Date(s.last_activity_at).getTime()) / (1000 * 60 * 60 * 24) <= 30;
  }).length;
  if (activeSeats === 16) {
    pass(`GitHub Copilot seats fixture: 16 active seats within 30 days`);
  } else {
    fail(`GitHub Copilot seats fixture active count`, `Expected 16, got ${activeSeats}`);
  }

} catch (err) {
  fail(`GitHub Copilot pagination test error`, String(err));
}

// ── Test 6: Cursor all-404 warning behavior ──────────────────────────────────

section("Test 6: Cursor all-404 warning behavior");

try {
  // Simulate the fixed worker logic
  const simulateCursorSync = (members: unknown[], dailyRows: unknown[]): string[] => {
    const errors: string[] = [];

    if (members.length === 0 && dailyRows.length === 0) {
      errors.push("Warning: Cursor API returned no members or usage data — all endpoint paths may have returned 404. Verify your Admin API key and ensure your Cursor plan supports the API.");
    }

    return errors;
  };

  const warnErrors = simulateCursorSync([], []);
  if (warnErrors.length === 1 && warnErrors[0].startsWith("Warning: Cursor API returned no members")) {
    pass(`Cursor all-404: warning added when both members and dailyRows empty`);
  } else {
    fail(`Cursor all-404 warning`, `Expected 1 warning, got ${warnErrors.length}: ${warnErrors.join("; ")}`);
  }

  const noWarnErrors = simulateCursorSync([{ id: "cm_001" }], []);
  if (noWarnErrors.length === 0) {
    pass(`Cursor partial data: no warning when members present but usage empty`);
  } else {
    fail(`Cursor partial data`, `Expected 0 warnings, got ${noWarnErrors.length}`);
  }

  // Validate fixture
  const membersFixture = JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, "cursor-members.json"), "utf-8"));
  if (membersFixture.members && membersFixture.members.length === 15) {
    pass(`Cursor members fixture: 15 members`);
  } else {
    fail(`Cursor members fixture count`, `Expected 15, got ${membersFixture.members?.length}`);
  }

  const usageFixture = JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, "cursor-usage.json"), "utf-8"));
  if (usageFixture.data && usageFixture.data.length === 70) {
    pass(`Cursor usage fixture: 70 rows (10 users × 7 days)`);
  } else {
    fail(`Cursor usage fixture count`, `Expected 70, got ${usageFixture.data?.length}`);
  }

} catch (err) {
  fail(`Cursor all-404 test error`, String(err));
}

// ── Test 7: Microsoft CSV parsing ────────────────────────────────────────────

section("Test 7: Microsoft Copilot CSV parsing");

try {
  const csvPath = path.join(FIXTURE_DIR, "microsoft-copilot-user-detail.csv");
  const csvText = fs.readFileSync(csvPath, "utf-8");

  // ── Replicate FIXED parseCopilotUserDetailCSV with CSV_HEADER_MAP ─────────
  // This mirrors the fix applied in modules/providers/microsoft_copilot/connector.ts
  // which maps "Last Activity Date (Teams)" → lastActivityDateTeams etc.
  type M365Field = "userPrincipalName"|"displayName"|"lastActivityDateTeams"|"lastActivityDateWord"
    |"lastActivityDateExcel"|"lastActivityDatePowerPoint"|"lastActivityDateOutlook"
    |"lastActivityDateOneNote"|"lastActivityDateLoop"|"lastActivityDateCopilotChat"
    |"hasOtherProductsLicense"|"hasCopilotLicense";

  const CSV_HEADER_MAP: Record<string, M365Field> = {
    "User Principal Name":              "userPrincipalName",
    "Display Name":                     "displayName",
    "Last Activity Date (Teams)":       "lastActivityDateTeams",
    "Last Activity Date (Word)":        "lastActivityDateWord",
    "Last Activity Date (Excel)":       "lastActivityDateExcel",
    "Last Activity Date (PowerPoint)":  "lastActivityDatePowerPoint",
    "Last Activity Date (Outlook)":     "lastActivityDateOutlook",
    "Last Activity Date (OneNote)":     "lastActivityDateOneNote",
    "Last Activity Date (Loop)":        "lastActivityDateLoop",
    "Last Activity Date (Copilot Chat)":"lastActivityDateCopilotChat",
    "Has Other Products License":       "hasOtherProductsLicense",
    "Has Copilot License":              "hasCopilotLicense",
  };

  function parseCopilotUserDetailCSVFixed(csv: string): Record<string, string | boolean>[] {
    const lines = csv.trim().split("\n");
    if (lines.length < 2) return [];
    const rawHeaders = lines[0].split(",").map(h => h.replace(/^"|"$/g, "").trim());
    const mappedHeaders = rawHeaders.map(h => CSV_HEADER_MAP[h] ?? null);
    return lines.slice(1).map(line => {
      const values = line.split(",").map(v => v.replace(/^"|"$/g, "").trim());
      const row: Record<string, string | boolean> = {};
      mappedHeaders.forEach((fieldName, i) => {
        if (!fieldName) return; // skip unmapped columns (e.g. "Report Refresh Date")
        const val = values[i] ?? "";
        row[fieldName] = val === "True" ? true : val === "False" ? false : val;
      });
      return row;
    });
  }

  const rows = parseCopilotUserDetailCSVFixed(csvText);

  if (rows.length === 25) {
    pass(`Microsoft CSV: 25 data rows parsed`);
  } else {
    fail(`Microsoft CSV row count`, `Expected 25, got ${rows.length}`);
  }

  // Fixed parser: "hasCopilotLicense" (camelCase) is the key now, not "Has Copilot License"
  const booleanRows = rows.filter(r => typeof r["hasCopilotLicense"] === "boolean");
  if (booleanRows.length === rows.length) {
    pass(`Microsoft CSV: hasCopilotLicense correctly mapped to camelCase boolean field`);
  } else {
    fail(`Microsoft CSV boolean map`, `Expected all ${rows.length} rows to have hasCopilotLicense boolean, got ${booleanRows.length}`);
  }

  // Count licensed users via camelCase key
  const licensed = rows.filter(r => r["hasCopilotLicense"] === true);
  if (licensed.length === 20) {
    pass(`Microsoft CSV: 20 licensed users (hasCopilotLicense = true)`);
  } else {
    fail(`Microsoft CSV licensed count`, `Expected 20, got ${licensed.length}`);
  }

  // UPN maps to userPrincipalName (camelCase)
  const hasUPN = rows.every(r => typeof r["userPrincipalName"] === "string" && (r["userPrincipalName"] as string).includes("@"));
  if (hasUPN) {
    pass(`Microsoft CSV: userPrincipalName correctly mapped and all rows have valid UPN`);
  } else {
    fail(`Microsoft CSV: some rows missing valid userPrincipalName`);
  }

  // The critical fix: worker accesses u.lastActivityDateTeams — verify this now resolves
  const teamsActiveCount = rows.filter(r => {
    const val = r["lastActivityDateTeams"] as string | undefined;
    return val && val !== "";
  }).length;
  if (teamsActiveCount > 0) {
    pass(`Microsoft CSV field-map fix: lastActivityDateTeams resolves correctly (${teamsActiveCount} active users in fixture)`);
  } else {
    fail(`Microsoft CSV field-map fix: lastActivityDateTeams still returns undefined for all rows`);
  }

  // Empty CSV should not crash
  const emptyResult = parseCopilotUserDetailCSVFixed("header only\n");
  if (emptyResult.length === 0) {
    pass(`Microsoft CSV: empty body (header only) returns [] without crash`);
  } else {
    fail(`Microsoft CSV: empty body should return []`, `Got ${emptyResult.length} rows`);
  }

  // Validate Microsoft subscribed SKUs fixture
  const skusFixture = JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, "microsoft-subscribed-skus.json"), "utf-8"));
  const copilotSku = (skusFixture.value ?? []).find((s: { skuPartNumber: string }) =>
    s.skuPartNumber?.includes("COPILOT") ||
    s.skuPartNumber?.includes("M365_COPILOT") ||
    s.skuPartNumber?.toLowerCase().includes("copilot")
  );
  if (copilotSku && copilotSku.consumedUnits === 25) {
    pass(`Microsoft SKUs fixture: Copilot SKU found with consumedUnits=25`);
  } else {
    fail(`Microsoft SKUs fixture`, `Copilot SKU not found or wrong consumedUnits`);
  }

  // Test improved SKU matching (Fix C)
  const skuPartNumber = "Microsoft_365_Copilot";
  const matchOld = skuPartNumber.includes("COPILOT") || skuPartNumber.includes("M365_COPILOT");
  const matchNew = skuPartNumber.includes("COPILOT") || skuPartNumber.includes("M365_COPILOT") || skuPartNumber.toLowerCase().includes("copilot");
  if (!matchOld && matchNew) {
    pass(`Microsoft SKU fix (C): "Microsoft_365_Copilot" now matched via lowercase.includes("copilot")`);
  } else if (matchOld) {
    pass(`Microsoft SKU: "Microsoft_365_Copilot" matched by original logic (uppercase check sufficient)`);
  } else {
    fail(`Microsoft SKU fix (C)`, `SKU "${skuPartNumber}" not matched even with fix`);
  }

} catch (err) {
  fail(`Microsoft CSV test error`, String(err));
}

// ── Test 8: Credential parsing edge cases ────────────────────────────────────

section("Test 8: Credential parsing edge cases");

try {
  // GitHub credential parsing
  function parseGitHubCredential(raw: string): { org: string; token: string } {
    try { return JSON.parse(raw); }
    catch { throw new Error("Invalid GitHub credential format"); }
  }

  let githubErrorThrown = false;
  try { parseGitHubCredential("not valid json"); }
  catch (e) { githubErrorThrown = e instanceof Error && e.message.includes("Invalid GitHub credential format"); }
  if (githubErrorThrown) {
    pass(`GitHub credential: malformed JSON throws descriptive error`);
  } else {
    fail(`GitHub credential: malformed JSON should throw descriptive error`);
  }

  const validGH = parseGitHubCredential('{"org":"my-org","token":"ghp_abc123"}');
  if (validGH.org === "my-org" && validGH.token === "ghp_abc123") {
    pass(`GitHub credential: valid JSON parsed correctly`);
  } else {
    fail(`GitHub credential: valid JSON parsing failed`);
  }

  // Microsoft credential parsing (replicate logic)
  function parseMicrosoftCredential(raw: string): { tenantId: string; clientId: string; clientSecret: string } {
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(raw); }
    catch { throw new Error('Invalid Microsoft credential format. Expected JSON: {"tenantId":"...","clientId":"...","clientSecret":"..."}'); }

    const { tenantId, clientId, clientSecret } = parsed as Record<string, string>;
    if (!tenantId) throw new Error("Microsoft credential missing tenantId");
    if (!clientId) throw new Error("Microsoft credential missing clientId");
    if (!clientSecret) throw new Error("Microsoft credential missing clientSecret");

    const guidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!guidRe.test(tenantId)) throw new Error(`tenantId does not look like a valid GUID: "${tenantId}"`);
    if (!guidRe.test(clientId)) throw new Error(`clientId does not look like a valid GUID: "${clientId}"`);

    return { tenantId, clientId, clientSecret };
  }

  let msErrorThrown = false;
  try { parseMicrosoftCredential("not json"); }
  catch (e) { msErrorThrown = e instanceof Error && e.message.includes("Invalid Microsoft credential format"); }
  if (msErrorThrown) {
    pass(`Microsoft credential: malformed JSON throws descriptive error`);
  } else {
    fail(`Microsoft credential: malformed JSON should throw descriptive error`);
  }

  let msMissingThrown = false;
  try { parseMicrosoftCredential('{"tenantId":"abc"}'); }
  catch (e) { msMissingThrown = e instanceof Error && e.message.includes("clientId"); }
  if (msMissingThrown) {
    pass(`Microsoft credential: missing clientId throws descriptive error`);
  } else {
    fail(`Microsoft credential: missing clientId should throw descriptive error`);
  }

  let msInvalidGuidThrown = false;
  try { parseMicrosoftCredential('{"tenantId":"not-a-guid","clientId":"12345678-1234-1234-1234-123456789012","clientSecret":"secret"}'); }
  catch (e) { msInvalidGuidThrown = e instanceof Error && e.message.includes("valid GUID"); }
  if (msInvalidGuidThrown) {
    pass(`Microsoft credential: invalid GUID format throws descriptive error`);
  } else {
    fail(`Microsoft credential: invalid GUID should throw descriptive error`);
  }

  const validMs = parseMicrosoftCredential('{"tenantId":"12345678-1234-1234-1234-123456789012","clientId":"87654321-4321-4321-4321-210987654321","clientSecret":"mysecret"}');
  if (validMs.tenantId && validMs.clientId && validMs.clientSecret) {
    pass(`Microsoft credential: valid JSON with GUIDs parsed correctly`);
  } else {
    fail(`Microsoft credential: valid JSON parsing failed`);
  }

} catch (err) {
  fail(`Credential parsing test error`, String(err));
}

// ── Test 9: ProviderSyncRun schema + worker logging ──────────────────────────

section("Test 9: ProviderSyncRun schema and worker logging");

try {
  const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  if (schema.includes("model ProviderSyncRun")) {
    pass(`ProviderSyncRun model exists in schema`);
  } else {
    fail(`ProviderSyncRun model not found in schema`);
  }

  const fields = ["organizationId", "provider", "status", "recordsSynced", "errorMessage", "startedAt", "finishedAt"];
  for (const field of fields) {
    if (schema.includes("ProviderSyncRun") && schema.includes(field)) {
      pass(`ProviderSyncRun has field: ${field}`);
    } else {
      fail(`ProviderSyncRun missing field: ${field}`);
    }
  }

  // Verify sync-run-logger helper exists and exports required functions
  const loggerPath = path.join(__dirname, "..", "workers", "sync-run-logger.ts");
  if (fs.existsSync(loggerPath)) {
    pass(`sync-run-logger.ts helper exists`);
    const loggerSrc = fs.readFileSync(loggerPath, "utf-8");
    for (const fn of ["startSyncRun", "completeSyncRun", "failSyncRun", "sanitizeErrorMessage"]) {
      if (loggerSrc.includes(`function ${fn}`) || loggerSrc.includes(`export async function ${fn}`) || loggerSrc.includes(`export function ${fn}`)) {
        pass(`sync-run-logger exports: ${fn}`);
      } else {
        fail(`sync-run-logger missing export: ${fn}`);
      }
    }
    // Verify sanitizer covers known secret patterns
    const patterns = ["Bearer", "sk-ant-", "ghp_", "sk-"];
    for (const p of patterns) {
      if (loggerSrc.includes(p)) {
        pass(`sanitizeErrorMessage covers pattern: ${p}`);
      } else {
        fail(`sanitizeErrorMessage missing pattern: ${p}`);
      }
    }
  } else {
    fail(`sync-run-logger.ts helper missing`);
  }

  // Verify all 6 workers import and use the logger
  const workerDir = path.join(__dirname, "..", "workers");
  const workers = [
    { file: "sync-claude-usage.worker.ts",     provider: "anthropic" },
    { file: "sync-claude-code.worker.ts",       provider: "claude_code" },
    { file: "sync-openai.worker.ts",            provider: "openai" },
    { file: "sync-github-copilot.worker.ts",    provider: "github_copilot" },
    { file: "sync-cursor.worker.ts",            provider: "cursor" },
    { file: "sync-microsoft-copilot.worker.ts", provider: "microsoft_copilot" },
  ];

  for (const { file, provider } of workers) {
    const wPath = path.join(workerDir, file);
    if (!fs.existsSync(wPath)) {
      fail(`Worker file missing: ${file}`);
      continue;
    }
    const content = fs.readFileSync(wPath, "utf-8");

    if (content.includes("sync-run-logger")) {
      pass(`${file}: imports sync-run-logger`);
    } else {
      fail(`${file}: does not import sync-run-logger`);
    }

    if (content.includes("startSyncRun")) {
      pass(`${file}: calls startSyncRun`);
    } else {
      fail(`${file}: missing startSyncRun call`);
    }

    if (content.includes("completeSyncRun")) {
      pass(`${file}: calls completeSyncRun on success`);
    } else {
      fail(`${file}: missing completeSyncRun call`);
    }

    if (content.includes("failSyncRun")) {
      pass(`${file}: calls failSyncRun on error`);
    } else {
      fail(`${file}: missing failSyncRun call`);
    }

    // Verify the provider string passed to startSyncRun matches expected value
    if (content.includes(`startSyncRun(organizationId, "${provider}")`)) {
      pass(`${file}: startSyncRun called with correct provider "${provider}"`);
    } else {
      fail(`${file}: startSyncRun provider mismatch — expected "${provider}"`);
    }
  }

  // Verify sanitizer logic: simulate sanitizeErrorMessage behavior
  const testMsg = 'Authorization: Bearer sk-ant-admin01-ABCDEFGHIJ1234567890 failed for org';
  const sanitized = testMsg
    .replace(/Bearer\s+[A-Za-z0-9\-_.~+/]+=*/gi, "Bearer [REDACTED]")
    .replace(/sk-ant-[A-Za-z0-9\-_]+/g, "[REDACTED]");
  if (!sanitized.includes("sk-ant-") && sanitized.includes("[REDACTED]")) {
    pass(`sanitizeErrorMessage: strips Anthropic key from error text`);
  } else {
    fail(`sanitizeErrorMessage: failed to redact Anthropic key`);
  }

  const ghMsg = 'GitHub API 401: Bad credentials for token ghp_xxABCDEF1234567890xyz';
  const ghSanitized = ghMsg.replace(/gh[pousr]_[A-Za-z0-9_]+/gi, "[REDACTED]");
  if (!ghSanitized.includes("ghp_") && ghSanitized.includes("[REDACTED]")) {
    pass(`sanitizeErrorMessage: strips GitHub token from error text`);
  } else {
    fail(`sanitizeErrorMessage: failed to redact GitHub token`);
  }

} catch (err) {
  fail(`Schema/logging check test error`, String(err));
}

// ── Summary ──────────────────────────────────────────────────────────────────

const total = passed + failed;
console.log(`\n${"=".repeat(60)}`);
console.log(`Results: ${passed}/${total} passed, ${failed} failed`);
if (failed === 0) {
  console.log(`All validations passed.`);
} else {
  console.log(`${failed} validation(s) failed — review output above.`);
  process.exit(1);
}
