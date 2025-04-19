// src/data/env/server.ts
import { z } from "zod";

const envSchema = z.object({
  REDIS_URL: z.string().url(),
  REDIS_TOKEN: z.string().min(1),
});

export const env = envSchema.parse({
  REDIS_URL: process.env.REDIS_URL,
  REDIS_TOKEN: process.env.REDIS_TOKEN,
});
