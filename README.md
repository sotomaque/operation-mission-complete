# Operation: Mission Complete

A surprise-party RSVP site with a "Top Secret" classified-intelligence theme.

- **Live event:** Saturday, August 15, 2026
- **Subject:** Josh's 50th
- **Rendezvous:** Top Sail — 1360 N Harbor Dr, San Diego, CA 92101

## Stack

- Next.js 15 (App Router) + React 19 RC + TypeScript
- Tailwind CSS 4
- Supabase (Postgres only — no Auth)
- Resend (logistics email blast)
- `iron-session` for admin-cookie signing
- `qrcode` for the print-ready QR generator
- Biome for lint + format

No tests, no CI. Vercel auto-deploys.

## Local dev

```bash
bun install
cp .env.example .env.local
# Fill in the env vars below, then:
bun dev
```

Open http://localhost:3000.

## Env vars

See `.env.example` for the full list with inline notes. Summary:

| Var | What |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (not actively used today; kept for future client reads) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key. Server-only. Bypasses RLS. |
| `ADMIN_PASSWORD` | Single shared password for `/admin` |
| `SESSION_SECRET` | iron-session signing secret. `openssl rand -base64 32` |
| `RESEND_API_KEY` | From https://resend.com/api-keys |
| `RESEND_FROM_EMAIL` | Verified Resend sender (e.g. `dossier@yourdomain.com`) |
| `NEXT_PUBLIC_APP_URL` | Public URL — drives the QR-encoded links |

## Supabase setup

1. Create a new project at https://supabase.com.
2. Project Settings → API: copy `URL`, `anon` key, and `service_role` key into `.env.local`.
3. SQL Editor → New query → paste the contents of `supabase/schema.sql` → Run.
4. Verify: `select count(*) from rsvps;` should return 0.

The schema is idempotent — safe to re-run if you tweak something.

## Routes

| Path | Purpose |
|---|---|
| `/` | Identity gate — "Are you Josh?" |
| `/decoy` | Locked-in decoy for Josh (permanent localStorage flag) |
| `/mission` | Fallback landing — pick which envelope you had |
| `/mission/adventure` | RSVP form, both Adventure + Welcome options visible |
| `/mission/welcome` | RSVP form, Welcome only |
| `/mission/confirmed` | Receipt page (pirate-themed for adventure) |
| `/admin/login` | Admin auth (single env-var password) |
| `/admin/dashboard` | Manifest, search, filter, edit, delete, capacity counters |
| `/admin/qr` | Print-ready QR codes for the two invite links |
| `/admin/email` | Resend-powered blast surface |
| `/admin/export` | CSV download |

## QR codes

Visit `/admin/qr` and either right-click the SVG to Save As, or click **Download SVG**. They encode `${NEXT_PUBLIC_APP_URL}/mission/{adventure,welcome}`, so make sure that env var is set to your production URL before generating prints.

## Adventure capacity

Capped at 50 by default. Editable from `/admin/dashboard`. The capacity check is race-safe via a Postgres function (`reserve_adventure_seat`) that locks the config row + counts existing adventure RSVPs + inserts the new one inside a single transaction.

## Vercel deployment

1. Push this repo to GitHub.
2. Vercel → Import Project → pick the repo → Framework auto-detects Next.js.
3. Add every env var from `.env.example` to the Vercel project (Production + Preview).
4. Deploy. The first deploy gives you a `*.vercel.app` URL — set `NEXT_PUBLIC_APP_URL` to that (or your custom domain) and redeploy so the QR codes encode the right URL.

No CI workflow file needed. Vercel auto-deploys on push to `main`.

## Theme

One consistent "classified dossier" treatment throughout (parchment, typewriter type, redacted bars, CLASSIFIED stamps, copper accents on dark navy). The Adventure option card and Adventure confirmation page get a brass accent to stand out, but the language, fonts, and styling stay uniformly "Top Secret" — no nautical/pirate vibe.

Premium not cartoonish — copper/brass accents, a single typewriter typeface (Special Elite) + mono, paper grain via SVG noise (no PNG textures).
