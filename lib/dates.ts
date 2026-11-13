/** Default demo window: Mon 16 – Sun 22 Nov 2026, Africa/Lagos (WAT). */
export const DEFAULT_WEEK = {
  startIso: "2026-11-16T00:00:00+01:00",
  endIso: "2026-11-22T23:59:59.999+01:00",
  startUtc: new Date("2026-11-16T00:00:00+01:00").toISOString(),
  endUtc: new Date("2026-11-22T23:59:59.999+01:00").toISOString(),
  label: "Week of 16–22 Nov 2026",
} as const;

const ZONE_LABELS: Record<string, string> = {
  "Africa/Lagos": "WAT",
  "Africa/Accra": "GMT",
  "Africa/Nairobi": "EAT",
  "Africa/Johannesburg": "SAST",
  "Europe/London": "UK",
  "America/New_York": "ET",
  "America/Los_Angeles": "PT",
  UTC: "UTC",
};

export function zoneLabel(timezone?: string | null): string {
  const tz = timezone || "Africa/Lagos";
  if (ZONE_LABELS[tz]) return ZONE_LABELS[tz];
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      timeZoneName: "short",
      hour: "numeric",
    }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value || tz;
  } catch {
    return tz;
  }
}

export function formatDueAt(iso: string, timezone?: string | null): string {
  const tz = timezone || "Africa/Lagos";
  try {
    const d = new Date(iso);
    const formatted = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
    return `${formatted} ${zoneLabel(tz)}`;
  } catch {
    return iso;
  }
}

export function weekLabel(startIso: string, endIso: string, timezone = "Africa/Lagos"): string {
  try {
    const start = new Date(startIso);
    const end = new Date(endIso);
    const day = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, day: "numeric" });
    const month = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, month: "short" });
    const year = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, year: "numeric" });
    return `Week of ${day.format(start)}–${day.format(end)} ${month.format(start)} ${year.format(start)}`;
  } catch {
    return DEFAULT_WEEK.label;
  }
}

export function initials(name: string | null | undefined, fallback = "RL"): string {
  if (!name?.trim()) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}
