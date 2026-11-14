import { Brand } from "@/components/brand";
import { OAuthBanner } from "@/components/oauth-banner";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { HowBuilt } from "@/components/how-built";
import { LinkMock, NoteMock, QueueMock, ReviewMock } from "@/components/mockups";

export const dynamic = "force-dynamic";

const REPO = "https://github.com/AshThunder/reviewlink";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reason?: string }>;
}) {
  const { error, reason } = await searchParams;
  const session = await getSession();
  const cta = session ? (
    <Link href="/app" className="btn btn-primary">Open your queue</Link>
  ) : (
    <a href="/api/auth/login" className="btn btn-primary">Connect Buffer</a>
  );

  return (
    <div className="landing-page">
      <a href="#main" className="skip-link">Skip to content</a>
      <div className="lp-wrap">
        <header className="site-head">
          <Brand />
          <nav className="hidden items-center gap-8 text-[15px] md:flex" aria-label="Primary">
            <a href="#how" className="lp-nav">How it works</a>
            <a href="#for" className="lp-nav">Who it’s for</a>
            <a href={REPO} className="lp-nav">GitHub</a>
          </nav>
          {session ? (
            <Link href="/app" className="btn btn-secondary">Dashboard</Link>
          ) : (
            <a href="/api/auth/login" className="btn btn-secondary">Sign in</a>
          )}
        </header>

        <main id="main">
          <section className="lp-hero">
            <OAuthBanner error={error} reason={reason} />
            <p className="lp-eyebrow">For social media managers and small agencies</p>
            <h1 className="lp-h1">Client approval, without a Buffer login.</h1>
            <p className="lp-lead">
              Send your client one private link. They review next week’s posts on their phone, approve or ask for changes, and every decision lands on the post in Buffer.
            </p>
            <div className="lp-ctas">
              {cta}
              <a href="#how" className="btn btn-secondary">See how it works</a>
            </div>
            <p className="lp-fine">Your client never creates an account. ReviewLink can’t edit your posts.</p>
          </section>

          <section className="lp-tile lp-hero-tile" aria-label="Product preview">
            <div className="lp-hero-grid">
              <div className="lp-hero-side">
                <QueueMock />
                <NoteMock />
              </div>
              <ReviewMock />
            </div>
          </section>

          <section id="how" className="lp-section" aria-labelledby="how-h">
            <p className="lp-eyebrow">How it works</p>
            <h2 id="how-h" className="lp-h2">From queue to sign-off in three steps.</h2>
            <div className="lp-steps">
              <article>
                <div className="lp-tile lp-step-tile"><QueueMock /></div>
                <h3 className="lp-h3">1. Pick your posts</h3>
                <p className="lp-body">Connect Buffer and choose the scheduled posts your client should see for the week.</p>
              </article>
              <article>
                <div className="lp-tile lp-step-tile"><LinkMock /></div>
                <h3 className="lp-h3">2. Share one link</h3>
                <p className="lp-body">Send it on WhatsApp or email. It opens on any phone, with no login and no app.</p>
              </article>
              <article>
                <div className="lp-tile lp-step-tile"><NoteMock /></div>
                <h3 className="lp-h3">3. Decisions land in Buffer</h3>
                <p className="lp-body">Each approval or change request appears as a note on the post, where your team already works.</p>
              </article>
            </div>
          </section>

          <section id="for" className="lp-section lp-split" aria-labelledby="for-h">
            <div>
              <p className="lp-eyebrow">Who it’s for</p>
              <h2 id="for-h" className="lp-h2">Anyone who needs a yes before posting.</h2>
              <p className="lp-lead">Freelancers, agencies, and creators working with a brand, a boss, or a partner who isn’t in Buffer.</p>
            </div>
            <dl className="lp-list">
              <div><dt>No more screenshot threads</dt><dd>One tidy link instead of a dozen images in a chat.</dd></div>
              <div><dt>Feedback where you work</dt><dd>Comments arrive as notes on the exact Buffer post.</dd></div>
              <div><dt>Know who said yes</dt><dd>Every decision carries the reviewer’s name and a clear status.</dd></div>
              <div><dt>Made for phones</dt><dd>Clients finish in a minute, in their own time zone.</dd></div>
            </dl>
          </section>

          <section className="lp-tile lp-cta" aria-labelledby="cta-h">
            <div>
              <h2 id="cta-h" className="lp-h3x">Get next week approved today.</h2>
              <p className="lp-body">Works with your existing Buffer account. Set up in about a minute.</p>
            </div>
            {cta}
          </section>

          <section className="lp-under">
            <HowBuilt />
            <p className="lp-fine mt-4">
              Your client never logs in. Buffer tokens are encrypted and never reach the browser. ReviewLink is read-only on your posts.{" "}
              <a href="/privacy" className="underline">Privacy</a>
            </p>
          </section>
        </main>

        <footer className="lp-foot">
          <span>ReviewLink · Built on the Buffer API for Buffer Commit 2026</span>
          <span className="flex gap-6">
            <a href={REPO}>GitHub</a>
            <a href="/privacy">Privacy</a>
          </span>
        </footer>
      </div>
    </div>
  );
}
