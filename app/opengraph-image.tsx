import { ImageResponse } from "next/og";

export const alt = "ReviewLink — Client approval without a Buffer login";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#F7F5F2", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#0F766E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 700 }}><svg width="32" height="32" viewBox="0 0 16 16"><path d="M3 8.2 L6.4 11.5 L13 4.5" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#1C1917" }}>ReviewLink</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, color: "#1C1917", lineHeight: 1.05, letterSpacing: -2 }}>Client approval</div>
          <div style={{ fontSize: 76, fontWeight: 800, color: "#0F766E", lineHeight: 1.05, letterSpacing: -2 }}>without a Buffer login.</div>
          <div style={{ fontSize: 30, color: "#57534E", marginTop: 24 }}>One private link · Approve or request changes · Lands in Buffer as notes</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {["Approved", "Needs changes", "Buffer GraphQL API"].map((t) => (
            <div key={t} style={{ fontSize: 24, fontWeight: 700, padding: "10px 20px", borderRadius: 999, background: t === "Needs changes" ? "#FDE8C8" : "#CCFBF1", color: t === "Needs changes" ? "#92400E" : "#134E4A" }}>{t}</div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
