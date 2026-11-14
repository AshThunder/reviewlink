# ReviewLink — demo video script (≤ 2:00)

Target length **1:50**; judges don't have to watch past 2:00. Everything is live: https://reviewlink-commit.vercel.app with Anak's real Buffer account and the **@ChrisGold__** X queue (6 posts scheduled Mon 16 – Sat 21 Nov).

## Before you record (10 minutes)

- **Laptop:** Chrome, clean profile or incognito, bookmarks bar hidden, notifications off, zoom 110–125%. Sign in at https://reviewlink-commit.vercel.app → **Connect Buffer** so `/app` is ready. In a second tab, open https://publish.buffer.com on the @ChrisGold__ queue.
- **Phone:** Do Not Disturb on, battery/notification bar tidy. Keep the old "Chris" link closed; you'll make a fresh one.
- Use a realistic client name, e.g. **"Chris Gold — week of 16 Nov"**, and a real-sounding reviewer name, e.g. **"Ngozi"** (not "John" or "test").
- Write the reviewer comment in advance: *"Love it — can we say 'this Saturday' instead of the date?"*
- On the phone, open the link in a **private tab** so no saved name or draft from earlier tests is pre-filled (the Step 1 moment needs an empty name).
- Do one full dry run. Then record the laptop and the phone separately and cut them together.

## Shot list

| Time | Device | On-screen action | Voiceover |
| --- | --- | --- | --- |
| **0:00–0:08** | Laptop | Landing hero: "New · Client decisions land in Buffer as notes" pill, the big headline "Client approval, without a Buffer login.", and the product preview tile below. Cursor rests on **Connect Buffer**. | "This is ReviewLink: client approval for your Buffer queue, without the client ever needing a Buffer login." |
| **0:08–0:18** | Laptop | Scroll once to **How it works**: 1 Connect Buffer → 2 Pick posts and share a link → 3 Your client approves. | "If you manage socials for clients, you know the pain: screenshots in WhatsApp, feedback everywhere, then re-typing it all into Buffer. ReviewLink is three steps." |
| **0:18–0:36** | Laptop | Go to `/app` (already connected). **Step 1 · Choose posts**: the @ChrisGold__ posts for 16–22 Nov are listed, all ticked. **Step 2**: type "Chris Gold — week of 16 Nov" and click **Create link for 6 posts**. The page moves to **Step 3 · Send it to your client**; click **Copy link** (or WhatsApp). | "I connect Buffer once, and ReviewLink pulls my scheduled posts through Buffer's API. I pick the posts, create one private link, and send it, on WhatsApp for example." |
| **0:36–0:46** | Phone | Open the link. The page shows "Chris Gold — week of 16 Nov", a one-line intro ("… wants your OK on 6 posts. Approve each one or ask for changes, then tap Send."), and the **Step 1 · Tell us who's reviewing** card. Tap **Approve** on post 1 *before* typing a name: the card turns red, "Add your name first…". Type **Ngozi**. | "My client opens it on their phone. No account, no login. They just say who's reviewing, so every decision carries a name." |
| **0:46–0:56** | Phone | Tap **Approve** on post 1. The buttons become a teal **"Approved · Saved"** row with a **Change** link, and the page glides to post 2. Approve post 2 the same way. | "Each post looks exactly as it will on X, at the scheduled time in their own time zone. One tap to approve. It's saved, and it moves on to the next one." |
| **0:56–1:10** | Phone | On post 3, tap **Request changes**. An amber **"Changes requested · Saved"** row appears with the comment box "What should Chris change?". Type the comment; the **Saved** indicator shows, with "Saved automatically — you'll send everything at the end". | "Need a change? They say what. It saves automatically. Nothing else to press." |
| **1:10–1:18** | Phone | Tap **Approve all remaining** in the bottom bar (**Step 3**). It reads "6 of 6 reviewed". Tap **Send decisions to …**, and a calm thank-you screen confirms "Sent to …" with the approved / needs-changes counts. | "When they're done, one button sends everything." |
| **1:18–1:30** | Laptop | Refresh `/app`. Under **Your review links**, the new link shows **Needs changes**, 5 of 6 approved. Open it: a plain summary ("5 approved, 1 needs changes. Notes added in Buffer."), per-post status, and the comment. **Back to dashboard** returns you. | "On my side, I see it instantly: five approved, one change, with the comment." |
| **1:30–1:44** | Laptop | Switch to publish.buffer.com, open the post with the change, and show its note: **"✏️ Changes requested by Ngozi: … (via ReviewLink)"**. Then show an approved post's **"✅ Approved by Ngozi via ReviewLink"**. Hold for 2 seconds. | "And every decision is already in Buffer, as a note on the post, written with Buffer's API. No copy-paste." |
| **1:44–1:54** | Laptop | Back on the landing page, scroll to the bottom and click **Under the hood · for developers & judges** to open it, showing the flow diagram and stack cards. | "Under the hood: Buffer's GraphQL API with OAuth and PKCE, read-only on posts, notes write-back, on Next.js, Vercel and Upstash Redis." |
| **1:54–2:00** | Laptop | End card: reviewlink-commit.vercel.app · github.com/AshThunder/reviewlink | "ReviewLink. Try it at reviewlink-commit.vercel.app. Thanks!" |

If you're running long, drop the 0:08–0:18 scroll and say the problem line over the hero.

**Note:** the manager name in "What should … change?" and "Send decisions to …" is the first name on the Buffer account, so it may read differently from "Chris". That's fine; say whatever appears.

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
