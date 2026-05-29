import { PrismaClient, MemberRole, ConnectionStatus, BudgetPeriod, AlertSeverity } from "@prisma/client";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _ProviderKey = "anthropic" | "openai" | "gemini" | "perplexity" | "claude_code" | "github_copilot" | "cursor" | "microsoft_copilot";
import bcrypt from "bcryptjs";
import { subDays } from "date-fns";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

const TEAMS = ["Web", "Mobile", "QA", "DevOps", "AI R&D"];
const MODELS = ["claude-sonnet-4", "claude-opus-4", "claude-haiku-4-5"];

const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4":  { input: 0.000003,  output: 0.000015 },
  "claude-opus-4":    { input: 0.000015,  output: 0.000075 },
  "claude-haiku-4-5": { input: 0.0000008, output: 0.000004 },
};

const USERS_DATA = [
  { name: "Alice Chen",      email: "alice@vaival.com",   team: "AI R&D" },
  { name: "Bob Smith",       email: "bob@vaival.com",     team: "Web" },
  { name: "Carol White",     email: "carol@vaival.com",   team: "Mobile" },
  { name: "Dave Jones",      email: "dave@vaival.com",    team: "AI R&D" },
  { name: "Eve Davis",       email: "eve@vaival.com",     team: "DevOps" },
  { name: "Frank Miller",    email: "frank@vaival.com",   team: "QA" },
  { name: "Grace Lee",       email: "grace@vaival.com",   team: "Web" },
  { name: "Henry Brown",     email: "henry@vaival.com",   team: "Mobile" },
  { name: "Iris Wilson",     email: "iris@vaival.com",    team: "AI R&D" },
  { name: "Jack Taylor",     email: "jack@vaival.com",    team: "DevOps" },
  { name: "Karen Moore",     email: "karen@vaival.com",   team: "QA" },
  { name: "Leo Anderson",    email: "leo@vaival.com",     team: "Web" },
  { name: "Mia Thomas",      email: "mia@vaival.com",     team: "Mobile" },
  { name: "Noah Jackson",    email: "noah@vaival.com",    team: "AI R&D" },
  { name: "Olivia Harris",   email: "olivia@vaival.com",  team: "DevOps" },
  { name: "Paul Martin",     email: "paul@vaival.com",    team: "QA" },
  { name: "Quinn Garcia",    email: "quinn@vaival.com",   team: "Web" },
  { name: "Rachel Martinez", email: "rachel@vaival.com",  team: "Mobile" },
  { name: "Sam Rodriguez",   email: "sam@vaival.com",     team: "AI R&D" },
  { name: "Tina Lewis",      email: "tina@vaival.com",    team: "DevOps" },
  { name: "Uma Walker",      email: "uma@vaival.com",     team: "QA" },
  { name: "Victor Hall",     email: "victor@vaival.com",  team: "Web" },
  { name: "Wendy Allen",     email: "wendy@vaival.com",   team: "Mobile" },
  { name: "Xavier Young",    email: "xavier@vaival.com",  team: "AI R&D" },
  { name: "Yara King",       email: "yara@vaival.com",    team: "QA" },
];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("Seeding TokenLens demo data...");

  // Clean up in dependency order
  await prisma.alert.deleteMany();
  await prisma.alertRule.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.claudeCodeDaily.deleteMany();
  await prisma.modelUsageDaily.deleteMany();
  await prisma.usageDaily.deleteMany();
  // Phase 2 tables
  await prisma.providerUserMapping.deleteMany();
  await prisma.businessAiDaily.deleteMany();
  await prisma.seatUsageDaily.deleteMany();
  await prisma.developerAiDaily.deleteMany();
  await prisma.aiModelUsageDaily.deleteMany();
  await prisma.aiUsageDaily.deleteMany();
  await prisma.providerSyncRun.deleteMany();
  // End Phase 2
  await prisma.providerConnection.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  console.log("Cleaned existing data");

  // Organization
  const org = await prisma.organization.create({
    data: { name: "Vaival AI Labs", slug: "vaival-ai-labs" },
  });
  console.log("Created organization:", org.name);

  // Admin user
  const adminHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: { email: "admin@tokenlens.ai", name: "Admin User", passwordHash: adminHash },
  });
  await prisma.organizationMember.create({
    data: { organizationId: org.id, userId: admin.id, role: MemberRole.owner },
  });
  console.log("Created admin: admin@tokenlens.ai / admin123");

  // Teams
  const teamMap: Record<string, string> = {};
  for (const teamName of TEAMS) {
    const team = await prisma.team.create({
      data: {
        organizationId: org.id,
        name: teamName,
        slug: teamName.toLowerCase().replace(/\s+/g, "-"),
      },
    });
    teamMap[teamName] = team.id;
  }
  console.log("Created 5 teams");

  // 25 users — batch hash then createMany
  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.createMany({
    data: USERS_DATA.map((u) => ({ email: u.email, name: u.name, passwordHash })),
    skipDuplicates: true,
  });

  const createdUsers = await prisma.user.findMany({
    where: { email: { in: USERS_DATA.map((u) => u.email) } },
  });
  const emailToUserId: Record<string, string> = {};
  for (const u of createdUsers) emailToUserId[u.email] = u.id;

  await prisma.organizationMember.createMany({
    data: createdUsers.map((u) => ({
      organizationId: org.id,
      userId: u.id,
      role: MemberRole.viewer,
    })),
  });

  const userTeamMap: Record<string, { userId: string; teamId: string }> = {};
  await prisma.teamMember.createMany({
    data: USERS_DATA.map((u) => {
      const userId = emailToUserId[u.email];
      const teamId = teamMap[u.team];
      userTeamMap[u.email] = { userId, teamId };
      return { teamId, userId };
    }),
  });
  console.log("Created 25 users");

  // Provider connection placeholder
  await prisma.providerConnection.create({
    data: { organizationId: org.id, provider: "anthropic", status: ConnectionStatus.not_connected },
  });

  // Build all usage rows in memory, then insert in batches
  const today = new Date();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const usageRows: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelRows: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const codeRows: any[] = [];

  for (let d = 6; d >= 0; d--) {
    const date = subDays(today, d);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    for (const u of USERS_DATA) {
      if (Math.random() > 0.85) continue; // ~85% active
      const { teamId } = userTeamMap[u.email];
      const inputTokens = rand(5000, 80000);
      const outputTokens = rand(1000, 20000);
      usageRows.push({
        organizationId: org.id,
        date: dateOnly,
        userEmail: u.email,
        teamId,
        inputTokens,
        outputTokens,
        cachedTokens: rand(0, Math.floor(inputTokens * 0.3)),
        totalTokens: inputTokens + outputTokens,
        totalCostUsd: (inputTokens * 0.000003 + outputTokens * 0.000015).toFixed(6),
      });
    }

    for (const model of MODELS) {
      const costs = MODEL_COSTS[model];
      const inputTokens = rand(50000, 500000);
      const outputTokens = rand(10000, 100000);
      modelRows.push({
        organizationId: org.id,
        model,
        date: dateOnly,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        totalCostUsd: (inputTokens * costs.input + outputTokens * costs.output).toFixed(6),
      });
    }

    const dayOfWeek = date.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      for (const u of USERS_DATA) {
        if (Math.random() > 0.75) continue;
        const { teamId } = userTeamMap[u.email];
        const sessions = rand(1, 8);
        codeRows.push({
          organizationId: org.id,
          userEmail: u.email,
          teamId,
          date: dateOnly,
          sessions,
          commits: rand(0, sessions * 2),
          pullRequests: Math.random() > 0.7 ? rand(0, 2) : 0,
          linesAdded: rand(50, 800),
          linesRemoved: rand(10, 300),
          estimatedCostUsd: (sessions * rand(1, 5) * 0.3).toFixed(6),
        });
      }
    }
  }

  // Insert in chunks of 500 to stay within Neon limits
  const CHUNK = 500;
  for (let i = 0; i < usageRows.length; i += CHUNK) {
    await prisma.usageDaily.createMany({ data: usageRows.slice(i, i + CHUNK), skipDuplicates: true });
  }
  console.log(`Inserted ${usageRows.length} usage rows`);

  for (let i = 0; i < modelRows.length; i += CHUNK) {
    await prisma.modelUsageDaily.createMany({ data: modelRows.slice(i, i + CHUNK), skipDuplicates: true });
  }
  console.log(`Inserted ${modelRows.length} model rows`);

  for (let i = 0; i < codeRows.length; i += CHUNK) {
    await prisma.claudeCodeDaily.createMany({ data: codeRows.slice(i, i + CHUNK), skipDuplicates: true });
  }
  console.log(`Inserted ${codeRows.length} Claude Code rows`);

  // Budgets
  await prisma.budget.createMany({
    data: [
      { organizationId: org.id, name: "Monthly Org Budget",  limitUsd: 1500, period: BudgetPeriod.monthly },
      { organizationId: org.id, teamId: teamMap["AI R&D"],   name: "AI R&D Monthly", limitUsd: 500, period: BudgetPeriod.monthly },
      { organizationId: org.id, teamId: teamMap["Web"],      name: "Web Monthly",    limitUsd: 300, period: BudgetPeriod.monthly },
    ],
  });

  // Alert rules
  const rule1 = await prisma.alertRule.create({
    data: { organizationId: org.id, name: "Monthly Budget Exceeded", metric: "org_monthly_cost", threshold: 1500, operator: "gt", period: "monthly" },
  });
  const rule2 = await prisma.alertRule.create({
    data: { organizationId: org.id, name: "User Daily Spike", metric: "user_daily_cost", threshold: 50, operator: "gt", period: "daily" },
  });

  await prisma.alert.createMany({
    data: [
      { organizationId: org.id, alertRuleId: rule2.id, message: "alice@vaival.com exceeded $50/day threshold", severity: AlertSeverity.warning, createdAt: subDays(today, 2) },
      { organizationId: org.id, alertRuleId: rule2.id, message: "bob@vaival.com exceeded $50/day threshold",   severity: AlertSeverity.warning, createdAt: subDays(today, 5), resolvedAt: subDays(today, 5) },
    ],
  });

  console.log("Seeded budgets and alerts");

  // Provider connections — all disconnected by default; customers connect via Settings
  await prisma.providerConnection.createMany({
    data: [
      { organizationId: org.id, provider: "openai",            status: ConnectionStatus.not_connected },
      { organizationId: org.id, provider: "gemini",            status: ConnectionStatus.not_connected },
      { organizationId: org.id, provider: "perplexity",        status: ConnectionStatus.not_connected },
      { organizationId: org.id, provider: "github_copilot",    status: ConnectionStatus.not_connected },
      { organizationId: org.id, provider: "cursor",            status: ConnectionStatus.not_connected },
      { organizationId: org.id, provider: "microsoft_copilot", status: ConnectionStatus.not_connected },
    ],
    skipDuplicates: true,
  });
  console.log("Seeded empty provider connections (customers connect real keys via Settings)");

  // ─── Phase 2 Demo Data ──────────────────────────────────────────────────────
  // These rows are inserted unconditionally. When an admin connects real credentials
  // and clicks Sync, the sync worker purges ALL rows for that provider+org before
  // inserting live API data — so demo data is automatically replaced.

  const openaiUsers = USERS_DATA.filter((_, i) => i % 5 !== 3); // ~20 users
  const devUsers = USERS_DATA.filter((u) =>
    ["Web", "Mobile", "DevOps", "AI R&D"].includes(u.team)
  );
  const cursorUsers = devUsers.slice(0, 15);

  const OPENAI_MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"];
  const OPENAI_MODEL_COSTS: Record<string, { input: number; output: number }> = {
    "gpt-4o":       { input: 0.0000025,  output: 0.00001  },
    "gpt-4o-mini":  { input: 0.00000015, output: 0.0000006 },
    "gpt-4-turbo":  { input: 0.00001,    output: 0.00003  },
  };

  // ── OpenAI AiUsageDaily ──────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aiUsageRows: any[] = [];
  for (let d = 29; d >= 0; d--) {
    const date = subDays(today, d);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    for (const u of openaiUsers) {
      if (Math.random() > 0.8) continue; // ~80% active per day
      const { teamId } = userTeamMap[u.email];
      const inputTokens = rand(3000, 60000);
      const outputTokens = rand(500, 15000);
      const cachedTokens = Math.floor(inputTokens * 0.2 * Math.random());
      aiUsageRows.push({
        organizationId: org.id,
        provider: "openai",
        date: dateOnly,
        userEmail: u.email,
        teamId,
        inputTokens,
        outputTokens,
        cachedTokens,
        totalTokens: inputTokens + outputTokens,
        totalCostUsd: (inputTokens * 0.0000025 + outputTokens * 0.00001).toFixed(6),
      });
    }
  }
  for (let i = 0; i < aiUsageRows.length; i += CHUNK) {
    await prisma.aiUsageDaily.createMany({ data: aiUsageRows.slice(i, i + CHUNK), skipDuplicates: true });
  }
  console.log(`Inserted ${aiUsageRows.length} OpenAI aiUsageDaily rows`);

  // ── OpenAI AiModelUsageDaily ─────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aiModelUsageRows: any[] = [];
  for (let d = 29; d >= 0; d--) {
    const date = subDays(today, d);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    for (const model of OPENAI_MODELS) {
      const costs = OPENAI_MODEL_COSTS[model];
      const inputTokens = rand(30000, 400000);
      const outputTokens = rand(8000, 80000);
      aiModelUsageRows.push({
        organizationId: org.id,
        provider: "openai",
        model,
        date: dateOnly,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        totalCostUsd: (inputTokens * costs.input + outputTokens * costs.output).toFixed(6),
      });
    }
  }
  for (let i = 0; i < aiModelUsageRows.length; i += CHUNK) {
    await prisma.aiModelUsageDaily.createMany({ data: aiModelUsageRows.slice(i, i + CHUNK), skipDuplicates: true });
  }
  console.log(`Inserted ${aiModelUsageRows.length} OpenAI aiModelUsageDaily rows`);

  // ── GitHub Copilot DeveloperAiDaily ─────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ghDevRows: any[] = [];
  for (let d = 29; d >= 0; d--) {
    const date = subDays(today, d);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    for (const u of devUsers) {
      if (Math.random() > 0.75) continue; // ~75% active per day
      const { teamId } = userTeamMap[u.email];
      const sessions = rand(1, 6);
      const suggestions = rand(20, 200);
      const acceptanceRate = 0.4 + Math.random() * 0.3; // 40-70%
      const acceptances = Math.floor(suggestions * acceptanceRate);
      ghDevRows.push({
        organizationId: org.id,
        provider: "github_copilot",
        date: dateOnly,
        userEmail: u.email,
        teamId,
        sessions,
        linesAdded: rand(30, 500),
        linesRemoved: rand(5, 150),
        filesChanged: rand(1, 20),
        commitsAssisted: rand(0, sessions * 2),
        prsAssisted: Math.random() > 0.7 ? rand(0, 2) : 0,
        suggestions,
        acceptances,
        completions: acceptances,
        totalCostUsd: (22 * 19 / 30 / devUsers.length).toFixed(6),
      });
    }
  }
  for (let i = 0; i < ghDevRows.length; i += CHUNK) {
    await prisma.developerAiDaily.createMany({ data: ghDevRows.slice(i, i + CHUNK), skipDuplicates: true });
  }
  console.log(`Inserted ${ghDevRows.length} GitHub Copilot developerAiDaily rows`);

  // ── Cursor DeveloperAiDaily ──────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cursorDevRows: any[] = [];
  for (let d = 29; d >= 0; d--) {
    const date = subDays(today, d);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    for (const u of cursorUsers) {
      if (Math.random() > 0.7) continue; // ~70% active per day
      const { teamId } = userTeamMap[u.email];
      const sessions = rand(1, 5);
      const suggestions = rand(15, 150);
      const acceptanceRate = 0.5 + Math.random() * 0.25; // 50-75%
      const acceptances = Math.floor(suggestions * acceptanceRate);
      cursorDevRows.push({
        organizationId: org.id,
        provider: "cursor",
        date: dateOnly,
        userEmail: u.email,
        teamId,
        sessions,
        linesAdded: rand(20, 400),
        linesRemoved: rand(5, 100),
        filesChanged: rand(1, 15),
        commitsAssisted: rand(0, sessions * 2),
        prsAssisted: Math.random() > 0.75 ? rand(0, 2) : 0,
        suggestions,
        acceptances,
        completions: acceptances,
        totalCostUsd: (15 * 40 / 30 / cursorUsers.length).toFixed(6),
      });
    }
  }
  for (let i = 0; i < cursorDevRows.length; i += CHUNK) {
    await prisma.developerAiDaily.createMany({ data: cursorDevRows.slice(i, i + CHUNK), skipDuplicates: true });
  }
  console.log(`Inserted ${cursorDevRows.length} Cursor developerAiDaily rows`);

  // ── SeatUsageDaily — GitHub Copilot ─────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seatRows: any[] = [];
  for (let d = 29; d >= 0; d--) {
    const date = subDays(today, d);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    seatRows.push({
      organizationId: org.id,
      provider: "github_copilot",
      date: dateOnly,
      totalSeats: 22,
      activeSeats: rand(16, 18),
      costPerSeat: (19 / 30).toFixed(6),
      totalCostUsd: (22 * 19 / 30).toFixed(6),
    });
  }

  // ── SeatUsageDaily — Cursor ──────────────────────────────────────────────────
  for (let d = 29; d >= 0; d--) {
    const date = subDays(today, d);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    seatRows.push({
      organizationId: org.id,
      provider: "cursor",
      date: dateOnly,
      totalSeats: 15,
      activeSeats: rand(10, 13),
      costPerSeat: (40 / 30).toFixed(6),
      totalCostUsd: (15 * 40 / 30).toFixed(6),
    });
  }

  // ── SeatUsageDaily — Microsoft Copilot ──────────────────────────────────────
  for (let d = 29; d >= 0; d--) {
    const date = subDays(today, d);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    seatRows.push({
      organizationId: org.id,
      provider: "microsoft_copilot",
      date: dateOnly,
      totalSeats: 25,
      activeSeats: rand(18, 22),
      costPerSeat: (30 / 30).toFixed(6),
      totalCostUsd: (25 * 30 / 30).toFixed(6),
    });
  }

  for (let i = 0; i < seatRows.length; i += CHUNK) {
    await prisma.seatUsageDaily.createMany({ data: seatRows.slice(i, i + CHUNK), skipDuplicates: true });
  }
  console.log(`Inserted ${seatRows.length} seatUsageDaily rows`);

  // ── BusinessAiDaily — Microsoft Copilot ─────────────────────────────────────
  const MS_APPS = ["teams", "word", "excel", "powerpoint", "outlook", "onenote", "loop", "copilot_chat"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bizRows: any[] = [];
  for (let d = 29; d >= 0; d--) {
    const date = subDays(today, d);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    for (const app of MS_APPS) {
      const activeUsers = rand(5, 20);
      const totalSessions = activeUsers * rand(2, 8);
      bizRows.push({
        organizationId: org.id,
        provider: "microsoft_copilot",
        app,
        date: dateOnly,
        activeUsers,
        totalSessions,
        totalCostUsd: (activeUsers * 30 / 30).toFixed(6),
      });
    }
  }
  for (let i = 0; i < bizRows.length; i += CHUNK) {
    await prisma.businessAiDaily.createMany({ data: bizRows.slice(i, i + CHUNK), skipDuplicates: true });
  }
  console.log(`Inserted ${bizRows.length} Microsoft Copilot businessAiDaily rows`);

  // ── ProviderUserMapping — GitHub Copilot ─────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providerUserMappingRows: any[] = [];
  for (const u of devUsers) {
    const login = u.email.split("@")[0];
    providerUserMappingRows.push({
      organizationId: org.id,
      provider: "github_copilot",
      providerUserId: login,
      userEmail: u.email,
      userId: emailToUserId[u.email] ?? null,
    });
  }

  // ── ProviderUserMapping — Microsoft Copilot ──────────────────────────────────
  for (const u of USERS_DATA) {
    providerUserMappingRows.push({
      organizationId: org.id,
      provider: "microsoft_copilot",
      providerUserId: u.email, // UPN
      userEmail: u.email,
      userId: emailToUserId[u.email] ?? null,
    });
  }

  for (let i = 0; i < providerUserMappingRows.length; i += CHUNK) {
    await prisma.providerUserMapping.createMany({ data: providerUserMappingRows.slice(i, i + CHUNK), skipDuplicates: true });
  }
  console.log(`Inserted ${providerUserMappingRows.length} providerUserMapping rows`);

  // ─── End Phase 2 Demo Data ───────────────────────────────────────────────────

  // ─── Phase 3 Demo Data ─────────────────────────────────────────────────────

  // Phase 3 cleanup first (in case of re-seed)
  await prisma.notificationDeliveryLog.deleteMany({ where: { organizationId: org.id } });
  await prisma.notificationChannel.deleteMany({ where: { organizationId: org.id } });
  await prisma.dataRetentionPolicy.deleteMany({ where: { organizationId: org.id } });
  await prisma.productivityCorrelationDaily.deleteMany({ where: { organizationId: org.id } });
  await prisma.jiraIssueDaily.deleteMany({ where: { organizationId: org.id } });
  await prisma.jiraProject.deleteMany({ where: { organizationId: org.id } });
  await prisma.gitHubCommitDaily.deleteMany({ where: { organizationId: org.id } });
  await prisma.gitHubPullRequestDaily.deleteMany({ where: { organizationId: org.id } });
  await prisma.gitHubRepository.deleteMany({ where: { organizationId: org.id } });
  await prisma.recommendation.deleteMany({ where: { organizationId: org.id } });
  await prisma.teamEfficiencyScoreDaily.deleteMany({ where: { organizationId: org.id } });
  await prisma.aiWasteScoreDaily.deleteMany({ where: { organizationId: org.id } });
  await prisma.aiAdoptionScoreDaily.deleteMany({ where: { organizationId: org.id } });

  // AI Adoption Scores — per user per day (last 7 days)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adoptionRows: any[] = [];
  const ADOPTION_BADGES = ["high", "healthy", "low", "inactive"];
  const userBadgeMap: Record<string, string> = {};

  for (const u of USERS_DATA) {
    const baseScore = rand(20, 95);
    const badge = baseScore >= 80 ? "high" : baseScore >= 60 ? "healthy" : baseScore >= 30 ? "low" : "inactive";
    userBadgeMap[u.email] = badge;
    for (let d = 6; d >= 0; d--) {
      const date = subDays(today, d);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const score = Math.min(100, Math.max(0, baseScore + rand(-5, 5)));
      adoptionRows.push({
        organizationId: org.id,
        date: dateOnly,
        entityType: "user",
        entityId: u.email,
        score: score.toFixed(2),
        activeDays: rand(1, 7),
        providersUsed: rand(1, 4),
        totalSessions: rand(2, 30),
        totalTokens: rand(10000, 500000),
        badge: score >= 80 ? "high" : score >= 60 ? "healthy" : score >= 30 ? "low" : "inactive",
      });
    }
  }

  // Team adoption scores
  for (const teamName of TEAMS) {
    for (let d = 6; d >= 0; d--) {
      const date = subDays(today, d);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const score = rand(40, 90);
      adoptionRows.push({
        organizationId: org.id,
        date: dateOnly,
        entityType: "team",
        entityId: teamMap[teamName],
        score: score.toFixed(2),
        activeDays: rand(4, 7),
        providersUsed: rand(2, 5),
        totalSessions: rand(20, 150),
        totalTokens: rand(100000, 2000000),
        badge: score >= 80 ? "high" : score >= 60 ? "healthy" : score >= 30 ? "low" : "inactive",
      });
    }
  }

  for (let i = 0; i < adoptionRows.length; i += CHUNK) {
    await prisma.aiAdoptionScoreDaily.createMany({ data: adoptionRows.slice(i, i + CHUNK), skipDuplicates: true });
  }
  console.log(`Inserted ${adoptionRows.length} adoption score rows`);

  // AI Waste Scores — per user + team
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wasteRows: any[] = [];
  const WASTE_REASONS = [
    "inactive_paid_seat",
    "high_spend_low_activity",
    "premium_model_overuse",
    "low_developer_ai_activity",
    "unused_licenses",
  ];

  for (const u of USERS_DATA) {
    const baseScore = rand(5, 60);
    for (let d = 6; d >= 0; d--) {
      const date = subDays(today, d);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const score = Math.min(100, Math.max(0, baseScore + rand(-5, 5)));
      const reasons = WASTE_REASONS.filter(() => Math.random() > 0.6);
      wasteRows.push({
        organizationId: org.id,
        date: dateOnly,
        entityType: "user",
        entityId: u.email,
        score: score.toFixed(2),
        inactiveSeats: Math.random() > 0.7 ? rand(0, 2) : 0,
        wastedCostUsd: (score * 0.5).toFixed(6),
        reasons: reasons.length > 0 ? reasons : null,
      });
    }
  }

  for (const teamName of TEAMS) {
    const baseScore = rand(10, 50);
    for (let d = 6; d >= 0; d--) {
      const date = subDays(today, d);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const score = Math.min(100, Math.max(0, baseScore + rand(-8, 8)));
      wasteRows.push({
        organizationId: org.id,
        date: dateOnly,
        entityType: "team",
        entityId: teamMap[teamName],
        score: score.toFixed(2),
        inactiveSeats: rand(0, 4),
        wastedCostUsd: (score * 2).toFixed(6),
        reasons: WASTE_REASONS.filter(() => Math.random() > 0.5),
      });
    }
  }

  for (let i = 0; i < wasteRows.length; i += CHUNK) {
    await prisma.aiWasteScoreDaily.createMany({ data: wasteRows.slice(i, i + CHUNK), skipDuplicates: true });
  }
  console.log(`Inserted ${wasteRows.length} waste score rows`);

  // Team Efficiency Scores
  const TEAM_STATUSES = ["efficient", "healthy", "needs_review", "high_waste"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const effRows: any[] = [];
  const teamStatusMap: Record<string, string> = {
    "AI R&D": "efficient", Web: "healthy", Mobile: "needs_review", QA: "healthy", DevOps: "efficient"
  };

  for (const teamName of TEAMS) {
    const baseScore = teamStatusMap[teamName] === "efficient" ? rand(75, 95) :
                      teamStatusMap[teamName] === "healthy" ? rand(55, 74) :
                      teamStatusMap[teamName] === "needs_review" ? rand(30, 54) : rand(5, 29);
    for (let d = 6; d >= 0; d--) {
      const date = subDays(today, d);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const score = Math.min(100, Math.max(0, baseScore + rand(-5, 5)));
      effRows.push({
        organizationId: org.id,
        teamId: teamMap[teamName],
        date: dateOnly,
        score: score.toFixed(2),
        status: score >= 75 ? "efficient" : score >= 55 ? "healthy" : score >= 30 ? "needs_review" : "high_waste",
        totalSpendUsd: (rand(50, 500)).toFixed(6),
        activeUsers: rand(3, 8),
        devAiSessions: rand(10, 80),
        costPerUser: (rand(10, 80)).toFixed(6),
        prCount: rand(2, 15),
        commitCount: rand(5, 40),
        ticketCount: rand(3, 20),
      });
    }
  }

  for (let i = 0; i < effRows.length; i += CHUNK) {
    await prisma.teamEfficiencyScoreDaily.createMany({ data: effRows.slice(i, i + CHUNK), skipDuplicates: true });
  }
  console.log(`Inserted ${effRows.length} team efficiency rows`);

  // Recommendations
  await prisma.recommendation.createMany({
    data: [
      { organizationId: org.id, type: "review_inactive_seats",   priority: "high",     status: "open",      title: "5 inactive GitHub Copilot seats detected",        description: "5 users have paid GitHub Copilot seats but have had no activity in the last 14 days. Estimated monthly waste: $95.", entityType: "provider", entityId: "github_copilot", estimatedSavingsUsd: 95 },
      { organizationId: org.id, type: "reduce_premium_model",    priority: "medium",   status: "open",      title: "Premium model overuse in AI R&D team",           description: "AI R&D team is using claude-opus-4 for 38% of requests. Many of these could use claude-sonnet-4 at 80% lower cost.", entityType: "team", entityId: teamMap["AI R&D"], estimatedSavingsUsd: 210 },
      { organizationId: org.id, type: "train_low_adoption",      priority: "medium",   status: "open",      title: "3 QA team members have low AI adoption scores",   description: "frank@vaival.com, karen@vaival.com, and paul@vaival.com have adoption scores below 35. Consider targeted AI training.", entityType: "team", entityId: teamMap["QA"] },
      { organizationId: org.id, type: "investigate_cost_spike",  priority: "critical", status: "open",      title: "Unusual cost spike on OpenAI last 2 days",        description: "OpenAI spend increased 340% over the last 48 hours compared to the 7-day average. Review API key usage.", entityType: "provider", entityId: "openai" },
      { organizationId: org.id, type: "set_team_budget",         priority: "low",      status: "accepted",  title: "Mobile team has no budget set",                  description: "The Mobile team has spent $1,240 this month but has no budget alert configured.", entityType: "team", entityId: teamMap["Mobile"] },
      { organizationId: org.id, type: "optimize_cached_tokens",  priority: "low",      status: "dismissed", title: "Cached token usage is below optimal",             description: "Your cached token ratio is 12%. Adjusting prompt structure could increase this to 35%+, reducing costs by ~18%.", entityType: "org", entityId: org.id },
    ],
  });
  console.log("Inserted recommendations");

  // GitHub Repositories
  const repos = await prisma.gitHubRepository.createMany({
    data: [
      { organizationId: org.id, githubRepoId: "gh_001", name: "frontend",  fullName: "vaival/frontend",  language: "TypeScript", isPrivate: true },
      { organizationId: org.id, githubRepoId: "gh_002", name: "backend-api", fullName: "vaival/backend-api", language: "TypeScript", isPrivate: true },
      { organizationId: org.id, githubRepoId: "gh_003", name: "mobile-app", fullName: "vaival/mobile-app", language: "Swift",      isPrivate: true },
      { organizationId: org.id, githubRepoId: "gh_004", name: "data-pipeline", fullName: "vaival/data-pipeline", language: "Python", isPrivate: true },
    ],
    skipDuplicates: true,
  });
  console.log(`Inserted ${repos.count} GitHub repos`);

  const ghRepos = await prisma.gitHubRepository.findMany({ where: { organizationId: org.id } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prRows: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const commitRowsGH: any[] = [];

  for (const repo of ghRepos) {
    for (let d = 6; d >= 0; d--) {
      const date = subDays(today, d);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      prRows.push({
        organizationId: org.id,
        repositoryId: repo.id,
        date: dateOnly,
        opened: rand(1, 6),
        merged: rand(1, 4),
        closed: rand(0, 2),
        reviewed: rand(2, 8),
        avgCycleTimeHrs: (rand(4, 48)).toFixed(2),
      });
      commitRowsGH.push({
        organizationId: org.id,
        repositoryId: repo.id,
        date: dateOnly,
        commits: rand(3, 20),
        authors: rand(1, 5),
      });
    }
  }

  for (let i = 0; i < prRows.length; i += CHUNK) {
    await prisma.gitHubPullRequestDaily.createMany({ data: prRows.slice(i, i + CHUNK), skipDuplicates: true });
  }
  for (let i = 0; i < commitRowsGH.length; i += CHUNK) {
    await prisma.gitHubCommitDaily.createMany({ data: commitRowsGH.slice(i, i + CHUNK), skipDuplicates: true });
  }
  console.log(`Inserted ${prRows.length} GitHub PR rows, ${commitRowsGH.length} commit rows`);

  // Jira Projects
  const jiraProjs = await prisma.jiraProject.createMany({
    data: [
      { organizationId: org.id, jiraProjectId: "jira_001", key: "FE",  name: "Frontend",     projectType: "software" },
      { organizationId: org.id, jiraProjectId: "jira_002", key: "BE",  name: "Backend API",  projectType: "software" },
      { organizationId: org.id, jiraProjectId: "jira_003", key: "MOB", name: "Mobile App",   projectType: "software" },
    ],
    skipDuplicates: true,
  });
  console.log(`Inserted ${jiraProjs.count} Jira projects`);

  const jiraProjectRecords = await prisma.jiraProject.findMany({ where: { organizationId: org.id } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jiraIssueRows: any[] = [];

  for (const proj of jiraProjectRecords) {
    for (let d = 6; d >= 0; d--) {
      const date = subDays(today, d);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      jiraIssueRows.push({
        organizationId: org.id,
        projectId: proj.id,
        date: dateOnly,
        opened: rand(2, 10),
        resolved: rand(1, 8),
        inProgress: rand(3, 15),
        bugs: rand(0, 3),
        storyPoints: (rand(8, 40)).toFixed(2),
        avgResolutionHrs: (rand(8, 72)).toFixed(2),
      });
    }
  }

  for (let i = 0; i < jiraIssueRows.length; i += CHUNK) {
    await prisma.jiraIssueDaily.createMany({ data: jiraIssueRows.slice(i, i + CHUNK), skipDuplicates: true });
  }
  console.log(`Inserted ${jiraIssueRows.length} Jira issue rows`);

  // Productivity Correlation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const corrRows: any[] = [];
  for (let d = 6; d >= 0; d--) {
    const date = subDays(today, d);
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    // Org-level correlation
    const aiSpend = rand(100, 600);
    const prsMerged = rand(5, 30);
    const commits = rand(20, 100);
    const tickets = rand(10, 50);
    corrRows.push({
      organizationId: org.id,
      teamId: null,
      date: dateOnly,
      aiSpendUsd: aiSpend.toFixed(6),
      prsMerged,
      commitsCount: commits,
      ticketsResolved: tickets,
      costPerPr: (aiSpend / Math.max(1, prsMerged)).toFixed(6),
      costPerTicket: (aiSpend / Math.max(1, tickets)).toFixed(6),
      adoptionScore: (rand(55, 85)).toFixed(2),
    });

    // Per-team correlations
    for (const teamName of TEAMS) {
      const teamSpend = rand(20, 120);
      const teamPrs = rand(1, 8);
      const teamTickets = rand(2, 15);
      corrRows.push({
        organizationId: org.id,
        teamId: teamMap[teamName],
        date: dateOnly,
        aiSpendUsd: teamSpend.toFixed(6),
        prsMerged: teamPrs,
        commitsCount: rand(3, 25),
        ticketsResolved: teamTickets,
        costPerPr: (teamSpend / Math.max(1, teamPrs)).toFixed(6),
        costPerTicket: (teamSpend / Math.max(1, teamTickets)).toFixed(6),
        adoptionScore: (rand(40, 90)).toFixed(2),
      });
    }
  }

  for (let i = 0; i < corrRows.length; i += CHUNK) {
    await prisma.productivityCorrelationDaily.createMany({ data: corrRows.slice(i, i + CHUNK), skipDuplicates: true });
  }
  console.log(`Inserted ${corrRows.length} productivity correlation rows`);

  // Notification Channels
  const emailChannel = await prisma.notificationChannel.create({
    data: {
      organizationId: org.id,
      name: "Engineering Alerts",
      type: "email",
      config: { email: "engineering@vaival.com" },
      enabled: true,
    },
  });
  const slackChannel = await prisma.notificationChannel.create({
    data: {
      organizationId: org.id,
      name: "Slack #ai-costs",
      type: "slack",
      config: { webhookUrl: "https://hooks.slack.com/demo/webhook" },
      enabled: true,
    },
  });

  // Notification delivery logs
  await prisma.notificationDeliveryLog.createMany({
    data: [
      { organizationId: org.id, notificationChannelId: emailChannel.id, subject: "Alert: Monthly budget at 92%", status: "sent", sentAt: subDays(today, 2) },
      { organizationId: org.id, notificationChannelId: slackChannel.id, subject: "Alert: OpenAI cost spike detected", status: "sent", sentAt: subDays(today, 1) },
      { organizationId: org.id, notificationChannelId: emailChannel.id, subject: "Alert: 5 inactive Copilot seats", status: "sent", sentAt: subDays(today, 3) },
    ],
  });
  console.log("Inserted notification channels and delivery logs");

  // Data Retention Policy
  await prisma.dataRetentionPolicy.create({
    data: {
      organizationId: org.id,
      retentionDays: 90,
      auditLogDays: 365,
      lastCleanupAt: subDays(today, 7),
    },
  });
  console.log("Inserted data retention policy");

  // ─── End Phase 3 Demo Data ─────────────────────────────────────────────────

  // Suppress unused variable warnings
  void ADOPTION_BADGES;
  void TEAM_STATUSES;
  void userBadgeMap;

  console.log("\nSeed complete!");
  console.log("Login: admin@tokenlens.ai / admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
