import { Brand } from "@/components/brand";
import { OAuthBanner } from "@/components/oauth-banner";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { HowBuilt } from "@/components/how-built";
import { ConnectMock, LinkMock, NoteMock, QueueMock, ReviewMock } from "@/components/mockups";

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
                        <a href={REPO} className="lp-nav">GitHub</a>
          </nav>
          {session ? (
            <Link href="/app" className="btn btn-primary">Dashboard</Link>
          ) : (
            <a href="/api/auth/login" className="btn btn-primary">Connect Buffer</a>
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
            <h2 id="how-h" className="lp-h2">Three steps. About two minutes.</h2>
            <ol className="lp-steps">
              <li>
                <div className="lp-tile lp-step-tile"><ConnectMock /></div>
                <h3 className="lp-h3"><span className="lp-n">1</span>Connect Buffer</h3>
                <p className="lp-body">Sign in with your Buffer account. ReviewLink only reads your scheduled posts.</p>
              </li>
              <li>
                <div className="lp-tile lp-step-tile"><LinkMock /></div>
                <h3 className="lp-h3"><span className="lp-n">2</span>Pick posts and share a link</h3>
                <p className="lp-body">Choose the week’s posts and share one private link however you talk to your client.</p>
              </li>
              <li>
                <div className="lp-tile lp-step-tile"><NoteMock /></div>
                <h3 className="lp-h3"><span className="lp-n">3</span>Your client approves</h3>
                <p className="lp-body">They approve or ask for changes on their phone. Each decision shows up as a note on the post in Buffer.</p>
              </li>
            </ol>
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
