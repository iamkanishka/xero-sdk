import type { XeroToken } from "./Token.js";
import type * as NodeFsPromises from "node:fs/promises";

/**
 * The port for persisting tokens, keyed by an arbitrary
 * application-defined key (typically `userId` or `userId:tenantId`).
 * Implement this against Redis/Postgres/your session store for
 * production multi-instance deployments; {@link MemoryTokenStore} and
 * {@link FileTokenStore} are provided for local development and
 * single-instance apps.
 */
export interface TokenStore {
  put(key: string, token: XeroToken): Promise<void>;
  get(key: string): Promise<XeroToken | undefined>;
  delete(key: string): Promise<void>;
  keys(): Promise<string[]>;
}

/**
 * Thread-safe (single-process) in-memory {@link TokenStore}. The
 * default store used when none is configured. State is lost on
 * process restart.
 */
export class MemoryTokenStore implements TokenStore {
  private readonly data = new Map<string, XeroToken>();

  put(key: string, token: XeroToken): Promise<void> {
    this.data.set(key, token);
    return Promise.resolve();
  }

  get(key: string): Promise<XeroToken | undefined> {
    return Promise.resolve(this.data.get(key));
  }

  delete(key: string): Promise<void> {
    this.data.delete(key);
    return Promise.resolve();
  }

  keys(): Promise<string[]> {
    return Promise.resolve([...this.data.keys()]);
  }
}

/**
 * A simple {@link TokenStore} that persists tokens as JSON on local
 * disk (Node.js only — dynamically imports `node:fs/promises`, so this
 * class is safe to reference from code that also runs in browsers as
 * long as {@link FileTokenStore.create} itself is never called there).
 * One file per store, guarded by an in-process write queue.
 */
export class FileTokenStore implements TokenStore {
  private writeQueue: Promise<unknown> = Promise.resolve();

  private constructor(
    private readonly path: string,
    private readonly fs: typeof NodeFsPromises,
  ) {}

  static async create(path: string): Promise<FileTokenStore> {
    const fs = await import("node:fs/promises");
    const dir = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
    if (dir) await fs.mkdir(dir, { recursive: true });
    const store = new FileTokenStore(path, fs);
    try {
      await fs.access(path);
    } catch {
      await store.writeAll({});
    }
    return store;
  }

  private async readAll(): Promise<Record<string, XeroToken>> {
    try {
      const raw = await this.fs.readFile(this.path, "utf8");
      if (!raw) return {};
      return JSON.parse(raw) as Record<string, XeroToken>;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return {};
      throw err;
    }
  }

  private async writeAll(data: Record<string, XeroToken>): Promise<void> {
    const tmp = `${this.path}.tmp`;
    await this.fs.writeFile(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
    await this.fs.rename(tmp, this.path);
  }

  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const result = this.writeQueue.then(fn, fn);
    this.writeQueue = result.catch(() => undefined);
    return result;
  }

  put(key: string, token: XeroToken): Promise<void> {
    return this.enqueue(async () => {
      const all = await this.readAll();
      all[key] = token;
      await this.writeAll(all);
    });
  }

  get(key: string): Promise<XeroToken | undefined> {
    return this.enqueue(async () => {
      const all = await this.readAll();
      return all[key];
    });
  }

  delete(key: string): Promise<void> {
    return this.enqueue(async () => {
      const all = await this.readAll();
      delete all[key];
      await this.writeAll(all);
    });
  }

  keys(): Promise<string[]> {
    return this.enqueue(async () => Object.keys(await this.readAll()));
  }
}
