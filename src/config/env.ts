import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3000"),
  MONGODB_URI: z.string().min(1),
  APP_JWT_SECRET: z.string().min(32),
  SEPIDAR_URL: z.string().url(),
  DEFAULT_GENERATION_VERSION: z.string().default("101"),
  ALLOWED_ORIGINS: z.string().optional().default("http://localhost:3000")
});

export const env = schema.parse(process.env);
