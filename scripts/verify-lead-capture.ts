/**
 * Verification script — confirms the two valid POSTs from the manual smoke
 * test actually persisted to Postgres, that the honeypot submission did NOT
 * persist, and that no raw IP is stored.
 *
 * Run with: npx tsx scripts/verify-lead-capture.ts <test-name>
 *
 * Safe to run any time. Does not delete or modify any data.
 */

import { PrismaClient } from "@prisma/client";

const testName  = process.argv[2];
const testEmail = process.argv[3];

if (!testName || !testEmail) {
  console.error("usage: tsx scripts/verify-lead-capture.ts <test-name> <test-email>");
  process.exit(2);
}

const prisma = new PrismaClient();

async function main() {
  console.log(`\n═══ Looking up rows by email = ${testEmail} ═══\n`);

  const contact = await prisma.contactSubmission.findFirst({
    where:  { workEmail: testEmail },
    orderBy: { createdAt: "desc" },
  });
  const demo = await prisma.demoRequest.findFirst({
    where:   { workEmail: testEmail },
    orderBy: { createdAt: "desc" },
  });

  // Honeypot: spam.com email — must NOT exist
  const honeyEmail = `bot-${testName}@spam.com`;
  const honeyRow   = await prisma.contactSubmission.findFirst({
    where: { workEmail: honeyEmail },
  });

  // ── Print findings
  function fmt(row: Record<string, unknown> | null) {
    if (!row) return "  ❌ NOT FOUND";
    const safe = { ...row };
    return Object.entries(safe)
      .map(([k, v]) => `    ${k.padEnd(15)} ${typeof v === "string" && v.length > 60 ? v.slice(0, 60) + "…" : v}`)
      .join("\n");
  }

  console.log("ContactSubmission:");
  console.log(fmt(contact));
  console.log("\nDemoRequest:");
  console.log(fmt(demo));
  console.log("\nHoneypot ContactSubmission (must be null):");
  console.log(`  honey row: ${honeyRow ? "❌ FOUND (BUG — honeypot leaked!)" : "✅ null (correctly dropped)"}`);

  // ── Privacy checks
  console.log("\n═══ Privacy checks ═══");
  const checks: { name: string; ok: boolean; detail: string }[] = [];
  if (contact) {
    checks.push({
      name: "Contact: no raw IP",
      ok:   !("ipAddress" in contact) && !("ip" in contact) && !("sourceIp" in contact),
      detail: "schema has only `ipHash`, no raw IP column",
    });
    checks.push({
      name: "Contact: ipHash present or null (not a real IP)",
      ok:   contact.ipHash === null || (typeof contact.ipHash === "string" && !/^\d+\.\d+\.\d+\.\d+$/.test(contact.ipHash)),
      detail: `value: ${contact.ipHash ?? "null"}`,
    });
    checks.push({
      name: "Contact: userAgent captured",
      ok:   typeof contact.userAgent === "string" && contact.userAgent.length > 0,
      detail: `length: ${(contact.userAgent ?? "").length} chars`,
    });
  }
  if (demo) {
    checks.push({
      name: "Demo: no raw IP",
      ok:   !("ipAddress" in demo) && !("ip" in demo) && !("sourceIp" in demo),
      detail: "schema has only `ipHash`",
    });
    checks.push({
      name: "Demo: preferredTime captured",
      ok:   demo.preferredTime === "Next week",
      detail: `value: ${demo.preferredTime}`,
    });
  }

  for (const c of checks) {
    console.log(`  ${c.ok ? "✅" : "❌"} ${c.name.padEnd(40)} — ${c.detail}`);
  }

  // ── Counts (just to give a sense of overall table state)
  const totalContact = await prisma.contactSubmission.count();
  const totalDemo    = await prisma.demoRequest.count();
  console.log(`\n═══ Table counts ═══`);
  console.log(`  ContactSubmission rows total: ${totalContact}`);
  console.log(`  DemoRequest      rows total: ${totalDemo}`);

  const allOk =
    contact !== null &&
    demo !== null &&
    honeyRow === null &&
    checks.every(c => c.ok);

  console.log(`\n═══ Result: ${allOk ? "✅ ALL CHECKS PASSED" : "❌ SOME CHECKS FAILED"} ═══\n`);
  process.exit(allOk ? 0 : 1);
}

main()
  .catch((e) => { console.error(e); process.exit(2); })
  .finally(() => prisma.$disconnect());
