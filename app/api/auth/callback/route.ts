import { NextRequest, NextResponse } from "next/server";
import { consumePkce, exchangeCodeForTokens } from "@/lib/oauth";
import { getAccount, saveTokens } from "@/lib/buffer";
import { createSession } from "@/lib/session";
import { storeIsDurable } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(req: NextRequest, reason: string) {
  const url = new URL("/", req.url);
  url.searchParams.set("error", "oauth");
  url.searchParams.set("reason", reason);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const error = url.searchParams.get("error");
  const errorDesc = url.searchParams.get("error_description");
  if (error) {
    console.warn(
      JSON.stringify({ event: "oauth_denied", error, message: errorDesc }),
    );
    return fail(req, error === "access_denied" ? "denied" : "buffer");
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return fail(req, "missing");

  const pkce = await consumePkce(state);
  if (!pkce) return fail(req, "state");

  if (!storeIsDurable() && process.env.VERCEL === "1") {
    return fail(req, "storage");
  }

  try {
    const tokens = await exchangeCodeForTokens({
      code,
      codeVerifier: pkce.verifier,
      redirectUri: pkce.redirectUri,
    });

    // Temporary account lookup: we need the account id to key the tokens.
    // Save under a transient key first? We don't have accountId yet.
    // Use a one-shot GraphQL call with the raw access token.
    const { API_URL } = await import("@/lib/env");
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `query GetAccount {
          account { id email name timezone organizations { id name } }
        }`,
      }),
    });
    const json = (await res.json().catch(() => null)) as {
      data?: {
        account?: {
          id: string;
          organizations?: { id: string; name: string }[];
        };
      };
      errors?: { message: string }[];
    } | null;
    const account = json?.data?.account;
    if (!res.ok || !account?.id) {
      console.error(
        JSON.stringify({
          event: "oauth_account_failed",
          status: res.status,
          message: json?.errors?.[0]?.message,
        }),
      );
      return fail(req, "account");
    }

    await saveTokens(account.id, tokens);
    const organizationId = account.organizations?.[0]?.id ?? null;
    await createSession({ accountId: account.id, organizationId });

    // Confirm the stored session can call the API (and trigger any refresh path).
    try {
      await getAccount(account.id);
    } catch (err) {
      console.warn(
        JSON.stringify({
          event: "oauth_post_login_account_check",
          message: err instanceof Error ? err.message : "unknown",
        }),
      );
    }

    return NextResponse.redirect(new URL("/app", req.url));
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error(JSON.stringify({ event: "oauth_callback_failed", message }));
    if (/invalid_scope|scope/i.test(message)) return fail(req, "scope");
    if (/invalid_grant|redirect/i.test(message)) return fail(req, "grant");
    return fail(req, "exchange");
  }
}
