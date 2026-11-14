const REASONS: Record<string, { title: string; body: string }> = {
  rate: {
    title: "Too many sign-in attempts",
    body: "Please wait a few minutes, then try Connect Buffer again.",
  },
  login: {
    title: "We couldn’t start Buffer sign-in",
    body: "The app may be missing a configuration value. Please try again in a moment.",
  },
  denied: {
    title: "Access was declined",
    body: "ReviewLink needs permission to read your scheduled posts and write Notes. Click Connect Buffer to try again, and choose Allow.",
  },
  state: {
    title: "That sign-in expired",
    body: "The security check (state) didn’t match — often because the page was left open too long, or a cookie was blocked. Please try Connect Buffer again.",
  },
  missing: {
    title: "Buffer didn’t finish authorizing",
    body: "No authorization code came back. Please try Connect Buffer again.",
  },
  exchange: {
    title: "We couldn’t complete the connection",
    body: "Exchanging the authorization code failed. The redirect URI may not match the one registered on your app client, or the code expired.",
  },
  grant: {
    title: "The authorization code couldn’t be used",
    body: "It may have already been used, expired, or the redirect URI doesn’t match character-for-character.",
  },
  scope: {
    title: "Buffer rejected a requested permission",
    body: "We asked for account:read, posts:read, notes:read, notes:write, and offline_access. If a scope isn’t enabled on the app client, it needs to be added — then Connect again.",
  },
  account: {
    title: "Signed in, but we couldn’t load your account",
    body: "Buffer accepted the login, then the account query failed. Please try Connect Buffer again.",
  },
  storage: {
    title: "We can’t store your session yet",
    body: "The Redis database isn’t connected, so a login can’t survive on this server. This needs Upstash Redis on the Vercel project.",
  },
  buffer: {
    title: "Buffer returned an error",
    body: "Please try Connect Buffer again. If it keeps happening, check the app client’s redirect URI.",
  },
  oauth: {
    title: "Could not connect to Buffer",
    body: "Please try again. If you just created the app client, make sure the redirect URI is exactly https://reviewlink-commit.vercel.app/api/auth/callback.",
  },
  auth: {
    title: "Please sign in",
    body: "That page needs a ReviewLink session. Connect Buffer to continue.",
  },
};

export function OAuthBanner({
  error,
  reason,
}: {
  error?: string | null;
  reason?: string | null;
}) {
  if (!error) return null;
  const key = reason || error;
  const copy = REASONS[key] ?? REASONS.oauth!;
  return (
    <div
      role="alert"
      className="anim-fade-up mx-auto mb-6 max-w-[42rem] rounded-[12px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-left"
    >
      <p className="m-0 text-[14px] font-semibold text-danger">{copy.title}</p>
      <p className="m-0 mt-1 text-[13px] leading-relaxed text-muted">{copy.body}</p>
    </div>
  );
}
