export function PhonePreview() {
  return (
    <div className="relative flex justify-center anim-fade-up-delay">
      <div className="float-card anim-fade-up-late right-[-28px] top-[150px] hidden items-center gap-2 text-[13px] font-semibold sm:flex">
        <span className="chip chip-ok">4 of 6 approved</span>
        <span className="text-[11px] font-medium text-muted">2 need changes</span>
      </div>

      <div className="phone" aria-hidden="true">
        <div className="phone-notch" />
        <div className="phone-screen">
          <div className="px-4 pb-2.5 pt-7">
            <p className="m-0 text-[11px] font-semibold text-muted">Shared by Palm &amp; Ink</p>
            <h2 className="m-0 mt-1 text-[18px] font-bold tracking-tight">Casa Lekki</h2>
            <p className="m-0 mt-0.5 text-[12px] text-muted">Week of Nov 16 – 22</p>
          </div>
          <article className="mx-4 overflow-hidden rounded-[12px] border border-border bg-surface shadow-[0_2px_8px_rgba(28,25,23,0.06)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/jollof.svg"
              alt=""
              className="h-[120px] w-full object-cover"
            />
            <div className="px-3 pb-3 pt-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
                <span className="inline-grid h-5 w-5 place-items-center rounded-[6px] bg-[#C13584] text-white">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2.4" />
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2.4" />
                    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
                  </svg>
                </span>
                Mon 16 · 9:00 AM WAT
              </div>
              <p className="m-0 mt-1.5 text-[12px] leading-snug">
                Monday starts with our ₦2,500 jollof rice bowl and a cold zobo. Walk-ins welcome on Admiralty Way.
              </p>
              <div className="mini-stamp anim-stamp mt-2">Approved</div>
            </div>
          </article>
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-border bg-surface px-4 pb-3.5 pt-2.5">
            <div>
              <p className="m-0 text-[11px] font-semibold">6 of 6 reviewed</p>
              <div className="mt-1 flex gap-1" aria-hidden="true">
                <i className="inline-block h-2 w-2 rounded-full bg-accent" />
                <i className="inline-block h-2 w-2 rounded-full bg-accent" />
                <i className="inline-block h-2 w-2 rounded-full bg-warning" />
                <i className="inline-block h-2 w-2 rounded-full bg-accent" />
                <i className="inline-block h-2 w-2 rounded-full bg-warning" />
                <i className="inline-block h-2 w-2 rounded-full bg-accent" />
              </div>
            </div>
            <span className="btn btn-primary pointer-events-none" style={{ height: 32, padding: "0 12px", fontSize: 12 }}>
              Send decisions
            </span>
          </div>
        </div>
      </div>

      <div className="float-card anim-fade-up-late bottom-[90px] left-[-18px] hidden max-w-[180px] text-[12px] font-semibold sm:block">
        “Can we drop the ₦6,500?”
        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-accent">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4.5 8.2 L7 10.6 L11.7 5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Synced to Buffer as a note
        </div>
      </div>
    </div>
  );
}
