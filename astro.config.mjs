// @ts-check
import { defineConfig, envField } from "astro/config";
import deno from "@deno/astro-adapter";

// https://astro.build/config
export default defineConfig({
  output: "static",
  adapter: deno(),
  env: {
    schema: {
      DB_PATH: envField.string({
        context: "server",
        access: "secret",
        default: "./data/ccs.db",
      }),
      GITLAB_API_BASE: envField.string({
        context: "server",
        access: "public",
        default:
          "https://repo.getmonero.org/api/v4/projects/monero-project%2Fccs-proposals",
      }),
    },
  },
  security: {
    checkOrigin: true,
  },
});
