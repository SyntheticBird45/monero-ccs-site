import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.ts";

const DB_PATH = Deno.env.get("DB_PATH") || "./data/ccs.db";

const raw = new DatabaseSync(DB_PATH);
raw.exec("PRAGMA journal_mode = WAL");
raw.exec("PRAGMA synchronous = NORMAL");
raw.exec("PRAGMA busy_timeout = 5000");
raw.exec("PRAGMA foreign_keys = ON");

// Adapts node:sqlite to the better-sqlite3 API surface Drizzle uses.
// This is a bit hacky, but it prevents us from requiring FFI permissions in Deno, which would be a security risk.
const client = {
  prepare(sql: string) {
    const stmt = raw.prepare(sql);
    let asArrays = false;
    const w = {
      raw() {
        asArrays = true;
        return w;
      },
      run(...p: SQLInputValue[]) {
        stmt.setReadBigInts(true);
        const result = stmt.run(...p);
        stmt.setReadBigInts(false);
        return result;
      },
      all(...p: SQLInputValue[]) {
        const rows = stmt.all(...p);
        return asArrays ? rows.map((r) => Object.values(r as object)) : rows;
      },
      get(...p: SQLInputValue[]) {
        const row = stmt.get(...p);
        return asArrays && row ? Object.values(row as object) : row;
      },
    };
    return w;
  },
  transaction<T>(fn: (...args: unknown[]) => T) {
    const run = () => {
      raw.exec("BEGIN");
      try {
        const r = fn();
        raw.exec("COMMIT");
        return r;
      } catch (e) {
        raw.exec("ROLLBACK");
        throw e;
      }
    };
    return { deferred: run, immediate: run, exclusive: run };
  },
};

const db = drizzle(client as never, { schema });

export { client };
export default db;
