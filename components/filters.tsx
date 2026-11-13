"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { BufferChannel } from "@/lib/buffer";
import { serviceLabel } from "./service-icon";
import { DEFAULT_WEEK } from "@/lib/dates";

export function Filters({
  channels,
  selectedChannelId,
}: {
  channels: BufferChannel[];
  selectedChannelId?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (!v) next.delete(k);
      else next.set(k, v);
    }
    startTransition(() => {
      router.push(`/app?${next.toString()}`);
    });
  }

  return (
    <div className={`filters mb-5 flex flex-wrap items-end gap-3 ${pending ? "opacity-70" : ""}`}>
      <div className="flex min-w-[240px] flex-col">
        <label htmlFor="channel" className="field-label">
          Channel
        </label>
        <select
          id="channel"
          className="native-select"
          value={selectedChannelId || "all"}
          onChange={(e) =>
            update({ channel: e.target.value === "all" ? null : e.target.value })
          }
        >
          <option value="all">All channels</option>
          {channels.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.displayName || ch.name} · {serviceLabel(ch.service)}
              {ch.isQueuePaused ? " (paused)" : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="flex min-w-[220px] flex-col">
        <label htmlFor="range" className="field-label">
          Date range
        </label>
        <select
          id="range"
          className="native-select"
          defaultValue="week"
          onChange={(e) => {
            if (e.target.value === "week") {
              update({ start: null, end: null });
            } else if (e.target.value === "30") {
              const start = new Date();
              const end = new Date();
              end.setDate(end.getDate() + 30);
              update({ start: start.toISOString(), end: end.toISOString() });
            }
          }}
        >
          <option value="week">{DEFAULT_WEEK.label}</option>
          <option value="30">Next 30 days</option>
        </select>
      </div>
      {pending ? (
        <p className="pb-3 text-[13px] text-muted" aria-live="polite">
          Updating…
        </p>
      ) : null}
    </div>
  );
}
