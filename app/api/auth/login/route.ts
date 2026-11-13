import { NextRequest, NextResponse } from "next/server";
import { buildAuthorizeUrl, createPkcePair, createState, persistPkce } from "@/lib/oauth";
import { getRedirectUri } from "@/lib/env";
import { getStore } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function rateLimited(ip: string): Promise<boolean> {
  const key = `ratelimit:login:${ip}`;
  const store = getStore();
  const n = await store.incr(key);
  if (n === 1) await store.expire(key, 15 * 60);
  return n > 20;
}

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  try {
    if (await rateLimited(clientIp(req))) {
      return NextResponse.redirect(new URL("/?error=rate", origin));
    }

    const { verifier, challenge } = createPkcePair();
    const state = createState();
    const redirectUri = getRedirectUri();
    await persistPkce({
      state,
      verifier,
      redirectUri,
      createdAt: Date.now(),
    });

    const promptConsent = req.nextUrl.searchParams.get("consent") === "1";
    const url = buildAuthorizeUrl({
      state,
      codeChallenge: challenge,
      promptConsent,
    });
    return NextResponse.redirect(url, { status: 302 });
  } catch (err) {
    console.error(
      JSON.stringify({
        event: "oauth_login_failed",
        message: err instanceof Error ? err.message : "unknown",
      }),
    );
    return NextResponse.redirect(new URL("/?error=login", origin));
  }
}
