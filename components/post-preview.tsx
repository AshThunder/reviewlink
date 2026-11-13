"use client";

import { ServiceIcon, serviceLabel } from "./service-icon";
import { LocalTime } from "./local-time";
import { initials } from "@/lib/dates";
import type { PublicReview } from "@/lib/review-logic";

type Post = PublicReview["posts"][number];

export function PostPreview({ post }: { post: Post }) {
  const isX = (post.service || "").toLowerCase().includes("twitter") || (post.service || "").toLowerCase() === "x";
  const name = post.displayName || post.handle || serviceLabel(post.service);
  const handle = post.handle || (isX ? "@channel" : null);

  return (
    <div className="tweet">
      {post.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.avatar} alt="" className="tweet-avatar" />
      ) : (
        <div className="tweet-avatar" aria-hidden="true">
          {initials(name, "X")}
        </div>
      )}
      <div className="min-w-0">
        <div className="tweet-head">
          <div>
            <div className="tweet-name">{name}</div>
            {handle ? <div className="tweet-handle">{handle}</div> : null}
          </div>
          <ServiceIcon service={post.service} size={22} />
        </div>
        <p className="tweet-text">{post.text || <span className="italic text-muted">No caption</span>}</p>
        {post.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.thumbnailUrl} alt="" className="tweet-media" />
        ) : null}
        <div className="tweet-time">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 4.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span>
            Scheduled · <LocalTime iso={post.dueAt} fallbackTz={post.timezone} />
          </span>
        </div>
      </div>
    </div>
  );
}
