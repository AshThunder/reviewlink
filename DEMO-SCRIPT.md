# ReviewLink — demo video script (≤ 2:00)

Target length **1:50**; judges don't have to watch past 2:00. Everything is live: https://reviewlink-commit.vercel.app with Anak's real Buffer account and the **@ChrisGold__** X queue (6 posts scheduled Mon 16 – Sat 21 Nov).

## Before you record (10 minutes)

- **Laptop:** Chrome, clean profile or incognito, bookmarks bar hidden, notifications off, zoom 110–125%. Sign in at https://reviewlink-commit.vercel.app → **Connect Buffer** so `/app` is ready. In a second tab, open https://publish.buffer.com on the @ChrisGold__ queue.
- **Phone:** Do Not Disturb on, battery/notification bar tidy. Keep the old "Chris" link closed; you'll make a fresh one.
- Use a realistic client name, e.g. **"Chris Gold — week of 16 Nov"**, and a real-sounding reviewer name, e.g. **"Ngozi"** (not "John" or "test").
- Write the reviewer comment in advance: *"Love it — can we say 'this Saturday' instead of the date?"*
- Do one full dry run. Then record the laptop and the phone separately and cut them together.

## Shot list

| Time | Device | On-screen action | Voiceover |
| --- | --- | --- | --- |
| **0:00–0:08** | Laptop | Landing page hero ("Client approval without a Buffer login."), cursor resting on **Connect Buffer**. | "This is ReviewLink: client approval for your Buffer queue, without the client ever needing a Buffer login." |
| **0:08–0:20** | Laptop (or phone) | Optional: a 3-second WhatsApp chat full of post screenshots and "change the 2nd one" (mock it with a friend), then cut back to the landing page. | "If you manage socials for clients, you know the pain: screenshots in WhatsApp, feedback scattered everywhere, then re-typing it all into Buffer." |
| **0:20–0:38** | Laptop | Go to `/app` (already connected). Show the **@ChrisGold__** posts for 16–22 Nov, all ticked. Click **Create review link**, type "Chris Gold — week of 16 Nov", click **Create link**. The green **Review link ready** panel appears at the top; click **Copy link**. | "I connect Buffer once with OAuth. ReviewLink pulls my scheduled posts for the week through Buffer's API. I pick the posts, create one private link, and send it, on WhatsApp for example." |
| **0:38–0:45** | Phone | Open the link (paste it into the phone browser or tap it in WhatsApp). Page loads: "Chris Gold — week of 16 Nov", **Step 1 · Tell us who's reviewing**. | "My client opens it on their phone. No account, no login." |
| **0:45–0:52** | Phone | Tap **Approve** on post 1 *before* typing a name: the name card turns red with "Add your name first". Type **Ngozi**. | "First they say who's reviewing, so every decision carries a name." |
| **0:52–1:12** | Phone | Tap **Approve** on posts 1–3 (each card turns green with ✓ Approved). On post 4, tap **Request changes** (it turns amber) and type the comment. Approve posts 5–6 (or tap **Approve all remaining**). Point at the progress bar: "6 of 6 reviewed". | "Each post shows exactly how it'll look on X, at the scheduled time in their own time zone. Green is approved; amber means changes, with a comment." |
| **1:12–1:20** | Phone | Tap **Send decisions to …**. Thank-you screen with confetti and the **Sent to Buffer** stamp. | "One tap to send." |
| **1:20–1:32** | Laptop | Refresh `/app`. The new link at the top shows **Needs changes** with "5 of 6 approved". Open it: the status page shows each post as approved / changes, the comment, and that notes synced. | "Back on my side, I see the result straight away: five approved, one change, and the client's comment." |
| **1:32–1:45** | Laptop | Switch to the publish.buffer.com tab, open the post with the requested change, and show its note: **"✏️ Changes requested by Ngozi: … (via ReviewLink)"**. Then show one **"✅ Approved by Ngozi via ReviewLink"**. Hold for 2 seconds. | "And here's the magic: every decision is already in Buffer, as a note on the post, written with Buffer's createCollaborationNote API. No copy-paste." |
| **1:45–1:55** | Laptop | Scroll the landing page to **How it's built** (flow diagram + stack cards). | "It's built on Buffer's GraphQL API with OAuth and PKCE, read-only on posts, with notes write-back, on Next.js, Vercel and Upstash Redis, with encrypted tokens and unguessable links." |
| **1:55–2:00** | Laptop | End card: reviewlink-commit.vercel.app · github.com/AshThunder/reviewlink | "ReviewLink. Try it at reviewlink-commit.vercel.app. Thanks!" |

If you're running long, cut the 0:08–0:20 problem shot and say the problem line over the landing page.

## Recording tips (free tools)

- **Phone:** use the built-in screen recorder (Android: Quick Settings → Screen record; iPhone: Control Center → Screen Recording). Record in portrait, then place it centred on a 16:9 canvas in the edit.
- **Laptop:** **Loom** (free, records screen + voice and gives you a share link immediately), or OBS / Xbox Game Bar (Windows), or the macOS Screenshot toolbar (⌘⇧5).
- **Edit:** **CapCut** (free, desktop or phone): put the laptop and phone clips on the timeline, cut loading waits, add a zoom on the Buffer note, add auto-captions (good for judges watching on mute), and use **no copyrighted music**. Export 1080p, 16:9.
- **Voice:** record voiceover in CapCut over the finished cut in a quiet room, phone mic close. Or narrate live in Loom and re-take until it's clean.
- **Upload:** YouTube as **Unlisted** (allow ~30 minutes of processing) or Loom (instant). Open the link in a private window to check it plays without login, then paste it into the form.
- **Timing:** start recording by ~7:00 AM and upload by ~8:15 AM WAT. The form closes at **8:59 AM WAT** and can't be edited after submission.

## Don'ts

- Don't show the `.env`, the Vercel dashboard, or the Buffer app client secret on screen.
- Don't leave "test" captions in shot; the @ChrisGold__ posts are fine, just don't linger on "(Buffer API test post)". Your client name and reviewer name carry the story.
- Don't revoke the demo link or disconnect the Buffer app before judging (~16–20 Nov).
