import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const records = sqliteTable(
  "records",
  {
    kind: text("kind").notNull(),
    key: text("key").notNull(),
    value: text("value").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.kind, table.key] })],
);
