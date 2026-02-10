import { sql } from "kysely";
import db from "./index.ts";

async function up() {
  await db.schema
    .createTable("proposals")
    .ifNotExists()
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("author", "text", (col) => col.notNull())
    .addColumn("date", "text", (col) => col.notNull())
    .addColumn("status", "text", (col) =>
      col.notNull().check(
        sql`"status" in ('funding-required', 'work-in-progress', 'completed')`,
      ))
    .addColumn("target_amount", "integer")
    .addColumn("raised_amount", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("milestones", "integer")
    .addColumn(
      "milestones_completed",
      "integer",
      (col) => col.notNull().defaultTo(0),
    )
    .addColumn("address", "text")
    .addColumn("address_uri", "text")
    .addColumn("gitlab_url", "text")
    .addColumn("body_markdown", "text")
    .addColumn(
      "created_at",
      "text",
      (col) => col.notNull().defaultTo(sql`(datetime('now'))`),
    )
    .execute();

  await db.schema
    .createTable("deposits")
    .ifNotExists()
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn(
      "proposal_id",
      "text",
      (col) => col.notNull().references("proposals.id").onDelete("cascade"),
    )
    .addColumn("tx_id", "text", (col) => col.notNull())
    .addColumn("amount", "integer", (col) => col.notNull())
    .addColumn("block_height", "integer")
    .addColumn("confirmations", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn(
      "detected_at",
      "text",
      (col) => col.notNull().defaultTo(sql`(datetime('now'))`),
    )
    .execute();

  await db.schema
    .createIndex("idx_deposits_proposal_id")
    .ifNotExists()
    .on("deposits")
    .column("proposal_id")
    .execute();

  await db.schema
    .createIndex("idx_proposals_status")
    .ifNotExists()
    .on("proposals")
    .column("status")
    .execute();
}

await up();
await db.destroy();
console.log("Database initialized");
