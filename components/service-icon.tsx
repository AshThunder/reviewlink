const MAP: Record<string, { label: string; bg: string; icon: "ig" | "x" | "in" | "fb" | "tt" | "yt" | "generic" }> = {
  instagram: { label: "Instagram", bg: "#C13584", icon: "ig" },
  threads: { label: "Threads", bg: "#1C1917", icon: "generic" },
  twitter: { label: "X", bg: "#1C1917", icon: "x" },
  x: { label: "X", bg: "#1C1917", icon: "x" },
  linkedin: { label: "LinkedIn", bg: "#0A66C2", icon: "in" },
  facebook: { label: "Facebook", bg: "#1877F2", icon: "fb" },
  tiktok: { label: "TikTok", bg: "#111111", icon: "tt" },
  youtube: { label: "YouTube", bg: "#FF0000", icon: "yt" },
  pinterest: { label: "Pinterest", bg: "#E60023", icon: "generic" },
  bluesky: { label: "Bluesky", bg: "#1185FE", icon: "generic" },
  bsky: { label: "Bluesky", bg: "#1185FE", icon: "generic" },
  mastodon: { label: "Mastodon", bg: "#6364FF", icon: "generic" },
  googlebusiness: { label: "Google", bg: "#188038", icon: "generic" },
  google: { label: "Google", bg: "#188038", icon: "generic" },
  substack: { label: "Substack", bg: "#FF6719", icon: "generic" },
};

export function serviceLabel(service?: string | null): string {
  if (!service) return "Channel";
  const key = service.toLowerCase().replace(/[\s_-]/g, "");
  return MAP[key]?.label ?? service;
}

export function ServiceIcon({
  service,
  size = 20,
}: {
  service?: string | null;
  size?: number;
}) {
  const key = (service || "").toLowerCase().replace(/[\s_-]/g, "");
  const meta = MAP[key] ?? { label: service || "Channel", bg: "#0F766E", icon: "generic" as const };
  const s = Math.round(size * 0.6);
  return (
    <span
      className="inline-grid place-items-center rounded-[6px] text-white flex-none"
      style={{ width: size, height: size, background: meta.bg }}
      title={meta.label}
      aria-hidden="true"
    >
      {meta.icon === "ig" && (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2.4" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2.4" />
          <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
        </svg>
      )}
      {meta.icon === "x" && (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path
            d="M4 4l7.2 8.8L4.6 20h3l5-5.9L17.8 20H20l-7.4-9L19.4 4h-3l-4.6 5.5L8.2 4H4z"
            fill="currentColor"
          />
        </svg>
      )}
      {meta.icon === "in" && (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.5 9H3.7v11h2.8V9zM5.1 3.5A1.65 1.65 0 1 0 5.1 6.8 1.65 1.65 0 0 0 5.1 3.5zM20.3 13.4c0-3.2-1.7-4.7-4-4.7-1.8 0-2.6 1-3.1 1.7V9H10.5c0 1.8 0 11 0 11h2.8v-6.1c0-.3 0-.7.1-1 .3-.7.9-1.5 2-1.5 1.4 0 2 1.1 2 2.6V20h2.8v-6.6z" />
        </svg>
      )}
      {meta.icon === "fb" && (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z" />
        </svg>
      )}
      {meta.icon === "tt" && (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 3v10.2a3.2 3.2 0 1 1-2.2-3.05V7.2A6.3 6.3 0 0 0 8.5 8.1v2.2A3.9 3.9 0 0 1 11 9.8 3.2 3.2 0 1 0 14.8 13V9.3A6.6 6.6 0 0 0 19 10.4V8a6.5 6.5 0 0 1-5-2.3V3h0z" />
        </svg>
      )}
      {meta.icon === "yt" && (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 15.5v-7l6 3.5-6 3.5z" />
        </svg>
      )}
      {meta.icon === "generic" && (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
        </svg>
      )}
    </span>
  );
}
