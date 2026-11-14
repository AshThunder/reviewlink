# ReviewLink — Buffer Commit submission answers

Form: https://buffer.com/api/commit/submit · **Deadline: Sat 14 Nov 2026, 8:59 AM Lagos (WAT)** (13 Nov 11:59 PM PT). You cannot edit after submitting, so check every field first.

Legend: ✅ ready to paste · ✍️ Anak must fill or confirm

| Field | Answer |
| --- | --- |
| Email ✍️ | The email on the Buffer account you registered with, probably `chrisgoldog@gmail.com`. Confirm it matches your registration. |
| Full legal name ✍️ | Eromonsele Michael Osagie (confirm exact spelling as on your ID; used for payouts) |
| Team submission? ✅ | No |
| Main social media handle ✍️ | X – @ChrisGold__ (confirm) |
| Social handles (if asked) ✍️ | `Eromonsele Michael Osagie: X – @ChrisGold__` (add others if you want them tagged) |
| Project name ✅ | ReviewLink |
| Public URL of your live app ✅ | https://reviewlink-commit.vercel.app |
| Buffer API app client ID ✅ | `wAXMkNuNOcPwB5mvykY6gRsCh_WVEjXnu3LsnHuxALv` (client ID only, never the secret) |
| Demo video link ✍️ | Paste a public YouTube (unlisted is fine) or Loom link once uploaded. Keep it ≤ 2:00. See `DEMO-SCRIPT.md`. |
| Project summary ✅ | See the write-up below (~300 words) |
| Did you start from an existing project? ✅ | No. The repo’s first commit is 13 Nov 2026, 11:18 PM WAT, inside the build window. |
| Agree to Terms ✍️ | Read https://buffer.com/api/commit/terms and tick **Agree** (declining rejects the submission). |
| Building in public? (optional) ✍️ | Only answer Yes if you have up to 5 public posts about Buffer Commit made between 15 Oct and 13 Nov 11:59 PM PT; otherwise No. |

Extra links (for the summary, the video description, or anywhere links are allowed):

- Repo: https://github.com/AshThunder/reviewlink
- Privacy: https://reviewlink-commit.vercel.app/privacy
- How it’s built: https://reviewlink-commit.vercel.app/#how-its-built

**One-liner:** Client approval without a Buffer login. Share one private link, your client approves or requests changes on their phone, and every decision lands back in Buffer as a note.

## Buffer API features used

- OAuth 2.0 Authorization Code + PKCE (S256), confidential client, `offline_access` refresh tokens (single-flight refresh lock)
- Scopes: `account:read`, `posts:read`, `notes:read`, `notes:write`, `offline_access` (no `posts:write`; ReviewLink never edits posts)
- GraphQL `account` (organizations) and `channels` queries
- GraphQL `posts` query, scheduled posts filtered by `dueAt` range
- `createCollaborationNote` mutation, `subject: { postId }`, one note per client decision
- `collaborationNotes` query for read-back (status view, duplicate-safe retries)

## Project summary (~310 words, paste as is)

Social media freelancers and small agencies schedule a client's week in Buffer, then spend days chasing approval. The client doesn't have (or want) a Buffer seat, so posts get screenshotted into WhatsApp, feedback comes back as scattered messages like "change the second one", and the manager re-types it all into Buffer. Approvals get lost, and posts go out late or unapproved.

ReviewLink fixes the hand-off. The manager connects Buffer, picks a channel and date range, ticks the scheduled posts, and gets one private review link (128-bit random, 30-day expiry, revocable). The client opens it on their phone with no account and no login, and sees each post as it will appear on X, with the scheduled time in their own time zone. They add their name, tap Approve or Request changes with a comment, and send. Every decision lands back on the post in Buffer as a collaboration note ("✅ Approved by Ngozi via ReviewLink" or "✏️ Changes requested by Ngozi: …"), so the team sees it where they already work. The dashboard tracks each link: approved, needs changes, pending.

How it uses the Buffer API: OAuth 2.0 Authorization Code with PKCE as a confidential client, with offline_access for refresh tokens. Scopes are account:read, posts:read, notes:read and notes:write, deliberately without posts:write, so ReviewLink can never alter a post. It uses the GraphQL account and channels queries, the posts query filtered by dueAt for the chosen week, the createCollaborationNote mutation with subject { postId } for write-back, and the collaborationNotes query for read-back on the status page and duplicate-free retries. Buffer tokens are AES-256-GCM encrypted in Upstash Redis and never reach the browser.

Audience: freelance social managers, agencies, and any creator who needs sign-off from someone outside Buffer.

What's next: automatic re-review when a post is edited, Instagram and LinkedIn previews, approval reminders, and an approval filter on the Buffer queue.

## Pre-submit checklist

- [ ] Live app opens logged-out at https://reviewlink-commit.vercel.app and Connect Buffer works
- [ ] Video ≤ 2:00, public/unlisted, plays in a private window
- [ ] Client ID pasted (not the secret)
- [ ] Repo is public: https://github.com/AshThunder/reviewlink
- [ ] Keep the app and Buffer app client live through judging (~16–20 Nov) and don’t revoke the demo link
