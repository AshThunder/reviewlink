"use client";

import { useEffect, useState } from "react";
import { formatDueAt, zoneLabel } from "@/lib/dates";

export function LocalTime({
  iso,
  fallbackTz,
}: {
  iso: string | null;
  fallbackTz?: string | null;
}) {
  const [label, setLabel] = useState(() =>
    iso ? formatDueAt(iso, fallbackTz || "Africa/Lagos") : "Unscheduled",
  );

  useEffect(() => {
    if (!iso) return;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || fallbackTz || "Africa/Lagos";
      setLabel(formatDueAt(iso, tz));
    } catch {
      setLabel(formatDueAt(iso, fallbackTz || "Africa/Lagos"));
    }
  }, [iso, fallbackTz]);

  if (!iso) return <span>Unscheduled</span>;
  return <time dateTime={iso}>{label}</time>;
}

export function viewerZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return zoneLabel(tz);
  } catch {
    return zoneLabel("Africa/Lagos");
  }
}
