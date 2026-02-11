import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    // deno-lint-ignore no-process-global
    url: process.env.DB_PATH || "./data/ccs.db",
  },
});
