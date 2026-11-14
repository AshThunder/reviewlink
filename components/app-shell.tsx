import type { ReactNode } from "react";
import { Brand } from "./brand";
import { initials } from "@/lib/dates";

export function AppShell({
  name,
  email,
  orgName,
  children,
}: {
  name?: string | null;
  email?: string | null;
  orgName?: string | null;
  children: ReactNode;
}) {
  const letters = initials(name, "YO");
  return (
    <div className="min-h-dvh bg-bg">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="sticky top-0 z-10 h-16 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-[1120px] items-center justify-between px-4 sm:px-6 md:px-8">
          <Brand href="/app" />
          <div className="flex items-center gap-3">
            <span className="hidden md:block"><span className="chip chip-accent">Buffer connected</span></span>
            <div className="hidden text-right sm:block">
              <div className="text-[14px] font-semibold leading-tight">{name || "Your account"}</div>
              <div className="text-[12px] leading-tight text-muted">
                {orgName || email || "Signed in"}
              </div>
            </div>
            <div
              className="grid h-10 w-10 flex-none place-items-center rounded-full bg-accent text-[13px] font-bold text-white"
              aria-hidden="true"
            >
              {letters}
            </div>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="btn btn-ghost text-[13px]">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div id="main" className="mx-auto max-w-[1120px] px-4 py-5 sm:px-6 md:px-8 md:py-7">
        {children}
      </div>
    </div>
  );
}
