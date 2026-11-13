import type { Metadata } from "next";
import { Brand } from "@/components/brand";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How ReviewLink handles your Buffer data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-[720px] items-center px-6">
          <Brand />
        </div>
      </header>
      <main className="mx-auto max-w-[720px] px-6 py-12">
        <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-accent">
          Privacy
        </p>
        <h1 className="m-0 mt-2 text-[32px] font-bold tracking-tight">How ReviewLink uses your data</h1>
        <p className="mt-3 text-[14px] text-muted">Last updated 13 November 2026.</p>

        <div className="mt-10 space-y-8 text-[16px] leading-relaxed text-text">
          <section>
            <h2 className="m-0 text-[20px] font-semibold">What this app is</h2>
            <p className="mt-2 text-muted">
              ReviewLink is a Buffer Commit 2026 entry. It helps a social media manager share a private, no-login link so a client can approve scheduled Buffer posts. It is an independent project, not an official Buffer product.
            </p>
          </section>
          <section>
            <h2 className="m-0 text-[20px] font-semibold">What we collect</h2>
            <p className="mt-2 text-muted">
              When you click Connect Buffer, ReviewLink receives an OAuth grant and reads your Buffer account name, email, timezone, organizations, connected channels, and scheduled posts (caption, scheduled time, and media thumbnails). If a client submits a review, we store their decisions and optional comments, and we write those back to Buffer as collaboration Notes on the relevant posts.
            </p>
          </section>
          <section>
            <h2 className="m-0 text-[20px] font-semibold">How we store it</h2>
            <p className="mt-2 text-muted">
              Access and refresh tokens are encrypted (AES-256-GCM) and stored in a private Redis database, keyed by your Buffer account. Your session cookie holds only a random session id — never a Buffer token. Review-link URLs use an unguessable 128-bit token, stored as a SHA-256 hash. Links expire after 30 days. We do not log Authorization headers, tokens, or raw review-link tokens.
            </p>
          </section>
          <section>
            <h2 className="m-0 text-[20px] font-semibold">Who we share it with</h2>
            <p className="mt-2 text-muted">
              We send API requests only to Buffer (<code>auth.buffer.com</code> and <code>api.buffer.com</code>) to act on your behalf. We do not sell your data. A person with a review-link URL can see the snapshot of posts you chose to share, plus the client name you entered — not your Buffer login, and not your access tokens.
            </p>
          </section>
          <section>
            <h2 className="m-0 text-[20px] font-semibold">How long we keep it</h2>
            <p className="mt-2 text-muted">
              Sessions last 7 days of inactivity. Review links expire after 30 days (or sooner if you revoke them). Logging out ends your session; use “Disconnect Buffer” (when available) or revoke the app in your Buffer settings to drop stored tokens. You can also email the operator and ask for your data to be deleted.
            </p>
          </section>
          <section>
            <h2 className="m-0 text-[20px] font-semibold">Contact</h2>
            <p className="mt-2 text-muted">
              Questions: the operator of this Buffer Commit entry, Eromonsele Michael Osagie. You can revoke ReviewLink at any time from{" "}
              <a href="https://publish.buffer.com/settings" className="text-accent">
                Buffer settings
              </a>
              .
            </p>
          </section>
        </div>

        <p className="mt-12">
          <Link href="/" className="btn btn-secondary">
            Back to ReviewLink
          </Link>
        </p>
      </main>
    </div>
  );
}
