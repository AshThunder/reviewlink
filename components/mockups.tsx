/* Product mockups used on the landing page. Pure HTML/CSS, no images. */

function Check({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.2 L6.4 11.5 L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ReviewMock() {
  return (
    <div className="mk-phone" aria-hidden="true">
      <div className="mk-phone-top">
        <span className="mk-muted">Teni shared 6 posts</span>
        <strong className="mk-title">Casa Lekki</strong>
        <span className="mk-muted">Week of 16–22 Nov</span>
      </div>
      <div className="mk-card is-ok">
        <div className="mk-post-head"><span className="mk-avatar">CL</span><span><b>Casa Lekki</b><br /><span className="mk-muted">@CasaLekki</span></span></div>
        <p className="mk-text">Monday starts with our ₦2,500 jollof rice bowl and a cold zobo. Walk-ins welcome at Admiralty Way.</p>
        <span className="mk-muted mk-small">Mon 16 Nov, 9:00 am WAT</span>
        <div className="mk-state ok"><span><Check /> Approved · Saved</span><u>Change</u></div>
      </div>
      <div className="mk-card is-ch">
        <p className="mk-text">Saturday brunch is on. Bottomless zobo and our ₦6,500 asun platter.</p>
        <div className="mk-state ch"><span>Changes requested · Saved</span><u>Change</u></div>
        <div className="mk-comment">Can we drop the price and say “weekend platter”?</div>
      </div>
      <div className="mk-bar">
        <span className="mk-small"><b>6 of 6 reviewed</b></span>
        <span className="mk-send">Send decisions to Teni</span>
      </div>
    </div>
  );
}

export function QueueMock() {
  const rows = [
    ["Mon 16 Nov · 9:00", "Monday starts with our ₦2,500 jollof rice bowl…", true],
    ["Tue 17 Nov · 12:30", "New: the ₦1,800 puff-puff and chocolate combo…", true],
    ["Wed 18 Nov · 16:00", "Saturday brunch is on. Bottomless zobo…", true],
    ["Thu 19 Nov · 8:00", "Rain or shine, the espresso machine is on…", false],
  ] as const;
  return (
    <div className="mk-panel" aria-hidden="true">
      <div className="mk-panel-head"><b>Scheduled posts</b><span className="mk-muted">3 of 4 selected</span></div>
      {rows.map(([when, text, on]) => (
        <div key={when} className="mk-row">
          <span className={`mk-box ${on ? "on" : ""}`}>{on ? <Check size={11} /> : null}</span>
          <span className="mk-avatar sm">CL</span>
          <span className="min-w-0"><span className="mk-muted mk-small">{when}</span><span className="mk-line">{text}</span></span>
        </div>
      ))}
      <div className="mk-panel-foot"><span className="mk-send">Create review link</span></div>
    </div>
  );
}

export function LinkMock() {
  return (
    <div className="mk-panel" aria-hidden="true">
      <div className="mk-panel-head"><b>Review link ready</b><span className="mk-muted">Expires in 30 days</span></div>
      <div className="mk-url">reviewlink-commit.vercel.app/r/k3Vq9xT2mLp8</div>
      <div className="mk-actions"><span className="mk-send">Copy link</span><span className="mk-sec">WhatsApp</span></div>
    </div>
  );
}

export function NoteMock() {
  return (
    <div className="mk-panel" aria-hidden="true">
      <div className="mk-panel-head"><b>Notes on this post</b><span className="mk-muted">Buffer</span></div>
      <div className="mk-note"><span className="mk-avatar sm">RL</span><span><span className="mk-small mk-muted">ReviewLink · just now</span><span className="mk-line">✅ Approved by Ngozi via ReviewLink</span></span></div>
      <div className="mk-note"><span className="mk-avatar sm">RL</span><span><span className="mk-small mk-muted">ReviewLink · just now</span><span className="mk-line">✏️ Changes requested by Ngozi: drop the price (via ReviewLink)</span></span></div>
    </div>
  );
}

export function ConnectMock() {
  return (
    <div className="mk-panel" aria-hidden="true">
      <div className="mk-panel-head"><b>Connect to Buffer</b><span className="mk-muted">buffer.com</span></div>
      <div className="mk-perm">
        <span className="mk-muted mk-small">ReviewLink would like to</span>
        <span className="mk-line"><Check size={12} /> Read your scheduled posts</span>
        <span className="mk-line"><Check size={12} /> Add notes to posts</span>
      </div>
      <div className="mk-actions"><span className="mk-sec">Cancel</span><span className="mk-send">Allow</span></div>
    </div>
  );
}
