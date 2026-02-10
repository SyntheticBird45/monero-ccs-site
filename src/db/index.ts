import { DatabaseSync } from "node:sqlite";
import { Kysely } from "kysely";
import {
  buildQueryFn,
  GenericSqliteDialect,
  parseBigInt,
} from "kysely-generic-sqlite";
const DB_PATH = Deno.env.get("DB_PATH") || "./data/ccs.db";
import type { IGenericSqlite } from "kysely-generic-sqlite";
import type { Database } from "./schema.ts";

function createSqliteExecutor(db: DatabaseSync): IGenericSqlite<DatabaseSync> {
  return {
    db,
    query: buildQueryFn({
      all: (sql, parameters = []) => db.prepare(sql).all(...parameters),
      run: (sql, parameters = []) => {
        const stmt = db.prepare(sql);
        stmt.setReadBigInts(true);
        const { changes, lastInsertRowid } = stmt.run(...parameters);
        return {
          insertId: parseBigInt(lastInsertRowid),
          numAffectedRows: parseBigInt(changes),
        };
      },
    }),
    close: () => db.close(),
    iterator: (isSelect, sql, parameters = []) => {
      if (!isSelect) {
        throw new Error("Only support select in stream()");
      }
      return db.prepare(sql).iterate(...parameters);
    },
  };
}

const db = new Kysely<Database>({
  dialect: new GenericSqliteDialect(
    () => {
      const raw = new DatabaseSync(DB_PATH);
      raw.exec("PRAGMA journal_mode = WAL");
      raw.exec("PRAGMA foreign_keys = ON");
      return createSqliteExecutor(raw);
    },
  ),
});

export default db;
