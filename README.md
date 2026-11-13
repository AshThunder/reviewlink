# ReviewLink

**Client approval without a Buffer login.**

Share a private, no-login link to next week’s Buffer queue. Your client taps Approve or Request changes on their phone, and every decision is written back into Buffer as a collaboration Note.

Built for [Buffer Commit](https://buffer.com/api/commit) 2026.

## Live app

Production: [https://reviewlink-commit.vercel.app](https://reviewlink-commit.vercel.app)

## How it works

1. A social media manager signs in with Buffer (OAuth 2.0 + PKCE).
2. ReviewLink lists their scheduled posts for a date range.
3. They create an unguessable review link and send it to the client (WhatsApp, email, anywhere).
4. The client reviews on their phone — no Buffer account.
5. Decisions are saved as Notes on each post in Buffer.

## Stack

- Next.js App Router (TypeScript) on Vercel
- Tailwind CSS, kit design tokens (teal accent, Inter, warm off-white)
- Buffer GraphQL API (`https://api.buffer.com`)
- Upstash Redis for sessions, encrypted OAuth tokens, and review links

## Local development

Buffer requires **HTTPS** redirect URIs, including on localhost.

```bash
cp .env.example .env.local
# fill in values, then:
npm install
npm run dev:https
```

Open `https://localhost:3000` and accept the self-signed certificate.

Registered local callback: `https://localhost:3000/api/auth/callback`.

## Environment variables

| Name | Purpose |
| --- | --- |
| `BUFFER_CLIENT_ID` | Buffer app client ID |
| `BUFFER_CLIENT_SECRET` | Confidential client secret (server only) |
| `BUFFER_REDIRECT_URI` | Exact OAuth callback URL |
| `APP_URL` | Public origin |
| `SESSION_SECRET` | Signs the short-lived OAuth PKCE cookie |
| `TOKEN_ENC_KEY` | AES-256-GCM key for tokens at rest (32 bytes, hex) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Redis (or `KV_REST_API_URL` / `KV_REST_API_TOKEN`) |

Never commit `.env*` files or the client secret.

## Buffer API surface

Scopes requested: `account:read`, `channels:read`, `posts:read`, `notes:read`, `notes:write`, `offline_access`.

Queries and mutations: `account`, `channels`, `posts` (scheduled, `dueAt` range), `createCollaborationNote`.

## License

Built overnight for Buffer Commit. All ReviewLink product work is original to the contest window.
