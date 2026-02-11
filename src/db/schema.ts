import {
  check,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const proposals = sqliteTable("proposals", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  date: text("date").notNull(),
  status: text("status", {
    enum: ["funding-required", "work-in-progress", "completed"],
  }).notNull(),
  target_amount: integer("target_amount"),
  raised_amount: integer("raised_amount").notNull().default(0),
  milestones: integer("milestones"),
  milestones_completed: integer("milestones_completed").notNull().default(0),
  address: text("address"),
  address_uri: text("address_uri"),
  gitlab_url: text("gitlab_url"),
  body_markdown: text("body_markdown"),
  created_at: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
}, (table) => [
  check(
    "status_check",
    sql`${table.status} in ('funding-required', 'work-in-progress', 'completed')`,
  ),
  index("idx_proposals_status").on(table.status),
]);

export const deposits = sqliteTable("deposits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  proposal_id: text("proposal_id")
    .notNull()
    .references(() => proposals.id, { onDelete: "cascade" }),
  tx_id: text("tx_id").notNull(),
  amount: integer("amount").notNull(),
  block_height: integer("block_height"),
  confirmations: integer("confirmations").notNull().default(0),
  detected_at: text("detected_at")
    .notNull()
    .default(sql`(datetime('now'))`),
}, (table) => [
  index("idx_deposits_proposal_id").on(table.proposal_id),
]);

export type Proposal = typeof proposals.$inferSelect;
export type Deposit = typeof deposits.$inferSelect;
