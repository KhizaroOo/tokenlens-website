/**
 * Microsoft 365 Copilot connector via Microsoft Graph API.
 *
 * Credential format stored: JSON { "tenantId": "...", "clientId": "...", "clientSecret": "..." }
 * Auth flow: OAuth 2.0 client credentials (app-only)
 * Required permissions: Reports.Read.All (application permission, admin consent required)
 * Required license: Microsoft 365 Copilot per-user license
 *
 * What we can fetch:
 *   - Active users per app (Teams, Word, Excel, Outlook, PowerPoint, OneNote, Loop, Copilot Chat)
 *   - Last activity date per user per app
 *   - Licensed seat counts via subscribedSkus
 *
 * What we CANNOT fetch:
 *   - Dollar cost (computed: seats × ~$30/month)
 *   - Prompt counts per user (only last-activity dates)
 *   - Data at daily granularity (only rolling D7/D30/D90/D180 windows)
 *
 * Note: The user-detail endpoint is Graph beta. Microsoft v1.0 path exists at
 * /copilot/reports/ but user-detail granularity requires beta.
 */

const GRAPH_BASE = "https://graph.microsoft.com/beta";
const TOKEN_URL = (tenantId: string) =>
  `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

export interface MicrosoftCredential {
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

export function parseMicrosoftCredential(raw: string): MicrosoftCredential {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      "Invalid Microsoft credential format. Expected JSON: {\"tenantId\":\"...\",\"clientId\":\"...\",\"clientSecret\":\"...\"}"
    );
  }
  const { tenantId, clientId, clientSecret } = parsed as Partial<MicrosoftCredential>;
  if (!tenantId || typeof tenantId !== "string") {
    throw new Error("Microsoft credential missing tenantId (Azure Directory/Tenant ID)");
  }
  if (!clientId || typeof clientId !== "string") {
    throw new Error("Microsoft credential missing clientId (Application/Client ID from Entra App Registration)");
  }
  if (!clientSecret || typeof clientSecret !== "string") {
    throw new Error("Microsoft credential missing clientSecret (Client Secret Value from Entra App Registration)");
  }
  // Basic GUID format check for tenantId and clientId
  const guidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!guidRe.test(tenantId)) {
    throw new Error(`tenantId does not look like a valid GUID: "${tenantId}" — copy it from Azure Portal → Entra ID → Overview`);
  }
  if (!guidRe.test(clientId)) {
    throw new Error(`clientId does not look like a valid GUID: "${clientId}" — copy it from your App Registration → Overview`);
  }
  return { tenantId, clientId, clientSecret };
}

async function getAccessToken(cred: MicrosoftCredential): Promise<string> {
  const body = new URLSearchParams({
    grant_type:    "client_credentials",
    client_id:     cred.clientId,
    client_secret: cred.clientSecret,
    scope:         "https://graph.microsoft.com/.default",
  });

  const res = await fetch(TOKEN_URL(cred.tenantId), {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`Microsoft auth failed: ${data.error_description ?? res.status}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

async function graphFetch(token: string, path: string) {
  const res = await fetch(`${GRAPH_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Graph API ${res.status}: ${body.slice(0, 200)}`);
  }
  // Some Graph endpoints return CSV
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("text/plain") || contentType.includes("text/csv")) {
    return res.text();
  }
  return res.json();
}

export interface M365CopilotUserRow {
  userPrincipalName: string;
  displayName: string;
  lastActivityDateTeams?: string;
  lastActivityDateWord?: string;
  lastActivityDateExcel?: string;
  lastActivityDatePowerPoint?: string;
  lastActivityDateOutlook?: string;
  lastActivityDateOneNote?: string;
  lastActivityDateLoop?: string;
  lastActivityDateCopilotChat?: string;
  hasOtherProductsLicense: boolean;
  hasCopilotLicense: boolean;
}

/**
 * Maps the literal CSV column names returned by Microsoft Graph to the
 * camelCase field names used in M365CopilotUserRow.
 * The Graph endpoint returns headers like "Last Activity Date (Teams)"
 * which must be normalized before field access via dot notation.
 */
const CSV_HEADER_MAP: Record<string, keyof M365CopilotUserRow> = {
  "User Principal Name":            "userPrincipalName",
  "Display Name":                   "displayName",
  "Last Activity Date (Teams)":     "lastActivityDateTeams",
  "Last Activity Date (Word)":      "lastActivityDateWord",
  "Last Activity Date (Excel)":     "lastActivityDateExcel",
  "Last Activity Date (PowerPoint)":"lastActivityDatePowerPoint",
  "Last Activity Date (Outlook)":   "lastActivityDateOutlook",
  "Last Activity Date (OneNote)":   "lastActivityDateOneNote",
  "Last Activity Date (Loop)":      "lastActivityDateLoop",
  "Last Activity Date (Copilot Chat)": "lastActivityDateCopilotChat",
  "Has Other Products License":     "hasOtherProductsLicense",
  "Has Copilot License":            "hasCopilotLicense",
};

/** Parse the CSV response from the Graph user-detail endpoint. */
function parseCopilotUserDetailCSV(csv: string): M365CopilotUserRow[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];
  const rawHeaders = lines[0].split(",").map(h => h.replace(/^"|"$/g, "").trim());
  // Map raw CSV headers to M365CopilotUserRow field names
  const mappedHeaders = rawHeaders.map(h => CSV_HEADER_MAP[h] ?? null);

  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.replace(/^"|"$/g, "").trim());
    const row: Record<string, string | boolean> = {};
    mappedHeaders.forEach((fieldName, i) => {
      if (!fieldName) return; // skip unmapped columns (e.g. "Report Refresh Date")
      const val = values[i] ?? "";
      row[fieldName] = val === "True" ? true : val === "False" ? false : val;
    });
    return row as unknown as M365CopilotUserRow;
  });
}

export async function testMicrosoftConnection(
  cred: MicrosoftCredential
): Promise<{ ok: boolean; error?: string }> {
  try {
    const token = await getAccessToken(cred);
    await graphFetch(token, "/subscribedSkus?$top=1&$select=skuId");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function fetchM365CopilotUsers(
  cred: MicrosoftCredential,
  period: "D7" | "D30" | "D90" = "D30"
): Promise<M365CopilotUserRow[]> {
  const token = await getAccessToken(cred);
  const csv = await graphFetch(
    token,
    `/reports/getMicrosoft365CopilotUsageUserDetail(period='${period}')`
  ) as string;
  return parseCopilotUserDetailCSV(csv);
}

export interface M365SeatCount {
  totalLicensed: number;
  skuPartNumber: string;
}

export async function fetchM365CopilotSeats(cred: MicrosoftCredential): Promise<M365SeatCount> {
  const token = await getAccessToken(cred);
  const data = await graphFetch(token, "/subscribedSkus?$select=skuPartNumber,consumedUnits") as {
    value: { skuPartNumber: string; consumedUnits: number }[];
  };

  const copilotSku = (data.value ?? []).find(s =>
    s.skuPartNumber?.includes("COPILOT") ||
    s.skuPartNumber?.includes("M365_COPILOT") ||
    s.skuPartNumber?.toLowerCase().includes("copilot")
  );

  return {
    totalLicensed: copilotSku?.consumedUnits ?? 0,
    skuPartNumber: copilotSku?.skuPartNumber ?? "MICROSOFT_365_COPILOT",
  };
}
