export interface D1Result {
  meta?: { changes?: number };
}

export interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results: T[] }>;
  run(): Promise<D1Result>;
}

export interface D1Database {
  prepare(query: string): D1Statement;
}

let database: D1Database | null = null;
let schemaReady: Promise<void> | null = null;

export function setD1Database(next: D1Database | null) {
  if (database !== next) {
    database = next;
    schemaReady = null;
  }
}

export function hasD1Database() {
  return database !== null;
}

async function getDatabase() {
  if (!database) {
    throw new Error("D1 数据库尚未绑定。");
  }

  schemaReady ??= database
    .prepare(
      `CREATE TABLE IF NOT EXISTS records (
        kind TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (kind, key)
      )`,
    )
    .run()
    .then(() => undefined);
  await schemaReady;
  return database;
}

export async function getD1Record<T>(kind: string, key: string) {
  const db = await getDatabase();
  const row = await db
    .prepare("SELECT value FROM records WHERE kind = ? AND key = ?")
    .bind(kind, key)
    .first<{ value: string }>();
  return row ? (JSON.parse(row.value) as T) : null;
}

export async function listD1Records<T>(kind: string) {
  const db = await getDatabase();
  const rows = await db
    .prepare("SELECT value FROM records WHERE kind = ?")
    .bind(kind)
    .all<{ value: string }>();
  return rows.results.map((row) => JSON.parse(row.value) as T);
}

export async function putD1Record<T>(
  kind: string,
  key: string,
  value: T,
  ifAbsent = false,
) {
  const db = await getDatabase();
  const serialized = JSON.stringify(value);
  const updatedAt = new Date().toISOString();
  const statement = ifAbsent
    ? db.prepare(
        "INSERT OR IGNORE INTO records (kind, key, value, updated_at) VALUES (?, ?, ?, ?)",
      )
    : db.prepare(
        "INSERT INTO records (kind, key, value, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(kind, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
      );
  const result = await statement.bind(kind, key, serialized, updatedAt).run();
  return !ifAbsent || (result.meta?.changes ?? 0) > 0;
}

export async function deleteD1Record(kind: string, key: string) {
  const db = await getDatabase();
  await db
    .prepare("DELETE FROM records WHERE kind = ? AND key = ?")
    .bind(kind, key)
    .run();
}
