import { createHash } from "node:crypto";

export const AUTH_URL = "https://auth.buffer.com/auth";
export const TOKEN_URL = "https://auth.buffer.com/token";
export const API_URL = "https://api.buffer.com";

export const BUFFER_SCOPES = [
  "account:read",
  "channels:read",
  "posts:read",
  "notes:read",
  "notes:write",
  "offline_access",
].join(" ");

export const SESSION_COOKIE = "__Host-rl_session";
export const OAUTH_COOKIE = "__Host-rl_oauth";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
export const PKCE_TTL_SECONDS = 60 * 10;

function read(name: string): string {
  return (process.env[name] ?? "").trim();
}

export function getClientId(): string {
  const id = read("BUFFER_CLIENT_ID");
  if (!id) throw new Error("BUFFER_CLIENT_ID is not set");
  return id;
}

export function getClientSecret(): string {
  const secret = read("BUFFER_CLIENT_SECRET");
  if (!secret) throw new Error("BUFFER_CLIENT_SECRET is not set");
  return secret;
}

export function getAppUrl(): string {
  const explicit = read("APP_URL");
  if (explicit) return explicit.replace(/\/$/, "");
  const prod = read("VERCEL_PROJECT_PRODUCTION_URL");
  if (prod) {
    return prod.startsWith("http") ? prod.replace(/\/$/, "") : `https://${prod}`;
  }
  return "https://reviewlink-commit.vercel.app";
}

export function getRedirectUri(): string {
  const fromEnv = read("BUFFER_REDIRECT_URI");
  if (fromEnv) return fromEnv;
  return `${getAppUrl()}/api/auth/callback`;
}

export function getSessionSecret(): string {
  const secret = read("SESSION_SECRET");
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

/** 32-byte AES-256 key. Accepts 64-char hex, 32-byte base64, or any string (SHA-256). */
export function getTokenKey(): Buffer {
  const raw = read("TOKEN_ENC_KEY") || read("TOKEN_ENCRYPTION_KEY");
  if (!raw) throw new Error("TOKEN_ENC_KEY is not set");
  if (/^[0-9a-f]{64}$/i.test(raw)) return Buffer.from(raw, "hex");
  try {
    const b64 = Buffer.from(raw, "base64");
    if (b64.length === 32) return b64;
  } catch {
    /* fall through */
  }
  return createHash("sha256").update(raw).digest();
}

export function hasRedisEnv(): boolean {
  const url = read("UPSTASH_REDIS_REST_URL") || read("KV_REST_API_URL");
  const token = read("UPSTASH_REDIS_REST_TOKEN") || read("KV_REST_API_TOKEN");
  return Boolean(url && token);
}

export function isProductionRuntime(): boolean {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}
