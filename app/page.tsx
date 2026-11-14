import { Brand } from "@/components/brand";
import { OAuthBanner } from "@/components/oauth-banner";
import { PhonePreview } from "@/components/phone-preview";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { HowBuilt } from "@/components/how-built";

export const dynamic = "force-dynamic";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; reason?: string }>;
}) {
  const { error, reason } = await searchParams;
  const session = await getSession();

  return (
    <div className="landing-page">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="mx-auto flex min-h-dvh w-full max-w-[1120px] flex-col px-6 md:px-12">
        <header className="site-head">
          <Brand />
          <nav className="hidden items-center gap-7 text-[14px] font-medium text-muted md:flex" aria-label="Primary">
            <a href="#how" className="no-underline hover:text-text">How it works</a>
            <a href="#for" className="no-underline hover:text-text">Who it’s for</a>
            <a href="https://github.com/AshThunder/reviewlink" className="no-underline hover:text-text">GitHub</a>
          </nav>
          {session ? (
            <Link href="/app" className="btn btn-dark h-10 text-[14px]">Open dashboard</Link>
          ) : (
            <a href="/api/auth/login" className="btn btn-dark h-10 text-[14px]">Connect Buffer</a>
          )}
        </header>

        <main id="main" className="hero">
          <OAuthBanner error={error} reason={reason} />
          <a href="#how" className="hero-pill anim-fade-up">
            <span className="hero-pill-tag">New</span>
            Client decisions land in Buffer as notes
            <span aria-hidden="true">→</span>
          </a>
          <h1 className="hero-title anim-fade-up">
            Client approval,<br />without a Buffer login.
          </h1>
          <p className="hero-sub anim-fade-up-delay">
            Send one private link. Your client reviews next week’s posts on their phone, taps Approve or Request changes, and you see every decision right inside Buffer.
          </p>
          <div className="hero-ctas anim-fade-up-delay">
            {session ? (
              <Link href="/app" className="btn btn-primary btn-lg">Open your queue</Link>
            ) : (
              <a href="/api/auth/login" className="btn btn-primary btn-lg">Connect Buffer</a>
            )}
            <a href="#how" className="btn btn-secondary btn-lg">See how it works</a>
          </div>
          <p className="hero-note anim-fade-up-late">No account for your client · Works with your Buffer queue · Set up in a minute</p>

          <div className="showcase anim-fade-up-late">
            <div className="showcase-glow" aria-hidden="true" />
            <div className="showcase-inner">
              <PhonePreview />
            </div>
          </div>
        </main>

        <section id="how" aria-labelledby="how-h" className="section-c">
          <span className="eyebrow">How it works</span>
          <h2 id="how-h" className="section-title">Three steps. No new account<br className="hidden sm:block" /> for your client.</h2>
          <ol className="steps mt-7">
            <li className="step">
              <div className="step-art" aria-hidden="true">
                <div className="mini-row"><i className="mini-check on" /><span /></div>
                <div className="mini-row"><i className="mini-check on" /><span /></div>
                <div className="mini-row"><i className="mini-check" /><span className="short" /></div>
              </div>
              <span className="step-n">1</span>
              <h3>Pick your posts</h3>
              <p>Connect Buffer and choose the scheduled posts you want your client to see this week.</p>
            </li>
            <li className="step">
              <div className="step-art" aria-hidden="true">
                <div className="mini-bubble">reviewlink…/r/k3Vq9x</div>
                <div className="mini-bubble mine">Here’s next week — tap to review 🙏</div>
              </div>
              <span className="step-n">2</span>
              <h3>Share one link</h3>
              <p>Send it on WhatsApp or email. Your client opens it on their phone — no login, no app.</p>
            </li>
            <li className="step">
              <div className="step-art" aria-hidden="true">
                <div className="mini-note ok">✓ Approved by Ngozi</div>
                <div className="mini-note ch">✎ Changes: drop the price</div>
              </div>
              <span className="step-n">3</span>
              <h3>Decisions land in Buffer</h3>
              <p>Every approval or change request appears as a note on the post, right where your team works.</p>
            </li>
          </ol>
        </section>

        <section id="for" aria-labelledby="for-h" className="py-16">
          <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-start">
            <div>
              <span className="eyebrow">Who it’s for</span>
              <h2 id="for-h" className="m-0 mt-3 text-[32px] font-bold leading-tight tracking-tight">Anyone who needs a “yes” before posting.</h2>
              <p className="m-0 mt-3 max-w-[40ch] text-[16px] leading-relaxed text-muted">
                Freelance social managers, small agencies, and creators working with a brand, a boss, or a partner who isn’t in Buffer.
              </p>
            </div>
            <ul className="benefits">
              <li><strong>No more screenshot threads</strong><span>One tidy link instead of 12 images in WhatsApp.</span></li>
              <li><strong>Feedback where you work</strong><span>Comments arrive as notes on the exact Buffer post.</span></li>
              <li><strong>See who said yes</strong><span>Every decision carries the reviewer’s name and a clear status.</span></li>
              <li><strong>Built for phones</strong><span>Clients review in a minute, in their own time zone.</span></li>
            </ul>
          </div>
        </section>

        <section className="cta-band my-4">
          <div>
            <h2 className="m-0 text-[24px] font-bold tracking-tight">Get next week approved today.</h2>
            <p className="m-0 mt-1 text-[15px] text-white/85">Works with your existing Buffer account. Set up in about a minute.</p>
          </div>
          {session ? (
            <Link href="/app" className="btn btn-light">Open your queue</Link>
          ) : (
            <a href="/api/auth/login" className="btn btn-light">Connect Buffer</a>
          )}
        </section>

        <div className="py-8">
          <HowBuilt />
          <p className="m-0 mt-4 text-[13px] text-muted">
            🔒 Your client never logs in. Buffer tokens are encrypted and never reach the browser. ReviewLink can’t edit your posts. <a href="/privacy" className="font-medium text-muted underline">Privacy</a>
          </p>
        </div>

        <footer className="flex flex-none flex-wrap items-center justify-between gap-3 border-t border-border py-5 text-[13px] text-muted">
          <span>ReviewLink · Built on the Buffer API · Buffer Commit 2026 · <a href="https://github.com/AshThunder/reviewlink" className="font-medium text-muted">GitHub</a></span>
          <a href="/privacy" className="font-medium text-muted no-underline hover:text-text">
            Privacy
          </a>
        </footer>
      </div>
    </div>
  );
}
