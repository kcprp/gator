import { defineConfig } from "drizzle-kit";
import { readConfig } from "./src/config"

const url = readConfig().dbUrl;

export default defineConfig({
  schema: "src/db/schema.ts",
  out: "src/db/out",
  dialect: "postgresql",
  dbCredentials: {
    url: url,
  },
});