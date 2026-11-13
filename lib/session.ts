import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from "./env";
import { randomId } from "./crypto";
import { getJson, getStore, setJson } from "./redis";

export type Session = {
  sid: string;
  accountId: string;
  organizationId: string | null;
  createdAt: number;
};

type SessionRecord = {
  accountId: string;
  organizationId: string | null;
  createdAt: number;
};

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const sid = jar.get(SESSION_COOKIE)?.value;
  if (!sid) return null;
  const record = await getJson<SessionRecord>(`session:${sid}`);
  if (!record?.accountId) return null;
  return { sid, ...record };
}

export async function createSession(input: {
  accountId: string;
  organizationId: string | null;
}): Promise<Session> {
  const sid = randomId(32);
  const createdAt = Date.now();
  const record: SessionRecord = {
    accountId: input.accountId,
    organizationId: input.organizationId,
    createdAt,
  };
  await setJson(`session:${sid}`, record, { ex: SESSION_TTL_SECONDS });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sid, cookieOptions(SESSION_TTL_SECONDS));
  return { sid, ...record };
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const sid = jar.get(SESSION_COOKIE)?.value;
  if (sid) await getStore().del(`session:${sid}`);
  jar.set(SESSION_COOKIE, "", cookieOptions(0));
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    const err = new Error("Unauthorized");
    (err as Error & { status: number }).status = 401;
    throw err;
  }
  return session;
}
