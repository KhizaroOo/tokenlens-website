# ENVIRONMENT.md

> Environment-variable reference, inspected directly from `process.env.*` usage in the codebase.
> Verified on **2026-05-28**.

---

## 1 · Required at runtime

| Variable | Required? | Used by | Purpose | Example placeholder |
|---|---|---|---|---|
| `DATABASE_URL` | **Yes** | `lib/prisma.ts`, all DB code | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/tokenlens` |
| `JWT_SECRET` | **Yes** | `lib/auth.ts` | HS256 signing key for `tl_session` JWT cookie | `<openssl rand -base64 32>` |
| `ENCRYPTION_KEY` | **Yes** | `lib/encryption.ts` | AES-256-GCM key for `ProviderConnection.encryptedCredentials` | `<openssl rand -base64 32>` |
| `NODE_ENV` | Set by host | `lib/auth.ts` cookie `secure` flag, Next.js | `development` / `production` / `test` | `production` |

**All three secrets must be set in production. None should be committed to git. None should be reused across environments.**

---

## 2 · Build-time only (used by `next.config.ts`)

| Variable | Required? | Used by | Purpose | Example placeholder |
|---|---|---|---|---|
| `NEXT_OUTPUT_MODE` | No | `next.config.ts` | Set to `export` to build the marketing-only static site (no proxy/API/auth) | `export` |
| `NEXT_PUBLIC_BASE_PATH` | No | `next.config.ts` | Path prefix for sub-path deploys (e.g. `/tokenlens` on a shared domain) | `/tokenlens` |

Both default to unset (server mode, root path).

## 1-bis · Email notifications (used by `lib/email.ts`)

Required to actually **deliver** the lead-capture notification emails. If any of the three are missing, lead capture still succeeds (rows persist to Postgres), the API returns 200, and the row is flagged with `notificationError = "missing_config:<which>"` for triage. No raw secret is ever logged.

| Variable | Required for email? | Used by | Purpose | Example placeholder |
|---|---|---|---|---|
| `RESEND_API_KEY` | **Yes** | `lib/email.ts` | Authenticates with Resend. Get one at [resend.com/api-keys](https://resend.com/api-keys). | `re_xxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxx` |
| `EMAIL_FROM` | **Yes** | `lib/email.ts` | The `From:` address on every outbound email. Must use a verified Resend domain. | `TokenLens <noreply@tokenlens.io>` |
| `LEAD_NOTIFICATION_EMAIL` | **Yes** | `app/api/contact`, `app/api/demo-request` | Where new lead alerts are delivered (sales inbox / shared address). | `sales@tokenlens.io` |

If none are set, the implementation is "Implemented — pending email env configuration": forms work, rows persist, but no email goes out.

## 2-bis · Canonical site URL (public, used by `lib/site.ts`)

| Variable | Required? | Used by | Purpose | Example placeholder |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Strongly recommended in production** | `lib/site.ts` → `app/robots.ts`, `app/sitemap.ts`, OG metadata | Canonical absolute origin used in `robots.txt`, `sitemap.xml`, and `<link rel="canonical">`-style URLs. **No trailing slash.** | `https://tokenlens.ai` |
| `APP_URL` | Alias for `NEXT_PUBLIC_SITE_URL` | `lib/site.ts` | Some platforms (Heroku-style) prefer non-`NEXT_PUBLIC_` env names. Either one works. | `https://tokenlens.ai` |
| `NEXT_PUBLIC_VERCEL_URL` | Auto-set by Vercel | `lib/site.ts` fallback | Used only if neither of the above is set. Vercel injects host without scheme — `lib/site.ts` prefixes `https://`. | (auto) |

Resolution order: `NEXT_PUBLIC_SITE_URL` / `APP_URL` → `NEXT_PUBLIC_VERCEL_URL` → `http://localhost:3000` (dev) → `https://tokenlens.ai` (prod placeholder).

**TODO before public launch:** set `NEXT_PUBLIC_SITE_URL` so the sitemap, robots, and OG image references point at the actual canonical domain. Until then, production builds with no env will use the `https://tokenlens.ai` placeholder.

---

## 3 · Provider credentials (NOT env vars)

Provider API keys (Anthropic Admin, OpenAI, GitHub PAT, Cursor, Microsoft Graph) are **not** environment variables. They are:

1. Entered through `Settings → Provider Integrations` in the dashboard.
2. Encrypted with AES-256-GCM (`lib/encryption.ts`) using `ENCRYPTION_KEY`.
3. Stored in `ProviderConnection.encryptedCredentials` (Prisma).
4. Decrypted in memory only inside sync workers (`workers/sync-*.worker.ts`) when calling provider APIs.

**Never put provider credentials in `.env`.** If you see code referencing `process.env.ANTHROPIC_*` or similar, treat it as a bug.

---

## 4 · System / framework variables (set automatically)

These appear in `process.env.*` references but are managed by Node / Next.js / the host. **Do not set manually:**

`PATH`, `PATHEXT`, `HOST`, `NODE_UNIQUE_ID`, `NODE_DISABLE_COLORS`, `DEBUG`, `DOTENV_KEY`, `NEXT_DEPLOYMENT_ID`, `BOOK_LANG`, `TEST_DIST`.

(Most of these come from third-party libraries.)

---

## 5 · `.env` template

A minimal `.env` for local dev:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tokenlens"

# Auth (generate with: openssl rand -base64 32)
JWT_SECRET="REPLACE_ME_32_BYTES_BASE64"

# Provider credential encryption (generate with: openssl rand -base64 32)
ENCRYPTION_KEY="REPLACE_ME_32_BYTES_BASE64"

# Recommended in production: canonical public origin (no trailing slash)
# Used by robots.txt, sitemap.xml, and OG image absolute URLs
# NEXT_PUBLIC_SITE_URL="https://tokenlens.io"

# Optional but recommended: email notifications for lead capture (Resend)
# Until all three are set, forms still work — submissions land in Postgres
# but no email is sent. The row gets notificationError flagged.
# RESEND_API_KEY="re_REPLACE_ME"
# EMAIL_FROM="TokenLens <noreply@tokenlens.io>"
# LEAD_NOTIFICATION_EMAIL="sales@tokenlens.io"

# Optional: only for sub-path deploys
# NEXT_PUBLIC_BASE_PATH=""

# Optional: only for static marketing-only export
# NEXT_OUTPUT_MODE=""
```

Copy this into `.env` (or `.env.local`) and replace the placeholders. **Do not commit `.env` to git.** A `.gitignore` entry should already cover it.

---

## 6 · Production-host configuration tips

| Host | How to set env vars |
|---|---|
| **Vercel** | Project → Settings → Environment Variables. Mark `JWT_SECRET` and `ENCRYPTION_KEY` as sensitive. Set for Production + Preview + Development as needed. |
| **Railway / Render** | Service → Variables tab. Add all four. |
| **DigitalOcean App Platform** | Component → Settings → Environment Variables. |
| **AWS (ECS/Fargate)** | Secrets Manager + task definition env mapping. |
| **Self-hosted** | Use a process manager (`pm2`, `systemd`) with an env file outside the repo. |

---

## 7 · Rotation guidance

| Variable | Rotation impact |
|---|---|
| `DATABASE_URL` | Painless if app is restarted. |
| `JWT_SECRET` | Invalidates every existing `tl_session` — forces all users to log in again. OK on a schedule. |
| `ENCRYPTION_KEY` | **High-impact.** Every stored `ProviderConnection.encryptedCredentials` becomes unreadable. Must run a migration script that decrypts with the old key + re-encrypts with the new key before swapping. Plan downtime. |

---

## 8 · CI / GitHub Actions notes

If you add CI later:

- `npx tsc --noEmit` and `npm run lint` need no secrets.
- `npm run build` does **not** need DB access (Prisma client generates against the schema, not the live DB).
- `prisma migrate deploy` needs `DATABASE_URL` — use a GitHub Actions environment secret.
- Never echo `JWT_SECRET` / `ENCRYPTION_KEY` in CI logs.

---

## 9 · Variables not in use (for future reference)

These commonly appear in similar projects but are **not used** by TokenLens today:

- `NEXTAUTH_*` — not used (custom JWT auth, not NextAuth.js).
- `STRIPE_*` — billing not implemented.
- `SENTRY_DSN` — error tracking not wired (recommended for production).
- `SLACK_WEBHOOK_URL` — Slack channel notifications not wired (Phase 2B). (`RESEND_API_KEY` IS used today — see §1-bis above.)
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc. — provider creds are stored in DB, not env.

If you add any of these in the future, document them here and update `lib/` accordingly.
