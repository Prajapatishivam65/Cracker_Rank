import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema"; // Import your schema file (adjust the path as needed)

const sql = neon(
  "postgresql://neondb_owner:npg_T8QflSVbeOi0@ep-curly-morning-a1kqpwbb-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
);
export const db = drizzle(sql, { schema });
