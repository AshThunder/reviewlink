import type { PublicReview } from "./review-logic";

const TIMES = [
  "2026-11-16T08:00:00.000Z", // 9:00 WAT
  "2026-11-17T11:30:00.000Z", // 12:30
  "2026-11-18T15:00:00.000Z", // 16:00
  "2026-11-19T07:00:00.000Z", // 8:00
  "2026-11-20T16:30:00.000Z", // 17:30
  "2026-11-21T09:00:00.000Z", // 10:00
];

const COPY = [
  ["Monday starts with our ₦2,500 jollof rice bowl and a cold zobo. Walk-ins welcome at Admiralty Way, Lekki Phase 1.", "/images/jollof.svg"],
  ["New: the ₦1,800 puff-puff and chocolate combo. Best enjoyed on the terrace, with the lagoon breeze.", "/images/puffpuff.svg"],
  ["Saturday brunch is on. Bottomless zobo, live highlife from 11, and our ₦6,500 asun platter. Book a table — we filled up last weekend by Friday.", "/images/brunch.svg"],
  ["Rain or shine, the espresso machine at Casa Lekki is on from 7am. ₦1,200 for a double shot. See you on Admiralty Way.", "/images/espresso.svg"],
  ["Friday after-work: Palmwine happy hour, 5–8pm. ₦3,000 a calabash, free small chops if you come with a friend from Ikoyi or VI.", "/images/palmwine.svg"],
  ["Our barista, Chinedu, is running a pour-over tasting this Saturday at 10. Limited to 12 seats. DM us, or walk in early.", "/images/pourover.svg"],
];

export function reviewFixture(mode: "open" | "mid" | "submitted" | "expired" = "mid"): PublicReview {
  const mid = mode === "mid" || mode === "submitted";
  const posts: PublicReview["posts"] = COPY.map(([text, img], i) => {
    const decision =
      !mid ? "pending" as const
      : i === 2 || i === 4 ? "changes_requested" as const
      : "approved" as const;
    const comment =
      i === 2
        ? "Can we drop the ₦6,500? Let’s say “weekend platter” and put the price in the first comment instead."
        : i === 4
          ? "Love this. Please add that we have a generator, so rain or NEPA isn’t a worry — people still ask."
          : "";
    return {
      postId: `p${i + 1}`,
      text,
      dueAt: TIMES[i]!,
      service: "twitter",
      displayName: "Casa Lekki",
      handle: "@CasaLekki",
      avatar: null,
      timezone: "Africa/Lagos",
      thumbnailUrl: img,
      decision,
      comment,
    };
  });

  return {
    id: "fixture",
    clientName: "Casa Lekki",
    sharedBy: "Teni",
    rangeStart: "2026-11-16T00:00:00.000Z",
    rangeEnd: "2026-11-22T22:59:59.999Z",
    createdAt: Date.parse("2026-11-13T21:12:00+01:00"),
    expiresAt: Date.parse("2026-12-13T21:12:00+01:00"),
    submittedAt: mode === "submitted" ? Date.parse("2026-11-13T21:14:00+01:00") : null,
    reviewerLabel: mid ? "Ngozi" : null,
    status: mode === "expired" ? "expired" : mode === "submitted" ? "submitted" : "open",
    posts,
  };
}
