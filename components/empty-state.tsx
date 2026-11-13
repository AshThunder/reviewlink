import type { ReactNode } from "react";

export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 px-6 py-12">
      <div
        className="grid h-11 w-11 place-items-center rounded-[12px] bg-accent-soft text-accent"
        aria-hidden="true"
      >
        {icon ?? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="5" width="16" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <h3 className="m-0 text-[16px] font-semibold tracking-tight">{title}</h3>
      <p className="m-0 max-w-[42ch] text-[14px] leading-relaxed text-muted">{body}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  body,
  retryHref,
}: {
  title?: string;
  body: string;
  retryHref?: string;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-[16px] border border-[#fecaca] bg-[#fef2f2] px-6 py-8"
    >
      <p className="m-0 text-[13px] font-semibold uppercase tracking-wide text-danger">Error</p>
      <h3 className="m-0 text-[16px] font-semibold tracking-tight">{title}</h3>
      <p className="m-0 max-w-[50ch] text-[14px] leading-relaxed text-muted">{body}</p>
      {retryHref ? (
        <a href={retryHref} className="btn btn-secondary mt-1">
          Try again
        </a>
      ) : null}
    </div>
  );
}

export function PostSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-hidden="true" className="flex flex-col">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="skeleton h-14 w-[72px] flex-none" />
          <div className="flex-1">
            <div className="skeleton mb-2 h-3 w-40" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton mt-1.5 h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
