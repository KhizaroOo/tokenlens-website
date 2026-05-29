# Dashboard screenshots

Drop the real product dashboard screenshots here:

| File | Used when | Aspect ratio |
|------|-----------|--------------|
| `dashboard-light.png` | Visitor is in light mode | ~16:9 (e.g. 1920×1078) |
| `dashboard-dark.png`  | Visitor is in dark mode  | ~16:9 (e.g. 1920×1078) |

They are rendered by `components/marketing/DashboardMockup.tsx`, which:
- Picks the file matching the current theme (`next-themes`)
- Uses `next/image` with `fill` + `object-cover object-top`
- Falls back to a placeholder card if the file is missing — so the marketing
  site keeps working before the files land

Recommended source: take a fresh `/dashboard` screenshot in both themes after
logging in as the demo user (`admin@tokenlens.ai` / `admin123`).
