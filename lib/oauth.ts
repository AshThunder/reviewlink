import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import {
  AUTH_URL,
  BUFFER_SCOPES,
  getClientId,
  getClientSecret,
  getRedirectUri,
  OAUTH_COOKIE,
  PKCE_TTL_SECONDS,
  TOKEN_URL,
} from "./env";
import { seal, unseal } from "./crypto";
import { getJson, getStore, setJson } from "./redis";

export type PkceRecord = {
  state: string;
  verifier: string;
  redirectUri: string;
  createdAt: number;
};

export type TokenSet = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

const TOKEN_ERROR_HINTS: Record<string, string> = {
  invalid_client:
    "The app client secret may be missing or wrong, or the client is not confidential.",
  invalid_grant:
    "The authorization code was already used or expired, or the redirect URI does not match.",
  invalid_scope: "A requested scope is not enabled on this Buffer app client.",
  unsupported_grant_type: "This client is not allowed to use that grant type.",
  access_denied: "You declined access in Buffer.",
};

export function createPkcePair(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function createState(): string {
  return randomBytes(16).toString("base64url");
}

export function buildAuthorizeUrl(opts: {
  state: string;
  codeChallenge: string;
  promptConsent?: boolean;
}): string {
  const url = new URL(AUTH_URL);
  const params: Record<string, string> = {
    client_id: getClientId(),
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: BUFFER_SCOPES,
    state: opts.state,
    code_challenge: opts.codeChallenge,
    code_challenge_method: "S256",
  };
  if (opts.promptConsent) params.prompt = "consent";
  url.search = new URLSearchParams(params).toString();
  return url.toString();
}

export async function persistPkce(record: PkceRecord): Promise<void> {
  await setJson(`oauth:pkce:${record.state}`, record, { ex: PKCE_TTL_SECONDS });
  const jar = await cookies();
  jar.set(OAUTH_COOKIE, seal(record), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: PKCE_TTL_SECONDS,
  });
}

export async function consumePkce(state: string): Promise<PkceRecord | null> {
  const key = `oauth:pkce:${state}`;
  const fromRedis = await getJson<PkceRecord>(key);
  if (fromRedis) {
    await getStore().del(key);
  }
  const jar = await cookies();
  const cookieVal = jar.get(OAUTH_COOKIE)?.value;
  jar.set(OAUTH_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  const fromCookie = cookieVal ? unseal<PkceRecord>(cookieVal) : null;

  const record = fromRedis ?? fromCookie;
  if (!record || record.state !== state) return null;
  if (Date.now() - record.createdAt > PKCE_TTL_SECONDS * 1000) return null;
  return record;
}

async function requestTokens(
  params: Record<string, string>,
  previous?: TokenSet | null,
): Promise<TokenSet> {
  const body = new URLSearchParams({
    client_id: getClientId(),
    client_secret: getClientSecret(),
    ...params,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json().catch(() => ({}))) as TokenResponse;

  if (!res.ok || json.error || !json.access_token) {
    const detail =
      json.error_description || json.error || `HTTP ${res.status}`;
    const hint = json.error ? TOKEN_ERROR_HINTS[json.error] : undefined;
    const error = new Error(hint ? `${detail} — ${hint}` : detail);
    (error as Error & { oauthError?: string }).oauthError = json.error;
    throw error;
  }

  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token || previous?.refreshToken || "",
    scope: json.scope || previous?.scope || "",
    expiresAt: Date.now() + (Number(json.expires_in) || 3600) * 1000 - 30_000,
  };
}

export async function exchangeCodeForTokens(input: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<TokenSet> {
  const tokens = await requestTokens({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.redirectUri,
    code_verifier: input.codeVerifier,
  });
  if (!tokens.refreshToken) {
    throw new Error(
      "Buffer did not return a refresh token. Enable and request the offline_access scope, then Connect Buffer again.",
    );
  }
  return tokens;
}

export async function refreshTokens(previous: TokenSet): Promise<TokenSet> {
  if (!previous.refreshToken) {
    throw new Error("No refresh token is stored. Connect Buffer again.");
  }
  const replacement = await requestTokens(
    {
      grant_type: "refresh_token",
      refresh_token: previous.refreshToken,
    },
    previous,
  );
  if (!replacement.refreshToken) {
    throw new Error("Buffer did not return a replacement refresh token.");
  }
  return replacement;
}

export function oauthErrorMessage(code?: string | null): string {
  if (!code) return "Could not connect to Buffer. Please try again.";
  return TOKEN_ERROR_HINTS[code] || "Could not connect to Buffer. Please try again.";
}
