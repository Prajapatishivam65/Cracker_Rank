import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_T8QflSVbeOi0@ep-curly-morning-a1kqpwbb-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  },
});
