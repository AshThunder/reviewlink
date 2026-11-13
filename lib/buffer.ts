import { API_URL } from "./env";
import { decrypt, encrypt } from "./crypto";
import { getJson, getStore, setJson } from "./redis";
import { refreshTokens, type TokenSet } from "./oauth";

export class BufferApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status = 502, code?: string) {
    super(message);
    this.name = "BufferApiError";
    this.status = status;
    this.code = code;
  }
}

export type BufferAccount = {
  id: string;
  email: string | null;
  name: string | null;
  timezone: string | null;
  organizations: { id: string; name: string }[];
};

export type BufferChannel = {
  id: string;
  name: string;
  displayName: string;
  service: string;
  avatar: string | null;
  timezone: string | null;
  isQueuePaused: boolean;
  isDisconnected: boolean;
  isLocked: boolean;
};

export type BufferPost = {
  id: string;
  text: string;
  dueAt: string | null;
  status: string;
  channelId: string;
  channelService: string | null;
  channel: {
    id: string;
    displayName: string | null;
    name: string | null;
    service: string | null;
    avatar: string | null;
    timezone: string | null;
  } | null;
  thumbnailUrl: string | null;
};

type StoredOauth = {
  encrypted: true;
  payload: string;
};

const ACCOUNT_QUERY = `
  query GetAccount {
    account {
      id
      email
      name
      timezone
      organizations { id name }
    }
  }
`;

const CHANNELS_QUERY = `
  query GetChannels($organizationId: OrganizationId!) {
    channels(input: { organizationId: $organizationId }) {
      id
      name
      displayName
      service
      avatar
      timezone
      isQueuePaused
      isDisconnected
      isLocked
    }
  }
`;

const CHANNELS_QUERY_MIN = `
  query GetChannels($organizationId: OrganizationId!) {
    channels(input: { organizationId: $organizationId }) {
      id
      name
      displayName
      service
      avatar
      timezone
      isQueuePaused
      isDisconnected
    }
  }
`;

const POSTS_QUERY = `
  query GetScheduledPosts(
    $organizationId: OrganizationId!
    $channelIds: [ChannelId!]
    $start: DateTime
    $end: DateTime
    $after: String
  ) {
    posts(
      first: 50
      after: $after
      input: {
        organizationId: $organizationId
        sort: [{ field: dueAt, direction: asc }]
        filter: {
          status: [scheduled]
          channelIds: $channelIds
          dueAt: { start: $start, end: $end }
        }
      }
    ) {
      edges {
        node {
          id
          text
          dueAt
          status
          channelId
          channelService
          channel { id displayName name service avatar timezone }
          assets {
            thumbnail
            mimeType
            source
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const POSTS_QUERY_SIMPLE = `
  query GetScheduledPosts(
    $organizationId: OrganizationId!
    $channelIds: [ChannelId!]
    $after: String
  ) {
    posts(
      first: 50
      after: $after
      input: {
        organizationId: $organizationId
        sort: [{ field: dueAt, direction: asc }]
        filter: {
          status: [scheduled]
          channelIds: $channelIds
        }
      }
    ) {
      edges {
        node {
          id
          text
          dueAt
          status
          channelId
          channelService
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function saveTokens(accountId: string, tokens: TokenSet): Promise<void> {
  const record: StoredOauth = {
    encrypted: true,
    payload: encrypt(JSON.stringify(tokens)),
  };
  await setJson(`oauth:${accountId}`, record);
}

export async function readTokens(accountId: string): Promise<TokenSet | null> {
  const record = await getJson<StoredOauth | TokenSet>(`oauth:${accountId}`);
  if (!record) return null;
  if ("encrypted" in record && record.encrypted && "payload" in record) {
    try {
      return JSON.parse(decrypt(record.payload)) as TokenSet;
    } catch {
      return null;
    }
  }
  if ("accessToken" in record) return record as TokenSet;
  return null;
}

export async function deleteTokens(accountId: string): Promise<void> {
  await getStore().del(`oauth:${accountId}`);
}

async function withRefreshLock(
  accountId: string,
  fn: () => Promise<TokenSet>,
): Promise<TokenSet> {
  const key = `lock:refresh:${accountId}`;
  const store = getStore();
  for (let i = 0; i < 16; i++) {
    const existing = await readTokens(accountId);
    if (existing && Date.now() < existing.expiresAt) return existing;

    const got = await store.set(key, "1", { nx: true, ex: 10 });
    if (got) {
      try {
        const again = await readTokens(accountId);
        if (again && Date.now() < again.expiresAt) return again;
        return await fn();
      } finally {
        await store.del(key);
      }
    }
    await sleep(150 + Math.random() * 150);
  }
  const last = await readTokens(accountId);
  if (last && Date.now() < last.expiresAt) return last;
  throw new BufferApiError(
    "Could not refresh your Buffer session. Please try again in a moment.",
    401,
  );
}

async function accessToken(accountId: string): Promise<string> {
  const tokens = await readTokens(accountId);
  if (!tokens) {
    throw new BufferApiError("Not connected to Buffer. Please Connect Buffer again.", 401);
  }
  if (Date.now() < tokens.expiresAt) return tokens.accessToken;
  if (!tokens.refreshToken) {
    throw new BufferApiError("Your Buffer session expired. Connect again to continue.", 401);
  }

  const fresh = await withRefreshLock(accountId, async () => {
    try {
      const replacement = await refreshTokens(tokens);
      await saveTokens(accountId, replacement);
      return replacement;
    } catch (err) {
      const code = (err as { oauthError?: string }).oauthError;
      console.warn(JSON.stringify({ event: "buffer_token_refresh_failed", code }));
      throw new BufferApiError(
        "Your Buffer session expired. Connect again to continue.",
        401,
        code,
      );
    }
  });
  return fresh.accessToken;
}

type GraphqlResult<T> = { data: T | null; errors?: { message: string; extensions?: { code?: string } }[] };

async function graphqlOnce<T>(
  accountId: string,
  query: string,
  variables: Record<string, unknown> | undefined,
  token: string,
  backedOff: boolean,
): Promise<T> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json().catch(() => null)) as GraphqlResult<T> | null;

  if (res.status === 401) {
    throw new BufferApiError(
      "Buffer rejected the access token — reconnect.",
      401,
    );
  }

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("Retry-After")) || 0;
    if (!backedOff && retryAfter > 0 && retryAfter <= 5) {
      await sleep(retryAfter * 1000);
      return graphqlOnce<T>(accountId, query, variables, token, true);
    }
    throw new BufferApiError(
      `Buffer API rate limit reached${retryAfter ? ` — try again in ${retryAfter}s` : "."}`,
      429,
    );
  }

  if (!res.ok || json?.errors?.length) {
    const failure = json?.errors?.[0];
    const code = failure?.extensions?.code;
    console.error(
      JSON.stringify({
        event: "buffer_api_error",
        status: res.status,
        code,
        message: failure?.message,
      }),
    );
    const err = new BufferApiError(
      failure?.message
        ? `Buffer could not complete the request: ${failure.message}`
        : "Buffer could not complete the request. Please try again.",
      res.ok ? 502 : res.status,
      code,
    );
    throw err;
  }

  if (!json?.data) {
    throw new BufferApiError("Buffer returned an empty response.", 502);
  }
  return json.data;
}

export async function graphql<T>(
  accountId: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  let token = await accessToken(accountId);
  try {
    return await graphqlOnce<T>(accountId, query, variables, token, false);
  } catch (err) {
    if (err instanceof BufferApiError && err.status === 401) {
      const current = await readTokens(accountId);
      if (current?.refreshToken) {
        try {
          const replacement = await withRefreshLock(accountId, async () => {
            const next = await refreshTokens(current);
            await saveTokens(accountId, next);
            return next;
          });
          token = replacement.accessToken;
          return await graphqlOnce<T>(accountId, query, variables, token, false);
        } catch (inner) {
          throw inner instanceof BufferApiError
            ? inner
            : new BufferApiError("Your Buffer session expired. Connect again to continue.", 401);
        }
      }
    }
    throw err;
  }
}

export async function getAccount(accountId: string): Promise<BufferAccount> {
  const data = await graphql<{ account: BufferAccount }>(accountId, ACCOUNT_QUERY);
  if (!data.account?.id) {
    throw new BufferApiError("Buffer did not return an account.", 502);
  }
  return data.account;
}

export async function getChannels(
  accountId: string,
  organizationId: string,
): Promise<BufferChannel[]> {
  const cacheKey = `channels:${organizationId}`;
  const cached = await getJson<{ at: number; channels: BufferChannel[] }>(cacheKey);
  if (cached && Date.now() - cached.at < 5 * 60 * 1000) return cached.channels;

  const run = async (query: string) => {
    const data = await graphql<{ channels: BufferChannel[] }>(accountId, query, {
      organizationId,
    });
    return (data.channels ?? []).map((ch) => ({
      ...ch,
      isLocked: Boolean(ch.isLocked),
      isDisconnected: Boolean(ch.isDisconnected),
      isQueuePaused: Boolean(ch.isQueuePaused),
    }));
  };

  let channels: BufferChannel[];
  try {
    channels = await run(CHANNELS_QUERY);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (/isLocked|Cannot query|Unknown field|OrganizationId/i.test(msg)) {
      channels = await run(CHANNELS_QUERY_MIN);
    } else {
      throw err;
    }
  }

  await setJson(cacheKey, { at: Date.now(), channels }, { ex: 5 * 60 });
  return channels;
}

type PostsConnection = {
  posts: {
    edges: { node: RawPost }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

type RawPost = {
  id: string;
  text?: string | null;
  dueAt?: string | null;
  status?: string | null;
  channelId?: string | null;
  channelService?: string | null;
  channel?: BufferPost["channel"];
  assets?: { thumbnail?: string | null; mimeType?: string | null; source?: string | null }[] | null;
};

function mapPost(node: RawPost): BufferPost {
  const thumb =
    node.assets?.find((a) => a.thumbnail)?.thumbnail ||
    node.assets?.find((a) => a.source)?.source ||
    null;
  return {
    id: node.id,
    text: node.text ?? "",
    dueAt: node.dueAt ?? null,
    status: node.status ?? "scheduled",
    channelId: node.channelId ?? node.channel?.id ?? "",
    channelService: node.channelService ?? node.channel?.service ?? null,
    channel: node.channel ?? null,
    thumbnailUrl: thumb,
  };
}

export async function getScheduledPosts(input: {
  accountId: string;
  organizationId: string;
  channelIds?: string[];
  start?: string;
  end?: string;
}): Promise<{ posts: BufferPost[]; usedDueAtFilter: boolean; discrepancy?: string }> {
  const variablesBase: Record<string, unknown> = {
    organizationId: input.organizationId,
    channelIds:
      input.channelIds && input.channelIds.length > 0 ? input.channelIds : undefined,
    start: input.start,
    end: input.end,
  };

  const paginate = async (
    query: string,
    variables: Record<string, unknown>,
  ): Promise<BufferPost[]> => {
    const collected: BufferPost[] = [];
    let after: string | undefined;
    for (let i = 0; i < 8; i++) {
      const data: PostsConnection = await graphql<PostsConnection>(
        input.accountId,
        query,
        { ...variables, after },
      );
      const edges = data.posts?.edges ?? [];
      for (const edge of edges) collected.push(mapPost(edge.node));
      if (collected.length >= 100) return collected.slice(0, 100);
      if (!data.posts?.pageInfo?.hasNextPage) break;
      after = data.posts.pageInfo.endCursor ?? undefined;
      if (!after) break;
    }
    return collected;
  };

  try {
    const posts = await paginate(POSTS_QUERY, variablesBase);
    return { posts, usedDueAtFilter: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    console.warn(JSON.stringify({ event: "posts_query_fallback", message: msg }));
    const posts = await paginate(POSTS_QUERY_SIMPLE, {
      organizationId: input.organizationId,
      channelIds: variablesBase.channelIds,
    });
    const start = input.start ? new Date(input.start).getTime() : null;
    const end = input.end ? new Date(input.end).getTime() : null;
    const filtered = posts.filter((p) => {
      if (!p.dueAt) return false;
      const t = new Date(p.dueAt).getTime();
      if (start != null && t < start) return false;
      if (end != null && t > end) return false;
      return true;
    });
    return {
      posts: filtered,
      usedDueAtFilter: false,
      discrepancy: `Primary posts query failed (${msg}); used a simpler query and filtered dueAt locally.`,
    };
  }
}

export function usableChannels(channels: BufferChannel[]): BufferChannel[] {
  return channels.filter((ch) => !ch.isDisconnected && !ch.isLocked);
}
