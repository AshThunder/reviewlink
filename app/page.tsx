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
        <header className="flex h-[72px] flex-none items-center justify-between">
          <Brand />
          {session ? (
            <Link href="/app" className="btn btn-secondary h-10 text-[14px]">
              Open dashboard
            </Link>
          ) : (
            <nav className="flex items-center gap-5 text-[13px] font-medium">
              <a href="#how-its-built" className="text-muted no-underline hover:text-text">How it’s built</a>
              <a href="/privacy" className="text-muted no-underline hover:text-text">Privacy</a>
            </nav>
          )}
        </header>

        <main id="main" className="grid flex-1 items-center gap-10 py-6 lg:grid-cols-[1fr_380px] lg:gap-14">
          <div className="anim-fade-up">
            <OAuthBanner error={error} reason={reason} />
            <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-accent">
              For social studios and freelance managers
            </p>
            <h1 className="m-0 mt-3 max-w-[15ch] text-[40px] font-bold leading-[1.12] tracking-tight md:text-[44px]">
              Client approval without a Buffer login.
            </h1>
            <p className="lede m-0 mt-5 max-w-[42ch] text-[18px] leading-relaxed text-muted">
              Share a private link. Your client reviews next week’s posts on their phone, taps Approve or Request changes, and every decision lands back in Buffer as a note.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3">
              {session ? (
                <Link href="/app" className="btn btn-primary">
                  Open your queue
                </Link>
              ) : (
                <a href="/api/auth/login" className="btn btn-primary">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <rect x="1.5" y="1.5" width="15" height="15" rx="4" stroke="white" strokeWidth="1.6" />
                    <path
                      d="M5 9.2 L7.6 11.7 L13 6.4"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Connect Buffer
                </a>
              )}
              <p className="m-0 text-[14px] text-muted">
                <strong className="font-semibold text-text">Your client never needs an account.</strong>{" "}
                Built on the Buffer API · <a href="#how-its-built" className="font-semibold text-accent">How it’s built ↓</a>
              </p>
            </div>
          </div>

          <PhonePreview />
        </main>

        <ol className="mb-8 mt-2 grid list-none grid-cols-1 gap-4 border-t border-border p-0 pt-6 sm:grid-cols-3">
          {[
            ["1", "Connect Buffer", "Sign in with OAuth. We pull next week’s scheduled queue."],
            ["2", "Share a private link", "Your client opens it on their phone. No login, no new account."],
            ["3", "Decisions land as Notes", "Approve or request changes — written back onto each post in Buffer."],
          ].map(([n, title, body]) => (
            <li key={n} className="anim-fade-up-late flex items-start gap-3 text-[14px] leading-snug text-muted">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-[8px] bg-accent-soft text-[13px] font-bold text-accent">
                {n}
              </span>
              <span>
                <strong className="mb-0.5 block text-[15px] font-semibold text-text">{title}</strong>
                {body}
              </span>
            </li>
          ))}
        </ol>

        <HowBuilt />

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
