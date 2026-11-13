import { Redis } from "@upstash/redis";
import { hasRedisEnv, isProductionRuntime } from "./env";

export type Store = {
  kind: "redis" | "memory";
  get(key: string): Promise<unknown | null>;
  set(
    key: string,
    value: unknown,
    opts?: { ex?: number; nx?: boolean },
  ): Promise<boolean>;
  del(key: string): Promise<void>;
  zadd(key: string, score: number, member: string): Promise<void>;
  zrevrange(key: string, start: number, stop: number): Promise<string[]>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
};

type MemEntry = { value: unknown; expiresAt: number | null };

function memoryStore(): Store {
  const g = globalThis as unknown as { __reviewlinkMem?: Map<string, MemEntry> };
  if (!g.__reviewlinkMem) g.__reviewlinkMem = new Map();
  const map = g.__reviewlinkMem;

  function read(key: string): MemEntry | null {
    const entry = map.get(key);
    if (!entry) return null;
    if (entry.expiresAt != null && entry.expiresAt < Date.now()) {
      map.delete(key);
      return null;
    }
    return entry;
  }

  return {
    kind: "memory",
    async get(key) {
      return read(key)?.value ?? null;
    },
    async set(key, value, opts) {
      if (opts?.nx && read(key)) return false;
      const expiresAt = opts?.ex ? Date.now() + opts.ex * 1000 : null;
      map.set(key, { value, expiresAt });
      return true;
    },
    async del(key) {
      map.delete(key);
    },
    async zadd(key, score, member) {
      const current = (read(key)?.value as { score: number; member: string }[]) ?? [];
      const next = current.filter((x) => x.member !== member);
      next.push({ score, member });
      const expiresAt = read(key)?.expiresAt ?? null;
      map.set(key, { value: next, expiresAt });
    },
    async zrevrange(key, start, stop) {
      const current = ((read(key)?.value as { score: number; member: string }[]) ?? [])
        .slice()
        .sort((a, b) => b.score - a.score);
      const end = stop < 0 ? current.length : stop + 1;
      return current.slice(start, end).map((x) => x.member);
    },
    async incr(key) {
      const current = Number(read(key)?.value ?? 0) + 1;
      const expiresAt = read(key)?.expiresAt ?? null;
      map.set(key, { value: current, expiresAt });
      return current;
    },
    async expire(key, seconds) {
      const entry = map.get(key);
      if (!entry) return;
      map.set(key, { value: entry.value, expiresAt: Date.now() + seconds * 1000 });
    },
  };
}

function redisStore(): Store {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.KV_REST_API_URL?.trim() ||
    "";
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.KV_REST_API_TOKEN?.trim() ||
    "";
  const redis = new Redis({ url, token });

  return {
    kind: "redis",
    async get(key) {
      return redis.get(key);
    },
    async set(key, value, opts) {
      if (opts?.nx && opts.ex != null) {
        const result = await redis.set(key, value as string, { nx: true, ex: opts.ex });
        return result === "OK";
      }
      if (opts?.nx) {
        const result = await redis.set(key, value as string, { nx: true });
        return result === "OK";
      }
      if (opts?.ex != null) {
        const result = await redis.set(key, value as string, { ex: opts.ex });
        return result === "OK";
      }
      const result = await redis.set(key, value as string);
      return result === "OK";
    },
    async del(key) {
      await redis.del(key);
    },
    async zadd(key, score, member) {
      await redis.zadd(key, { score, member });
    },
    async zrevrange(key, start, stop) {
      const rows = await redis.zrange(key, start, stop, { rev: true });
      return (rows as unknown[]).map(String);
    },
    async incr(key) {
      return redis.incr(key);
    },
    async expire(key, seconds) {
      await redis.expire(key, seconds);
    },
  };
}

let cached: Store | null = null;

export function getStore(): Store {
  if (cached) return cached;
  if (hasRedisEnv()) {
    cached = redisStore();
    return cached;
  }
  if (isProductionRuntime() && process.env.VERCEL === "1") {
    console.warn(
      JSON.stringify({
        event: "reviewlink_memory_store",
        message:
          "No Upstash Redis env vars; using in-memory store. OAuth and sessions will not survive across serverless instances.",
      }),
    );
  }
  cached = memoryStore();
  return cached;
}

export function storeIsDurable(): boolean {
  return hasRedisEnv();
}

export async function getJson<T>(key: string): Promise<T | null> {
  const value = await getStore().get(key);
  if (value == null) return null;
  if (typeof value === "object") return value as T;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }
  return value as T;
}

export async function setJson(
  key: string,
  value: unknown,
  opts?: { ex?: number; nx?: boolean },
): Promise<boolean> {
  return getStore().set(key, value, opts);
}
