const REPO = "https://github.com/AshThunder/reviewlink";

function Code({ children }: { children: React.ReactNode }) {
  return <code className="kbd-code">{children}</code>;
}

const FLOW = [
  { k: "manager", title: "Manager", sub: "Connect Buffer" },
  { k: "oauth", title: "Buffer OAuth", sub: "Code + PKCE" },
  { k: "app", title: "ReviewLink", sub: "Snapshot queue" },
  { k: "link", title: "Client link", sub: "/r/<128-bit>" },
  { k: "decide", title: "Decisions", sub: "Approve · Changes" },
  { k: "notes", title: "Buffer Notes", sub: "On each post" },
];

export function HowBuilt() {
  return (
    <section id="how-its-built" aria-labelledby="built-h" className="built border-t border-border py-12">
      <p className="m-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-accent">How it’s built</p>
      <h2 id="built-h" className="m-0 mt-2 max-w-[28ch] text-[30px] font-bold leading-tight tracking-tight">
        A real Buffer API round-trip — read the queue, write the approval back.
      </h2>
      <p className="m-0 mt-3 max-w-[62ch] text-[16px] leading-relaxed text-muted">
        No scraping, no copy-paste. ReviewLink reads scheduled posts through Buffer’s GraphQL API and writes every client decision onto the post as a collaboration note your team already sees in Buffer.
      </p>

      <ol className="flow mt-8" aria-label="Data flow">
        {FLOW.map((f, i) => (
          <li key={f.k} className={`flow-node ${f.k === "app" ? "is-app" : ""} ${f.k === "oauth" || f.k === "notes" ? "is-buffer" : ""}`}>
            <span className="flow-step">{i + 1}</span>
            <strong>{f.title}</strong>
            <span>{f.sub}</span>
            {i < FLOW.length - 1 ? (
              <svg className="flow-arrow" width="28" height="14" viewBox="0 0 28 14" aria-hidden="true">
                <path d="M1 7h23M19 2l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="stack-card">
          <h3>Buffer GraphQL API</h3>
          <ul>
            <li>OAuth 2.0 Authorization Code + <b>PKCE (S256)</b>, confidential client; secret stays server-side.</li>
            <li>Scopes: <Code>account:read</Code> <Code>posts:read</Code> <Code>notes:read</Code> <Code>notes:write</Code> <Code>offline_access</Code> — no <Code>posts:write</Code>, we never touch your posts.</li>
            <li><Code>account</Code> → <Code>channels</Code> → <Code>posts</Code> queries, filtered by <Code>dueAt</Code> to the week you pick.</li>
            <li><Code>createCollaborationNote</Code> with <Code>subject: {"{ postId }"}</Code> for each decision.</li>
            <li><Code>collaborationNotes</Code> read-back powers the status view and safe retries.</li>
          </ul>
        </article>
        <article className="stack-card">
          <h3>Next.js on Vercel</h3>
          <ul>
            <li>Next.js App Router, TypeScript, Tailwind CSS.</li>
            <li>Serverless route handlers for OAuth, review links, and decisions — the Buffer token never reaches a browser.</li>
            <li>Edge middleware guards the dashboard.</li>
            <li>Mobile-first review page (390px), viewer’s local time with zone label.</li>
          </ul>
        </article>
        <article className="stack-card">
          <h3>Upstash Redis</h3>
          <ul>
            <li>OAuth tokens encrypted at rest with <b>AES-256-GCM</b>.</li>
            <li>Review links: <b>128-bit</b> random tokens, stored only as SHA-256 hashes, 30-day expiry.</li>
            <li>Single-flight lock for rotating refresh tokens; per-review lock so notes are written once.</li>
            <li>Per-link rate limiting on public submissions.</li>
          </ul>
        </article>
      </div>

      <div className="security-strip mt-6" role="note">
        <span>🔒 Client never needs a Buffer login</span>
        <span>Tokens never sent to the browser</span>
        <span>Links revocable any time</span>
        <span>Read-only on posts</span>
        <a href="/privacy">Privacy</a>
      </div>

      <a className="btn btn-secondary mt-6" href={REPO} target="_blank" rel="noopener noreferrer">
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
        </svg>
        View the source on GitHub
      </a>
    </section>
  );
}
